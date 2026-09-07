#!/usr/bin/env python3
"""Build deterministic download packages and conservative web previews."""

import argparse
import csv
import hashlib
import json
import shutil
import sys
import zipfile
from collections import Counter
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ZIP_DATE = (1980, 1, 1, 0, 0, 0)
SOURCE_BASE = "https://github.com/google/fonts/tree"
INVENTORY_FIELDS = [
    "curation_rank", "family", "slug", "license", "reserved_font_names",
    "package", "package_sha256", "package_size_bytes", "font_file_count",
    "preview_status", "preview", "preview_sha256", "status", "reason",
]
CHECKSUM_FIELDS = ["family", "artifact", "relative_path", "sha256", "size_bytes"]
PREVIEW_FIELDS = [
    "family", "slug", "license", "reserved_font_names", "source_font",
    "preview_status", "preview_path", "sha256", "size_bytes", "reason",
]


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def csv_rows(path):
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path, fields, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def stable_json(path, value):
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def zip_info(name):
    info = zipfile.ZipInfo(name, ZIP_DATE)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 3
    info.external_attr = 0o100644 << 16
    return info


def build_zip(path, entries):
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, content in sorted(entries, key=lambda item: item[0]):
            archive.writestr(zip_info(name), content)


def license_filename(license_id):
    return {"OFL-1.1": "OFL.txt", "Apache-2.0": "LICENSE.txt", "UFL-1.0": "LICENCE.txt"}[license_id]


def select_preview_font(rows):
    def score(row):
        path = row["relative_path"].lower()
        italic = row["italic"].lower() == "true"
        variable = row["variable"].lower() == "true"
        regular = "regular" in row["internal_subfamily"].lower() or "regular" in path
        return (int(not italic), int(variable), int(regular), row["relative_path"])
    return max(rows, key=score)


def preview_text(language_group):
    return {
        "Chinese": "字体探索 字型探索 FontOdyssey 0123456789",
        "Japanese": "文字の旅 フォント FontOdyssey 0123456789",
        "Korean": "글꼴 여행 폰트 FontOdyssey 0123456789",
    }.get(language_group, "Sphinx of black quartz, judge my vow. FontOdyssey 0123456789")


def make_preview(source, target, text):
    font = TTFont(source, recalcTimestamp=False)
    try:
        cmap = font.getBestCmap() or {}
        codepoints = sorted({ord(character) for character in text} & set(cmap))
        if not codepoints:
            raise ValueError("preview text has no supported characters")
        options = subset.Options()
        options.flavor = "woff2"
        options.recalc_timestamp = False
        options.canonical_order = True
        options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17, 21, 22]
        options.name_legacy = True
        options.name_languages = [0x409]
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=codepoints)
        subsetter.subset(font)
        target.parent.mkdir(parents=True, exist_ok=True)
        font.flavor = "woff2"
        font.save(target, reorderTables=True)
        return codepoints
    finally:
        font.close()


def verify_zip(path, expected_fonts):
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError("duplicate ZIP entry")
        if any(name.startswith("/") or ".." in Path(name).parts for name in names):
            raise ValueError("unsafe ZIP entry")
        if "LICENSE.txt" not in names or "SOURCE.txt" not in names:
            raise ValueError("missing license or source notice")
        for name, expected in expected_fonts.items():
            actual = hashlib.sha256(archive.read(name)).hexdigest()
            if actual != expected:
                raise ValueError(f"font checksum mismatch: {name}")


