#!/usr/bin/env python3
"""Export the final Approved font set as a compact, frontend-safe JSON catalog."""

import argparse
import csv
import json
from pathlib import Path


def rows(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    source = root / "data" / "font-catalog"
    launch = {row["family"]: row for row in rows(source / "fonts-launch-150.csv")}
    approved = rows(source / "fonts-approved.csv")
    fonts = []
    for gate in sorted(approved, key=lambda row: int(launch[row["family"]]["curation_rank"])):
        item = launch[gate["family"]]
        fonts.append(
            {
                "curationRank": int(item["curation_rank"]),
                "family": item["family"],
                "slug": item["slug"],
                "category": item["category"],
                "languageGroup": item["language_group"],
                "subsets": item["subsets"].split(";") if item["subsets"] else [],
                "officialPopularityRank": int(item["official_popularity_rank"]),
                "styleCount": int(item["style_count"]),
                "variableAxisCount": int(item["variable_axis_count"]),
                "license": gate["license"],
                "reservedFontNames": gate["reserved_font_names"].split(";")
                if gate["reserved_font_names"]
                else [],
            }
        )
    target = root / "src" / "data" / "font-catalog.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps({"version": 1, "fontCount": len(fonts), "fonts": fonts}, indent=2)
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
