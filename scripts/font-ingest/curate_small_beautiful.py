#!/usr/bin/env python3
"""Create a deterministic small-and-beautiful font shortlist.

This is a curation score, not the SEO Opportunity Score. Missing search-demand
and SERP evidence remain UNASSESSED and are never imputed.
"""

import argparse
import csv
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Set, Tuple


LIBRARY_TOTAL = 250
LIBRARY_CJK = 50
LIBRARY_CATEGORY_QUOTAS = {
    "Sans Serif": 95,
    "Serif": 50,
    "Display": 45,
    "Handwriting": 35,
    "Monospace": 25,
}
LAUNCH_TOTAL = 150
LAUNCH_CJK = 30
LAUNCH_CATEGORY_QUOTAS = {
    "Sans Serif": 57,
    "Serif": 30,
    "Display": 27,
    "Handwriting": 21,
    "Monospace": 15,
}
OUTPUT_FIELDS = [
    "curation_rank",
    "release_tier",
    "selected_reason",
    "family",
    "slug",
    "category",
    "language_group",
    "subsets",
    "official_popularity_rank",
    "popularity_score",
    "strategic_value_score",
    "page_depth_score",
    "license_confidence_score",
    "curation_score",
    "seo_opportunity_score",
    "style_count",
    "variable_axis_count",
    "license",
    "reserved_font_names",
    "source_path",
    "source_url",
    "is_brand_font",
    "curation_eligibility",
]
SPECIALTY_WORDS = {"emoji", "icon", "icons", "symbol", "symbols", "music", "material"}


def language_group(subsets: Set[str]) -> str:
    if subsets & {"chinese-simplified", "chinese-traditional", "chinese-hongkong"}:
        return "Chinese"
    if "japanese" in subsets:
        return "Japanese"
    if "korean" in subsets:
        return "Korean"
    return "Other"


def strategic_score(group: str, subsets: Set[str]) -> float:
    if group == "Chinese":
        return 100.0
    if group == "Korean":
        return 90.0
    if group == "Japanese":
        return 85.0
    non_menu = subsets - {"menu"}
    return 55.0 if len(non_menu) >= 5 else 35.0


def page_depth_score(metadata: Dict[str, object]) -> float:
    styles = len(metadata.get("fonts", {}))
    axes = len(metadata.get("axes", []))
    subsets = len(set(metadata.get("subsets", [])) - {"menu"})
    return min(100.0, 25.0 + styles * 7.0 + axes * 8.0 + subsets * 4.0)


def is_specialty_font(family: str, subsets: Set[str]) -> bool:
    words = set(re.findall(r"[a-z0-9]+", family.lower()))
    if words & SPECIALTY_WORDS:
        return True
    non_menu = subsets - {"menu"}
    return bool(non_menu) and non_menu <= {"emoji", "music"}


def enrich(
    candidates: List[Dict[str, str]],
    preflight: Dict[str, Dict[str, str]],
    metadata: Dict[str, Dict[str, object]],
) -> List[Dict[str, object]]:
    allowed = [row for row in candidates if row["family"] in preflight]
    ranks = [int(row["official_popularity_rank"]) for row in allowed]
    min_rank, max_rank = min(ranks), max(ranks)
    records: List[Dict[str, object]] = []
    for row in allowed:
        family = row["family"]
        meta = metadata[family]
        subsets = set(row["subsets"].split(";"))
        group = language_group(subsets)
        rank = int(row["official_popularity_rank"])
        popularity = 100.0 * (max_rank - rank) / max(1, max_rank - min_rank)
        strategic = strategic_score(group, subsets)
        depth = page_depth_score(meta)
        license_confidence = 100.0
        score = (
            popularity * 0.60
            + strategic * 0.20
            + depth * 0.15
            + license_confidence * 0.05
        )
        pf = preflight[family]
        specialty = is_specialty_font(family, subsets)
        records.append(
            {
                "family": family,
                "slug": row["slug"],
                "category": row["category"],
                "language_group": group,
                "subsets": row["subsets"],
                "official_popularity_rank": rank,
                "popularity_score": round(popularity, 2),
                "strategic_value_score": round(strategic, 2),
                "page_depth_score": round(depth, 2),
                "license_confidence_score": round(license_confidence, 2),
                "curation_score": round(score, 2),
                "seo_opportunity_score": "UNASSESSED",
                "style_count": len(meta.get("fonts", {})),
                "variable_axis_count": len(meta.get("axes", [])),
                "license": pf["license"],
                "reserved_font_names": pf["reserved_font_names"],
                "source_path": pf["source_path"],
                "source_url": pf["source_url"],
                "is_brand_font": bool(meta.get("isBrandFont")),
                "curation_eligibility": (
                    "EXCLUDE_SPECIALTY_FONT" if specialty else "ELIGIBLE"
                ),
            }
        )
    return sorted(
        records,
        key=lambda record: (
            -float(record["curation_score"]),
            int(record["official_popularity_rank"]),
            str(record["family"]),
        ),
    )


