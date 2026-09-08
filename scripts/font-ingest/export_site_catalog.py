#!/usr/bin/env python3
"""Export final Approved font facts as a deterministic frontend catalog."""

import argparse
import csv
import json
import re
from pathlib import Path


def rows(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def split_values(value: str):
    return [item for item in value.split(";") if item]


def checked_int(row, field: str, minimum: int = 0):
    value = int(row[field])
    if value < minimum:
        raise ValueError(f"{row.get('family', 'font')}: {field} must be >= {minimum}")
    return value


def checked_coverage(row, field: str):
    value = float(row[field])
    if not 0 <= value <= 1:
        raise ValueError(f"{row['family']}: {field} must be between 0 and 1")
    return value


def normalize_preview_status(row, allowed):
    status = row["preview_status"]
    # Compatibility for checked-in pre-V1.1 evidence. A fresh analysis emits
    # UNAVAILABLE_RFN directly, so this branch can go after the next refresh.
    if status == "SKIPPED_LICENSE_REVIEW" and row["reserved_font_names"].strip():
        status = "UNAVAILABLE_RFN"
    if status not in allowed:
        raise ValueError(f"{row['family']}: unsupported preview_status {status!r}")
    if status == "UNAVAILABLE_RFN" and not row["reserved_font_names"].strip():
        raise ValueError(f"{row['family']}: UNAVAILABLE_RFN requires a Reserved Font Name")
    return status


def validate_font(font, approval_schema):
    required = set(approval_schema["required"])
    properties = set(approval_schema["properties"])
    actual = set(font)
    if actual != properties or not required.issubset(actual):
        raise ValueError(
            f"{font.get('family', 'font')}: schema fields differ "
            f"(missing={sorted(required - actual)}, extra={sorted(actual - properties)})"
        )
    if font["finalStatus"] != "APPROVED":
        raise ValueError(f"{font['family']}: finalStatus must be APPROVED")
    if font["licenseSha256Verified"] is not True:
        raise ValueError(f"{font['family']}: license checksum must be verified")
    if not re.fullmatch(r"[a-z0-9]+", font["slug"]):
        raise ValueError(f"{font['family']}: invalid slug")
    if not re.fullmatch(r"[0-9a-f]{40}", font["sourceCommit"]):
        raise ValueError(f"{font['family']}: sourceCommit must be a full Git SHA")
    for field in ("category", "license"):
        allowed = approval_schema["properties"][field]["enum"]
        if font[field] not in allowed:
            raise ValueError(f"{font['family']}: unsupported {field} {font[field]!r}")
    for field in ("subsets", "reservedFontNames", "axes"):
        if len(font[field]) != len(set(font[field])):
            raise ValueError(f"{font['family']}: duplicate value in {field}")


def build_catalog(root: Path):
    source = root / "data" / "font-catalog"
    schema = json.loads((root / "src" / "data" / "font-publishing.schema.json").read_text(encoding="utf-8"))
    approval_schema = schema["$defs"]["fontApprovalFacts"]
    allowed_previews = set(schema["$defs"]["previewStatus"]["enum"])
    launch = {row["family"]: row for row in rows(source / "fonts-launch-150.csv")}
    approved = rows(source / "fonts-approved.csv")
    fonts = []
    seen_slugs = set()
    seen_ranks = set()
    for gate in approved:
        if gate["final_status"] != "APPROVED":
            raise ValueError(f"{gate['family']}: non-APPROVED row in fonts-approved.csv")
        if gate["family"] not in launch:
            raise ValueError(f"{gate['family']}: missing launch curation row")

    for gate in sorted(approved, key=lambda row: int(launch[row["family"]]["curation_rank"])):
        item = launch[gate["family"]]
        if item["slug"] != gate["slug"]:
            raise ValueError(f"{gate['family']}: launch and approval slugs differ")
        rank = checked_int(item, "curation_rank", 1)
        slug = item["slug"]
        if slug in seen_slugs:
            raise ValueError(f"{gate['family']}: duplicate slug {slug}")
        if rank in seen_ranks:
            raise ValueError(f"{gate['family']}: duplicate curation rank {rank}")
        seen_slugs.add(slug)
        seen_ranks.add(rank)
        font = {
            "curationRank": rank,
            "family": item["family"],
            "slug": slug,
            "category": item["category"],
            "languageGroup": item["language_group"],
            "subsets": split_values(item["subsets"]),
            "officialPopularityRank": checked_int(item, "official_popularity_rank", 1),
            "styleCount": checked_int(item, "style_count", 1),
            "variableAxisCount": checked_int(item, "variable_axis_count"),
            "fontFileCount": checked_int(gate, "font_file_count", 1),
            "parsedFontFileCount": checked_int(gate, "parsed_font_file_count", 1),
            "variableFontCount": checked_int(gate, "variable_font_count"),
            "sourcePath": gate["source_path"],
            "sourceCommit": gate["source_commit"],
            "license": gate["license"],
            "licenseSha256Verified": gate["license_sha256_verified"].lower() == "true",
            "reservedFontNames": split_values(gate["reserved_font_names"]),
            "axes": split_values(gate["axes"]),
            "glyphCountMax": checked_int(gate, "glyph_count_max", 1),
            "unicodeCodepointUnion": checked_int(gate, "unicode_codepoint_union", 1),
            "coverage": {
                "latin": checked_coverage(gate, "latin_coverage"),
                "zhCN": checked_coverage(gate, "zh_cn_coverage"),
                "zhTW": checked_coverage(gate, "zh_tw_coverage"),
                "japanese": checked_coverage(gate, "japanese_coverage"),
                "korean": checked_coverage(gate, "korean_coverage"),
                "cjkUnified": checked_coverage(gate, "cjk_unified_coverage"),
            },
            "packagingStatus": gate["packaging_status"],
            "previewStatus": normalize_preview_status(gate, allowed_previews),
            "finalStatus": gate["final_status"],
        }
        validate_font(font, approval_schema)
        fonts.append(font)

    return {"version": 2, "fontCount": len(fonts), "fonts": fonts}


def write_catalog(root: Path, catalog):
    target = root / "src" / "data" / "font-catalog.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    write_catalog(root, build_catalog(root))


if __name__ == "__main__":
    main()