def source_notice(row):
    source_url = f'{SOURCE_BASE}/{row["source_commit"]}/{row["source_path"]}'
    return (
        f'Family: {row["family"]}\n'
        f'Official source: {source_url}\n'
        f'Source path: {row["source_path"]}\n'
        f'Pinned commit: {row["source_commit"]}\n'
        f'License identifier: {row["license"]}\n'
        "Packaged by FontOdyssey without modifying the original font files.\n"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    approved = csv_rows(root / "reports" / "fonts-approved.csv")
    launch = {row["family"]: row for row in csv_rows(root / "reports" / "fonts-launch-150.csv")}
    file_rows = csv_rows(root / "reports" / "fonts-analysis-files.csv")
    by_family = {}
    for row in file_rows:
        by_family.setdefault(row["family"], []).append(row)

    dist = root / "dist"
    if dist.exists():
        shutil.rmtree(dist)
    (dist / "fonts").mkdir(parents=True)
    inventory, checksums, previews, failures, catalog = [], [], [], [], []

    for family_row in sorted(approved, key=lambda row: int(launch[row["family"]]["curation_rank"])):
        family = family_row["family"]
        slug = family_row["slug"]
        curated = launch[family]
        family_dir = dist / "fonts" / slug
        family_dir.mkdir(parents=True)
        source_dir = root / "staging" / "google-fonts" / family_row["source_path"]
        rows = by_family.get(family, [])
        try:
            if not rows or any(row["parse_status"] != "OK" for row in rows):
                raise ValueError("missing successfully analyzed font rows")
            license_source = source_dir / license_filename(family_row["license"])
            if not license_source.is_file():
                raise FileNotFoundError(f"missing {license_source.name}")
            license_bytes = license_source.read_bytes()
            notice = source_notice(family_row).encode("utf-8")
            metadata = {**curated, **family_row}
            metadata["curation_rank"] = int(curated["curation_rank"])
            metadata["font_files"] = [
                {
                    "relative_path": str(Path(row["relative_path"]).relative_to("staging/google-fonts")),
                    "sha256": row["sha256"], "size_bytes": int(row["size_bytes"]),
                    "format": row["format"], "weight": int(row["weight"]) if row["weight"] else None,
                    "italic": row["italic"].lower() == "true", "variable": row["variable"].lower() == "true",
                    "axes": json.loads(row["axes"]),
                } for row in rows
            ]
            stable_json(family_dir / "metadata.json", metadata)
            (family_dir / "LICENSE.txt").write_bytes(license_bytes)
            (family_dir / "SOURCE.txt").write_bytes(notice)

            if family_row["packaging_status"] == "SEPARATE_VARIABLE_STATIC_REQUIRED":
                variable = [row for row in rows if row["variable"].lower() == "true"]
                static = [row for row in rows if row["variable"].lower() != "true"]
                install = ("The variable and static editions are distributed separately because some files "
                           "share PostScript names. Install one edition at a time to avoid name collisions.\n").encode("utf-8")
                groups = [(f"{slug}.zip", variable, install), (f"{slug}-static.zip", static, install)]
            else:
                groups = [(f"{slug}.zip", rows, b"")]

            primary_zip = primary_sha = ""
            primary_size = 0
            for package_name, package_rows, install_note in groups:
                entries = [("LICENSE.txt", license_bytes), ("SOURCE.txt", notice)]
                expected = {}
                if install_note:
                    entries.append(("INSTALL-NOTES.txt", install_note))
                for row in package_rows:
                    source = root / row["relative_path"]
                    rel = Path(row["relative_path"]).relative_to(source_dir.relative_to(root))
                    archive_name = str(Path("fonts") / rel)
                    entries.append((archive_name, source.read_bytes()))
                    expected[archive_name] = row["sha256"]
                package_path = family_dir / package_name
                build_zip(package_path, entries)
                verify_zip(package_path, expected)
                package_sha = sha256(package_path)
                checksums.append({"family": family, "artifact": "download_zip", "relative_path": str(package_path.relative_to(root)), "sha256": package_sha, "size_bytes": package_path.stat().st_size})
                if not primary_zip:
                    primary_zip, primary_sha, primary_size = str(package_path.relative_to(root)), package_sha, package_path.stat().st_size

            reserved = family_row["reserved_font_names"].strip()
            preview_status = preview_reason = preview_rel = preview_sha = ""
            preview_size = 0
            selected = select_preview_font(rows)
            if family_row["license"] != "OFL-1.1":
                preview_status, preview_reason = "SKIPPED_DERIVATIVE_POLICY", "V1 previews are limited to OFL-1.1 families"
            elif reserved:
                preview_status, preview_reason = "SKIPPED_RFN", "Reserved Font Name requires separate derivative naming review"
            else:
                preview_path = family_dir / "preview.woff2"
                codepoints = make_preview(root / selected["relative_path"], preview_path, preview_text(curated["language_group"]))
                with TTFont(preview_path, lazy=True) as preview_font:
                    actual = set((preview_font.getBestCmap() or {}).keys())
                    if not set(codepoints).issubset(actual):
                        raise ValueError("preview character verification failed")
                preview_status = "GENERATED"
                preview_rel, preview_sha, preview_size = str(preview_path.relative_to(root)), sha256(preview_path), preview_path.stat().st_size
                stable_json(family_dir / "preview-metadata.json", {
                    "artifact": preview_rel, "kind": "web preview subset in WOFF2 format", "license": "OFL-1.1",
                    "source_font": selected["relative_path"], "source_sha256": selected["sha256"],
                    "characters": "".join(chr(cp) for cp in codepoints), "codepoints": [f"U+{cp:04X}" for cp in codepoints],
                    "tool": "fontTools 4.60.2",
                })
                checksums.append({"family": family, "artifact": "preview_woff2", "relative_path": preview_rel, "sha256": preview_sha, "size_bytes": preview_size})

            manifest_files = [{"file": artifact.name, "sha256": sha256(artifact), "size_bytes": artifact.stat().st_size}
                              for artifact in sorted(family_dir.iterdir()) if artifact.name != "checksums.json"]
            stable_json(family_dir / "checksums.json", {"files": manifest_files})
            checksums.append({"family": family, "artifact": "manifest", "relative_path": str((family_dir / "checksums.json").relative_to(root)), "sha256": sha256(family_dir / "checksums.json"), "size_bytes": (family_dir / "checksums.json").stat().st_size})
            previews.append({"family": family, "slug": slug, "license": family_row["license"], "reserved_font_names": reserved,
                             "source_font": selected["relative_path"], "preview_status": preview_status, "preview_path": preview_rel,
                             "sha256": preview_sha, "size_bytes": preview_size, "reason": preview_reason})
            item = {"curation_rank": curated["curation_rank"], "family": family, "slug": slug, "license": family_row["license"],
                    "reserved_font_names": reserved, "package": primary_zip, "package_sha256": primary_sha,
                    "package_size_bytes": primary_size, "font_file_count": len(rows), "preview_status": preview_status,
                    "preview": preview_rel, "preview_sha256": preview_sha, "status": "PACKAGED", "reason": ""}
            inventory.append(item)
            catalog.append({**item, "category": curated["category"], "language_group": curated["language_group"],
                            "subsets": curated["subsets"].split(";") if curated["subsets"] else [],
                            "official_popularity_rank": int(curated["official_popularity_rank"]), "style_count": int(curated["style_count"])})
        except Exception as error:
            failures.append({"family": family, "slug": slug, "reason": f"{type(error).__name__}: {error}"})

    stable_json(dist / "catalog.json", {"source_commit": approved[0]["source_commit"] if approved else "", "font_count": len(catalog), "fonts": catalog})
    write_csv(root / "reports" / "fonts-package-inventory.csv", INVENTORY_FIELDS, inventory)
    write_csv(root / "reports" / "fonts-package-checksums.csv", CHECKSUM_FIELDS, checksums)
    write_csv(root / "reports" / "fonts-preview-status.csv", PREVIEW_FIELDS, previews)
    write_csv(root / "reports" / "fonts-package-failed.csv", ["family", "slug", "reason"], failures)
    preview_counts = Counter(row["preview_status"] for row in previews)
    summary = (
        "# Font packaging summary\n\n"
        f"- Approved input families: {len(approved)}\n- Successfully packaged families: {len(inventory)}\n"
        f"- Failed families: {len(failures)}\n- Download ZIP files: {sum(1 for row in checksums if row['artifact'] == 'download_zip')}\n"
        f"- Generated previews: {preview_counts.get('GENERATED', 0)}\n"
        f"- Skipped for Reserved Font Names: {preview_counts.get('SKIPPED_RFN', 0)}\n"
        f"- Skipped by derivative policy: {preview_counts.get('SKIPPED_DERIVATIVE_POLICY', 0)}\n\n"
        "Roboto Condensed is absent because it did not pass the final License Gate. "
        "Inconsolata variable and static editions are packaged separately.\n"
    )
    (root / "reports" / "fonts-package-summary.md").write_text(summary, encoding="utf-8")
    print(summary, end="")
    return 1 if failures or len(inventory) != len(approved) else 0


if __name__ == "__main__":
    sys.exit(main())