def pick_balanced(
    records: List[Dict[str, object]],
    total: int,
    cjk_target: int,
    category_quotas: Dict[str, int],
) -> Tuple[List[Dict[str, object]], Dict[str, str]]:
    if sum(category_quotas.values()) != total:
        raise ValueError("category quotas must sum to total")
    selected: Dict[str, Dict[str, object]] = {}
    reasons: Dict[str, str] = {}

    def add(record: Dict[str, object], reason: str) -> None:
        family = str(record["family"])
        if family not in selected and len(selected) < total:
            selected[family] = record
            reasons[family] = reason

    for record in records:
        if record["language_group"] == "Chinese":
            add(record, "CHINESE_CORE")
    for record in records:
        current_cjk = sum(
            item["language_group"] in {"Chinese", "Japanese", "Korean"}
            for item in selected.values()
        )
        if current_cjk >= cjk_target:
            break
        if record["language_group"] in {"Chinese", "Japanese", "Korean"}:
            add(record, "CJK_POPULAR")
    for category, quota in category_quotas.items():
        for record in records:
            current = sum(item["category"] == category for item in selected.values())
            if current >= quota:
                break
            if record["category"] == category:
                add(record, "CATEGORY_BALANCE")
    for record in records:
        if len(selected) >= total:
            break
        add(record, "POPULARITY_FILL")
    if len(selected) != total:
        raise RuntimeError(f"could select only {len(selected)} of {total} families")
    result = sorted(
        selected.values(),
        key=lambda record: (
            -float(record["curation_score"]),
            int(record["official_popularity_rank"]),
            str(record["family"]),
        ),
    )
    return result, reasons


def output_rows(
    records: Iterable[Dict[str, object]],
    tier: str,
    reasons: Dict[str, str],
) -> List[Dict[str, object]]:
    rows = []
    for rank, record in enumerate(records, start=1):
        row = {
            "curation_rank": rank,
            "release_tier": tier,
            "selected_reason": reasons.get(str(record["family"]), ""),
        }
        row.update(record)
        rows.append(row)
    return rows


def write_csv(path: Path, rows: Iterable[Dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def summarize(rows: List[Dict[str, object]]) -> Dict[str, object]:
    return {
        "families": len(rows),
        "categories": dict(Counter(str(row["category"]) for row in rows)),
        "languages": dict(Counter(str(row["language_group"]) for row in rows)),
        "licenses": dict(Counter(str(row["license"]) for row in rows)),
        "rfn_families": sum(bool(row["reserved_font_names"]) for row in rows),
        "variable_families": sum(int(row["variable_axis_count"]) > 0 for row in rows),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    reports = root / "reports"
    with (reports / "google-fonts-candidates.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        candidates = list(csv.DictReader(handle))
    with (reports / "fonts-preflight-allow.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        preflight = {row["family"]: row for row in csv.DictReader(handle)}
    raw = json.loads(
        (root / "data" / "upstream" / "google-fonts-metadata.json").read_text(
            encoding="utf-8"
        )
    )
    metadata = {row["family"]: row for row in raw["familyMetadataList"]}
    enriched = enrich(candidates, preflight, metadata)
    eligible = [
        record for record in enriched if record["curation_eligibility"] == "ELIGIBLE"
    ]
    library, library_reasons = pick_balanced(
        eligible, LIBRARY_TOTAL, LIBRARY_CJK, LIBRARY_CATEGORY_QUOTAS
    )
    launch, launch_reasons = pick_balanced(
        library, LAUNCH_TOTAL, LAUNCH_CJK, LAUNCH_CATEGORY_QUOTAS
    )
    launch_names = {str(record["family"]) for record in launch}
    reserve = [record for record in library if record["family"] not in launch_names]
    library_names = {str(record["family"]) for record in library}
    excluded = [record for record in enriched if record["family"] not in library_names]
    excluded_reasons = {
        str(record["family"]): str(record["curation_eligibility"])
        for record in excluded
        if record["curation_eligibility"] != "ELIGIBLE"
    }
    combined_reasons = dict(library_reasons)
    combined_reasons.update(launch_reasons)
    library_rows = output_rows(
        library,
        "CURATED_250",
        combined_reasons,
    )
    launch_rows = output_rows(launch, "LAUNCH_150", launch_reasons)
    reserve_rows = output_rows(reserve, "RESERVE_100", library_reasons)
    excluded_rows = output_rows(excluded, "NOT_SELECTED", excluded_reasons)
    write_csv(reports / "fonts-curated-250.csv", library_rows)
    write_csv(reports / "fonts-launch-150.csv", launch_rows)
    write_csv(reports / "fonts-reserve-100.csv", reserve_rows)
    write_csv(reports / "fonts-not-selected.csv", excluded_rows)
    policy = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "framework": "weighted-scoring-with-hard-portfolio-quotas",
        "weights": {
            "official_popularity": 0.60,
            "strategic_language_value": 0.20,
            "page_depth_potential": 0.15,
            "license_confidence": 0.05,
        },
        "seo_opportunity_score": "UNASSESSED; no search or SERP values imputed",
        "curated": summarize(library_rows),
        "launch": summarize(launch_rows),
        "reserve": summarize(reserve_rows),
    }
    (reports / "fonts-curation-policy.json").write_text(
        json.dumps(policy, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    summary = [
        "# Small-and-beautiful font curation",
        "",
        f"- Generated at: {policy['generated_at']}",
        "- Framework: weighted scoring with hard portfolio quotas",
        "- Curation weights: popularity 60%, strategic language 20%, page depth 15%, license confidence 5%",
        "- SEO Opportunity Score: UNASSESSED; search-demand and SERP evidence were not invented",
        f"- Curated library: {json.dumps(policy['curated'], ensure_ascii=False, sort_keys=True)}",
        f"- Launch set: {json.dumps(policy['launch'], ensure_ascii=False, sort_keys=True)}",
        f"- Reserve set: {json.dumps(policy['reserve'], ensure_ascii=False, sort_keys=True)}",
        "- Status: SELECTED_FOR_SCORING; not downloaded or Approved",
        "",
    ]
    (reports / "fonts-curation-summary.md").write_text(
        "\n".join(summary), encoding="utf-8"
    )
    print(json.dumps(policy, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, KeyError, ValueError, RuntimeError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
