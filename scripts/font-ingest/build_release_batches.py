#!/usr/bin/env python3
"""Create deterministic release selections from the APPROVED catalog."""

import argparse
import csv
import json
from pathlib import Path


PILOT_FAMILIES = {"Inter", "Fira Sans", "Noto Serif SC", "Noto Serif TC", "Raleway"}
BATCH_SIZES = (30, 40, 40, 34)


def build_batches(approved_path: Path, launch_path: Path):
    with approved_path.open(newline="", encoding="utf-8") as handle:
        approved = list(csv.DictReader(handle))
    with launch_path.open(newline="", encoding="utf-8") as handle:
        launch = {row["family"]: row for row in csv.DictReader(handle)}
    if any(row["final_status"] != "APPROVED" for row in approved):
        raise ValueError("approved input contains a non-APPROVED row")
    families = sorted(
        (row["family"] for row in approved if row["family"] not in PILOT_FAMILIES),
        key=lambda family: int(launch[family]["curation_rank"]),
    )
    if len(families) != sum(BATCH_SIZES):
        raise ValueError(f"expected {sum(BATCH_SIZES)} non-Pilot families, found {len(families)}")
    batches, offset = [], 0
    for size in BATCH_SIZES:
        batches.append(families[offset : offset + size])
        offset += size
    return batches


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    output = (args.output or root / "reports" / "release-batches").resolve()
    batches = build_batches(
        root / "data/font-catalog/fonts-approved.csv",
        root / "data/font-catalog/fonts-launch-150.csv",
    )
    output.mkdir(parents=True, exist_ok=True)
    for index, families in enumerate(batches, 1):
        payload = {"batch": index, "fonts": [{"family": family} for family in families]}
        (output / f"batch-{index}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"batch {index}: {len(families)} families")


if __name__ == "__main__":
    main()
