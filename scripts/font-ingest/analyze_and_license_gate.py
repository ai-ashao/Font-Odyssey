#!/usr/bin/env python3
"""Analyze curated fonts and run the final original-file license gate."""

import argparse
import csv
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

from fontTools.ttLib import TTFont


FONT_SUFFIXES = {".ttf", ".otf", ".woff", ".woff2"}
FILE_FIELDS = [
    "family",
    "relative_path",
    "sha256",
    "size_bytes",
    "format",
    "internal_family",
    "internal_subfamily",
    "postscript_name",
    "weight",
    "width",
    "italic",
    "variable",
    "axes",
    "glyph_count",
    "unicode_codepoint_count",
    "version",
    "copyright",
    "designer",
    "manufacturer",
    "internal_license",
    "internal_license_url",
    "internal_license_state",
    "internal_license_matches",
    "parse_status",
    "error",
]
FAMILY_FIELDS = [
    "family",
    "slug",
    "source_path",
    "source_commit",
    "license",
    "license_sha256_verified",
    "license_metadata_warning_count",
    "reserved_font_names",
    "font_file_count",
    "parsed_font_file_count",
    "style_count",
    "variable_font_count",
    "axes",
    "glyph_count_max",
    "unicode_codepoint_union",
    "latin_coverage",
    "zh_cn_coverage",
    "zh_tw_coverage",
    "japanese_coverage",
    "korean_coverage",
    "cjk_unified_coverage",
    "duplicate_sha_count",
    "duplicate_postscript_count",
    "packaging_warning_count",
    "packaging_status",
    "preview_status",
    "final_status",
    "final_reason",
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def name_value(font: TTFont, name_id: int) -> str:
    if "name" not in font:
        return ""
    try:
        return font["name"].getDebugName(name_id) or ""
    except Exception:
        return ""


def license_matches(license_id: str, text: str, url: str) -> bool:
    content = (text + " " + url).lower()
    if license_id == "OFL-1.1":
        return "open font license" in content and "1.1" in content
    if license_id == "Apache-2.0":
        return "apache" in content and "2.0" in content
    if license_id == "UFL-1.0":
        return "ubuntu font licence" in content and "1.0" in content
    return False


def internal_license_state(license_id: str, text: str, url: str) -> str:
    content = (text + " " + url).strip()
    if not content:
        return "MISSING"
    if license_matches(license_id, text, url):
        return "MATCH"
    known = ("open font license", "apache license", "ubuntu font licence")
    if any(marker in content.lower() for marker in known):
        return "CONFLICT"
    return "UNRECOGNIZED"


def format_name(font: TTFont, path: Path) -> str:
    if getattr(font, "flavor", None):
        return str(font.flavor).upper()
    version = font.sfntVersion
    if version == "OTTO":
        return "OTF/CFF"
    if version in ("\x00\x01\x00\x00", "true", "typ1"):
        return "TTF"
    return path.suffix.lstrip(".").upper() or str(version)


def analyze_font(path: Path, root: Path, family: str, license_id: str) -> Tuple[Dict[str, object], Set[int]]:
    base: Dict[str, object] = {
        "family": family,
        "relative_path": str(path.relative_to(root)),
        "sha256": sha256(path),
        "size_bytes": path.stat().st_size,
        "format": "",
        "internal_family": "",
        "internal_subfamily": "",
        "postscript_name": "",
        "weight": "",
        "width": "",
        "italic": False,
        "variable": False,
        "axes": "[]",
        "glyph_count": 0,
        "unicode_codepoint_count": 0,
        "version": "",
        "copyright": "",
        "designer": "",
        "manufacturer": "",
        "internal_license": "",
        "internal_license_url": "",
        "internal_license_state": "MISSING",
        "internal_license_matches": False,
        "parse_status": "FAILED",
        "error": "",
    }
    try:
        font = TTFont(path, lazy=True, recalcBBoxes=False, recalcTimestamp=False)
        try:
            axes = []
            if "fvar" in font:
                for axis in font["fvar"].axes:
                    axes.append(
                        {
                            "tag": axis.axisTag,
                            "min": axis.minValue,
                            "default": axis.defaultValue,
                            "max": axis.maxValue,
                            "name": name_value(font, axis.axisNameID),
                        }
                    )
            cmap = font.getBestCmap() or {}
            codepoints = set(cmap.keys())
            os2 = font["OS/2"] if "OS/2" in font else None
            head = font["head"] if "head" in font else None
            subfamily = name_value(font, 17) or name_value(font, 2)
            internal_license = name_value(font, 13)
            internal_license_url = name_value(font, 14)
            license_state = internal_license_state(
                license_id, internal_license, internal_license_url
            )
            italic = bool(
                (os2 and int(os2.fsSelection) & 1)
                or (head and int(head.macStyle) & 2)
                or "italic" in subfamily.lower()
            )
            base.update(
                format=format_name(font, path),
                internal_family=name_value(font, 16) or name_value(font, 1),
                internal_subfamily=subfamily,
                postscript_name=name_value(font, 6),
                weight=int(os2.usWeightClass) if os2 else "",
                width=int(os2.usWidthClass) if os2 else "",
                italic=italic,
                variable=bool(axes),
                axes=json.dumps(axes, ensure_ascii=False, sort_keys=True),
                glyph_count=len(font.getGlyphOrder()),
                unicode_codepoint_count=len(codepoints),
                version=name_value(font, 5),
                copyright=name_value(font, 0),
                designer=name_value(font, 9),
                manufacturer=name_value(font, 8),
                internal_license=internal_license,
                internal_license_url=internal_license_url,
                internal_license_state=license_state,
                internal_license_matches=license_matches(
                    license_id, internal_license, internal_license_url
                ),
                parse_status="OK",
            )
            return base, codepoints
        finally:
            font.close()
    except Exception as error:
        base["error"] = f"{type(error).__name__}: {error}"
        return base, set()


def encoded_characters(encoding: str, ranges: Iterable[range]) -> Set[int]:
    result = set()
    for values in ranges:
        for codepoint in values:
            character = chr(codepoint)
            try:
                encoded = character.encode(encoding)
                if encoded:
                    result.add(codepoint)
            except UnicodeEncodeError:
                pass
    return result


def build_charsets() -> Dict[str, Set[int]]:
    cjk = range(0x4E00, 0xA000)
    return {
        "latin": set(range(0x20, 0x7F)),
        "zh_cn": encoded_characters("gb2312", [cjk]),
        "zh_tw": encoded_characters("big5", [cjk]),
        "japanese": encoded_characters(
            "shift_jis", [range(0x3040, 0x3100), cjk]
        ),
        "korean": encoded_characters("euc_kr", [range(0xAC00, 0xD7A4)]),
        "cjk_unified": set(cjk),
    }


def write_charsets(root: Path, charsets: Dict[str, Set[int]]) -> None:
    target = root / "data" / "charsets"
    target.mkdir(parents=True, exist_ok=True)
    names = {
        "latin": "latin-basic.txt",
        "zh_cn": "zh-cn-gb2312-han.txt",
        "zh_tw": "zh-tw-big5-han.txt",
        "japanese": "japanese-shift-jis.txt",
        "korean": "korean-euc-kr-hangul.txt",
        "cjk_unified": "cjk-unified-u4e00-u9fff.txt",
    }
    for key, filename in names.items():
        text = "".join(chr(codepoint) for codepoint in sorted(charsets[key]))
        (target / filename).write_text(text + "\n", encoding="utf-8")
    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "definitions": {
            "latin": "Unicode U+0020-U+007E",
            "zh_cn": "CJK Unified Ideographs encodable by Python gb2312",
            "zh_tw": "CJK Unified Ideographs encodable by Python big5",
            "japanese": "Hiragana, Katakana and CJK characters encodable by Python shift_jis",
            "korean": "Hangul syllables encodable by Python euc_kr",
            "cjk_unified": "Unicode U+4E00-U+9FFF",
        },
        "counts": {key: len(value) for key, value in charsets.items()},
    }
    (target / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def coverage(codepoints: Set[int], charset: Set[int]) -> float:
    return round(len(codepoints & charset) / len(charset), 6) if charset else 0.0


def approval_preview_status(reserved_font_names: str) -> str:
    return "UNAVAILABLE_RFN" if reserved_font_names.strip() else "ELIGIBLE_NOT_GENERATED"


def postscript_duplicate_severity(rows: List[Dict[str, object]]) -> Tuple[str, str]:
    families = {str(row["family"]) for row in rows}
    variable_states = {bool(row["variable"]) for row in rows}
    if len(families) == 1 and variable_states == {False, True}:
        return "WARNING", "VARIABLE_STATIC_NAME_COLLISION"
    return "BLOCKING", "POSTSCRIPT_NAME_COLLISION"


def write_csv(path: Path, fields: List[str], rows: Iterable[Dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_group_report(
    path: Path,
    group_field: str,
    family_rows: List[Dict[str, object]],
    launch_by_family: Dict[str, Dict[str, str]],
) -> None:
    groups: Dict[str, Counter] = defaultdict(Counter)
    for row in family_rows:
        group = (
            str(row[group_field])
            if group_field in row
            else launch_by_family[str(row["family"])][group_field]
        )
        groups[group]["family_count"] += 1
        groups[group][str(row["final_status"]).lower() + "_count"] += 1
    fields = [
        group_field,
        "family_count",
        "approved_count",
        "review_count",
        "rejected_count",
    ]
    rows = []
    for group in sorted(groups):
        counts = groups[group]
        rows.append(
            {
                group_field: group,
                "family_count": counts["family_count"],
                "approved_count": counts["approved_count"],
                "review_count": counts["review_count"],
                "rejected_count": counts["rejected_count"],
            }
        )
    write_csv(path, fields, rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    reports = root / "reports"
    repo = root / "staging" / "google-fonts"
    analysis_root = root / "analysis" / "fonts"
    analysis_root.mkdir(parents=True, exist_ok=True)
    with (reports / "fonts-launch-150.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        launch = list(csv.DictReader(handle))
    with (reports / "fonts-download-inventory.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        inventory = {row["family"]: row for row in csv.DictReader(handle)}
    with (reports / "fonts-download-checksums.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        download_hashes = {
            row["relative_path"]: row["sha256"] for row in csv.DictReader(handle)
        }
    with (reports / "fonts-preflight-allow.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        preflight = {row["family"]: row for row in csv.DictReader(handle)}

    charsets = build_charsets()
    write_charsets(root, charsets)
    all_file_rows: List[Dict[str, object]] = []
    family_work: List[Dict[str, object]] = []
    sha_occurrences: Dict[str, List[Tuple[str, str]]] = defaultdict(list)
    ps_occurrences: Dict[str, List[Tuple[str, str]]] = defaultdict(list)

    for manifest_row in launch:
        family = manifest_row["family"]
        family_dir = repo / manifest_row["source_path"]
        font_paths = sorted(
            path
            for path in family_dir.rglob("*")
            if path.is_file() and path.suffix.lower() in FONT_SUFFIXES
        )
        union: Set[int] = set()
        rows = []
        for path in font_paths:
            row, codepoints = analyze_font(path, root, family, manifest_row["license"])
            expected_hash = download_hashes.get(str(path.relative_to(root)))
            if expected_hash != row["sha256"]:
                row["parse_status"] = "FAILED"
                row["error"] = "DOWNLOAD_CHECKSUM_MISMATCH"
            rows.append(row)
            all_file_rows.append(row)
            union.update(codepoints)
            sha_occurrences[str(row["sha256"])].append(
                (family, str(row["relative_path"]))
            )
            if row["postscript_name"]:
                ps_occurrences[normalize(str(row["postscript_name"]))].append(
                    (family, str(row["relative_path"]))
                )
        family_work.append(
            {
                "manifest": manifest_row,
                "files": rows,
                "codepoints": union,
                "expected_font_count": int(inventory[family]["font_file_count"]),
            }
        )

    duplicate_sha = {
        key: values for key, values in sha_occurrences.items() if len(values) > 1
    }
    duplicate_ps = {
        key: values for key, values in ps_occurrences.items() if len(values) > 1
    }
    file_by_path = {str(row["relative_path"]): row for row in all_file_rows}
    ps_severity = {}
    for key, values in duplicate_ps.items():
        ps_severity[key] = postscript_duplicate_severity(
            [file_by_path[path] for _family, path in values]
        )
    blocking_ps = {
        key for key, (severity, _reason) in ps_severity.items() if severity == "BLOCKING"
    }
    warning_ps = {
        key for key, (severity, _reason) in ps_severity.items() if severity == "WARNING"
    }
    family_rows: List[Dict[str, object]] = []
    duplicate_rows: List[Dict[str, object]] = []
    for kind, groups in (("SHA256", duplicate_sha), ("POSTSCRIPT_NAME", duplicate_ps)):
        for key, values in groups.items():
            severity, duplicate_reason = (
                ("BLOCKING", "IDENTICAL_FILE_BYTES")
                if kind == "SHA256"
                else ps_severity[key]
            )
            for family, path in values:
                duplicate_rows.append(
                    {
                        "kind": kind,
                        "severity": severity,
                        "reason": duplicate_reason,
                        "key": key,
                        "family": family,
                        "relative_path": path,
                    }
                )

    for work in family_work:
        manifest_row = work["manifest"]
        family = manifest_row["family"]
        files = work["files"]
        union = work["codepoints"]
        pf = preflight[family]
        license_path = repo / pf["source_path"] / pf["license_file"]
        license_verified = license_path.is_file() and sha256(license_path) == pf["license_sha256"]
        family_sha_dupes = sum(
            str(row["sha256"]) in duplicate_sha for row in files
        )
        family_ps_dupes = sum(
            normalize(str(row["postscript_name"])) in blocking_ps
            for row in files
            if row["postscript_name"]
        )
        packaging_warnings = sum(
            normalize(str(row["postscript_name"])) in warning_ps
            for row in files
            if row["postscript_name"]
        )
        reasons = []
        parsed_count = sum(row["parse_status"] == "OK" for row in files)
        if parsed_count != work["expected_font_count"]:
            reasons.append("FONT_PARSE_OR_CHECKSUM_FAILURE")
        if not license_verified:
            reasons.append("LICENSE_CHECKSUM_MISMATCH")
        if any(row["internal_license_state"] == "CONFLICT" for row in files):
            reasons.append("INTERNAL_LICENSE_METADATA_CONFLICT")
        if family_sha_dupes:
            reasons.append("DUPLICATE_SHA256")
        if family_ps_dupes:
            reasons.append("DUPLICATE_POSTSCRIPT_NAME")
        final_status = "REVIEW" if reasons else "APPROVED"
        axes = sorted(
            {
                axis["tag"]
                for row in files
                for axis in json.loads(str(row["axes"]))
            }
        )
        family_row: Dict[str, object] = {
            "family": family,
            "slug": manifest_row["slug"],
            "source_path": manifest_row["source_path"],
            "source_commit": inventory[family]["source_commit"],
            "license": manifest_row["license"],
            "license_sha256_verified": license_verified,
            "license_metadata_warning_count": sum(
                row["internal_license_state"] in {"MISSING", "UNRECOGNIZED"}
                for row in files
            ),
            "reserved_font_names": manifest_row["reserved_font_names"],
            "font_file_count": work["expected_font_count"],
            "parsed_font_file_count": parsed_count,
            "style_count": len(files),
            "variable_font_count": sum(bool(row["variable"]) for row in files),
            "axes": ";".join(axes),
            "glyph_count_max": max((int(row["glyph_count"]) for row in files), default=0),
            "unicode_codepoint_union": len(union),
            "latin_coverage": coverage(union, charsets["latin"]),
            "zh_cn_coverage": coverage(union, charsets["zh_cn"]),
            "zh_tw_coverage": coverage(union, charsets["zh_tw"]),
            "japanese_coverage": coverage(union, charsets["japanese"]),
            "korean_coverage": coverage(union, charsets["korean"]),
            "cjk_unified_coverage": coverage(union, charsets["cjk_unified"]),
            "duplicate_sha_count": family_sha_dupes,
            "duplicate_postscript_count": family_ps_dupes,
            "packaging_warning_count": packaging_warnings,
            "packaging_status": (
                "SEPARATE_VARIABLE_STATIC_REQUIRED"
                if packaging_warnings
                else "STANDARD"
            ),
            "preview_status": approval_preview_status(manifest_row["reserved_font_names"]),
            "final_status": final_status,
            "final_reason": ";".join(reasons),
        }
        family_rows.append(family_row)
        detail = dict(family_row)
        detail["files"] = files
        detail["coverage_definitions"] = {
            key: len(value) for key, value in charsets.items()
        }
        target = analysis_root / manifest_row["slug"]
        target.mkdir(parents=True, exist_ok=True)
        (target / "metadata.json").write_text(
            json.dumps(detail, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    write_csv(reports / "fonts-analysis-files.csv", FILE_FIELDS, all_file_rows)
    write_csv(
        reports / "fonts-analysis-failed.csv",
        FILE_FIELDS,
        (row for row in all_file_rows if row["parse_status"] != "OK"),
    )
    write_csv(reports / "fonts-analysis-families.csv", FAMILY_FIELDS, family_rows)
    write_csv(
        reports / "fonts-duplicates.csv",
        ["kind", "severity", "reason", "key", "family", "relative_path"],
        duplicate_rows,
    )
    write_csv(
        reports / "fonts-approved.csv",
        FAMILY_FIELDS,
        (row for row in family_rows if row["final_status"] == "APPROVED"),
    )
    write_csv(
        reports / "fonts-final-review.csv",
        FAMILY_FIELDS,
        (row for row in family_rows if row["final_status"] == "REVIEW"),
    )
    write_csv(
        reports / "fonts-final-rejected.csv",
        FAMILY_FIELDS,
        (row for row in family_rows if row["final_status"] == "REJECT"),
    )
    launch_by_family = {row["family"]: row for row in launch}
    write_group_report(
        reports / "fonts-by-language.csv",
        "language_group",
        family_rows,
        launch_by_family,
    )
    write_group_report(
        reports / "fonts-by-category.csv",
        "category",
        family_rows,
        launch_by_family,
    )
    write_group_report(
        reports / "fonts-by-license.csv",
        "license",
        family_rows,
        launch_by_family,
    )
    statuses = Counter(str(row["final_status"]) for row in family_rows)
    summary = [
        "# Font analysis and final license gate",
        "",
        f"- Generated at: {datetime.now(timezone.utc).isoformat()}",
        "- fontTools: 4.60.2",
        f"- Families analyzed: {len(family_rows)}",
        f"- Font files analyzed: {len(all_file_rows)}",
        f"- File parse failures: {sum(row['parse_status'] != 'OK' for row in all_file_rows)}",
        f"- Final statuses: {json.dumps(dict(statuses), sort_keys=True)}",
        f"- Duplicate groups: SHA256={len(duplicate_sha)}, PostScript={len(duplicate_ps)}",
        f"- Packaging-only PostScript groups: {len(warning_ps)}",
        f"- Internal license metadata warnings: {sum(row['internal_license_state'] in {'MISSING', 'UNRECOGNIZED'} for row in all_file_rows)}",
        f"- Internal license metadata conflicts: {sum(row['internal_license_state'] == 'CONFLICT' for row in all_file_rows)}",
        f"- RFN preview holds: {sum(row['preview_status'] == 'UNAVAILABLE_RFN' for row in family_rows)}",
        "- Gate scope: original-file redistribution engineering check; not legal advice",
        "",
    ]
    (reports / "fonts-final-gate-summary.md").write_text(
        "\n".join(summary), encoding="utf-8"
    )
    print("statuses: " + json.dumps(dict(statuses), sort_keys=True))
    print(f"families: {len(family_rows)}")
    print(f"font files: {len(all_file_rows)}")
    print(f"parse failures: {sum(row['parse_status'] != 'OK' for row in all_file_rows)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, KeyError, ValueError, RuntimeError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
