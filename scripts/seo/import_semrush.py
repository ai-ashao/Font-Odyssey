#!/usr/bin/env python3
"""Normalize FontOdyssey Semrush exports without committing paid raw data.

Raw CSVs belong under ignored ``research/semrush/...``. This importer writes an
intermediate normalized snapshot under ignored ``reports/seo`` so the next
scoring pass can aggregate only the compact evidence that belongs in ``data/seo``.

The importer is intentionally fail-closed: required columns must map to exactly
one known alias. Unknown columns are recorded in the snapshot but never guessed.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Sequence, Tuple


KEYWORD_FIELDS: Mapping[str, Sequence[str]] = {
    "keyword": ("keyword", "keywords", "关键词", "關鍵字"),
    "position": ("position", "pos", "rank", "排名", "位置"),
    "search_volume": (
        "search volume",
        "volume",
        "vol",
        "搜索量",
        "搜尋量",
        "月搜索量",
        "月搜尋量",
    ),
    "kd": (
        "kd",
        "kd %",
        "keyword difficulty",
        "keyword difficulty %",
        "关键词难度",
        "關鍵字難度",
    ),
    "traffic": ("traffic", "estimated traffic", "流量", "预估流量", "預估流量"),
    "traffic_pct": (
        "traffic %",
        "traffic pct",
        "traffic share",
        "流量 %",
        "流量占比",
        "流量份额",
        "流量份額",
    ),
    "url": ("url", "landing page", "page url", "排名网址", "排名網址", "页面", "頁面"),
    "intent": ("intent", "search intent", "意图", "意圖", "搜索意图", "搜尋意圖"),
    "serp_features": (
        "serp features",
        "serp feature",
        "serp 功能",
        "serp 特性",
        "serp features by keyword",
    ),
}

PAGE_FIELDS: Mapping[str, Sequence[str]] = {
    "url": ("url", "page url", "页面", "頁面"),
    "traffic": ("traffic", "estimated traffic", "流量", "预估流量", "預估流量"),
    "traffic_pct": (
        "traffic %",
        "traffic pct",
        "traffic share",
        "流量 %",
        "流量占比",
        "流量份额",
        "流量份額",
    ),
    "keywords": ("keywords", "organic keywords", "关键词", "關鍵字", "自然关键词", "自然關鍵字"),
    "main_keyword": ("main keyword", "top keyword", "primary keyword", "主要关键词", "主要關鍵字"),
    "referring_domains": (
        "referring domains",
        "ref domains",
        "ref domains count",
        "引用域",
        "引荐域",
        "引薦域",
    ),
    "intent": ("intent", "search intent", "意图", "意圖", "搜索意图", "搜尋意圖"),
}

REPORT_FIELDS = {"keywords": KEYWORD_FIELDS, "pages": PAGE_FIELDS}
REQUIRED_FIELDS = {"keywords": ("keyword",), "pages": ("url",)}

BASE_FIELDS = [
    "source_domain",
    "report_type",
    "market",
    "device",
    "captured_at",
    "source_snapshot",
    "source_file",
    "source_row",
]

OUTPUT_FIELDS = {
    "keywords": BASE_FIELDS + list(KEYWORD_FIELDS.keys()),
    "pages": BASE_FIELDS + list(PAGE_FIELDS.keys()),
}


@dataclass(frozen=True)
class ImportSummary:
    source_file: str
    source_domain: str
    report_type: str
    rows: int
    mapped_columns: Dict[str, str]
    unknown_columns: List[str]


def normalize_header(value: str) -> str:
    value = value.strip().lower().replace("％", "%")
    value = re.sub(r"[_\-]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" .:")


def alias_index(fields: Mapping[str, Sequence[str]]) -> Dict[str, List[str]]:
    index: Dict[str, List[str]] = {}
    for canonical, aliases in fields.items():
        for alias in aliases:
            index.setdefault(normalize_header(alias), []).append(canonical)
    return index


def map_headers(headers: Sequence[str], report_type: str) -> Tuple[Dict[str, str], List[str]]:
    if report_type not in REPORT_FIELDS:
        raise ValueError(f"Unsupported report type: {report_type}")
    index = alias_index(REPORT_FIELDS[report_type])
    mapped: Dict[str, str] = {}
    unknown: List[str] = []

    for raw in headers:
        normalized = normalize_header(raw)
        candidates = index.get(normalized, [])
        if not candidates:
            unknown.append(raw)
            continue
        if len(candidates) != 1:
            raise ValueError(f"Ambiguous Semrush header {raw!r}: {candidates}")
        canonical = candidates[0]
        if canonical in mapped:
            raise ValueError(
                f"Multiple source columns map to {canonical!r}: {mapped[canonical]!r}, {raw!r}"
            )
        mapped[canonical] = raw

    missing = [field for field in REQUIRED_FIELDS[report_type] if field not in mapped]
    if missing:
        raise ValueError(
            f"Missing required {report_type} columns {missing}; received headers: {list(headers)}"
        )
    return mapped, unknown


def parse_filename(path: Path, market: str, device: str) -> Tuple[str, str]:
    stem = path.stem
    market_token = market.lower()
    device_token = device.lower()
    for report_type in REPORT_FIELDS:
        suffix = f"-{market_token}-{device_token}-{report_type}"
        if stem.lower().endswith(suffix):
            domain = stem[: -len(suffix)]
            if domain:
                return domain, report_type
    raise ValueError(
        f"Unsupported Semrush filename {path.name!r}; expected "
        f"<domain>-{market_token}-{device_token}-pages.csv or -keywords.csv"
    )


def normalized_rows(
    path: Path,
    *,
    market: str,
    device: str,
    captured_at: str,
    source_snapshot: str,
) -> Tuple[List[Dict[str, str]], ImportSummary]:
    domain, report_type = parse_filename(path, market, device)
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError(f"CSV has no header row: {path}")
        mapped, unknown = map_headers(reader.fieldnames, report_type)
        rows: List[Dict[str, str]] = []
        for row_number, row in enumerate(reader, start=2):
            normalized = {
                "source_domain": domain,
                "report_type": report_type,
                "market": market,
                "device": device,
                "captured_at": captured_at,
                "source_snapshot": source_snapshot,
                "source_file": path.name,
                "source_row": str(row_number),
            }
            for canonical in REPORT_FIELDS[report_type]:
                raw_header = mapped.get(canonical)
                normalized[canonical] = (row.get(raw_header, "") if raw_header else "").strip()
            if not normalized[REQUIRED_FIELDS[report_type][0]]:
                continue
            rows.append(normalized)

    return rows, ImportSummary(
        source_file=path.name,
        source_domain=domain,
        report_type=report_type,
        rows=len(rows),
        mapped_columns=mapped,
        unknown_columns=unknown,
    )


def write_csv(path: Path, fieldnames: Sequence[str], rows: Iterable[Mapping[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def import_directory(
    input_dir: Path,
    output_dir: Path,
    *,
    market: str,
    device: str,
    captured_at: str,
) -> Dict[str, object]:
    input_dir = input_dir.resolve()
    output_dir = output_dir.resolve()
    files = sorted(input_dir.glob("*.csv"))
    if not files:
        raise ValueError(f"No Semrush CSV files found under {input_dir}")

    keyword_rows: List[Dict[str, str]] = []
    page_rows: List[Dict[str, str]] = []
    summaries: List[ImportSummary] = []
    snapshot = input_dir.name

    for path in files:
        rows, summary = normalized_rows(
            path,
            market=market,
            device=device,
            captured_at=captured_at,
            source_snapshot=snapshot,
        )
        summaries.append(summary)
        if summary.report_type == "keywords":
            keyword_rows.extend(rows)
        else:
            page_rows.extend(rows)

    write_csv(output_dir / "semrush-keywords-normalized.csv", OUTPUT_FIELDS["keywords"], keyword_rows)
    write_csv(output_dir / "semrush-pages-normalized.csv", OUTPUT_FIELDS["pages"], page_rows)

    payload: Dict[str, object] = {
        "schema_version": 1,
        "market": market,
        "device": device,
        "captured_at": captured_at,
        "source_snapshot": snapshot,
        "keyword_rows": len(keyword_rows),
        "page_rows": len(page_rows),
        "files": [
            {
                "source_file": summary.source_file,
                "source_domain": summary.source_domain,
                "report_type": summary.report_type,
                "rows": summary.rows,
                "mapped_columns": summary.mapped_columns,
                "unknown_columns": summary.unknown_columns,
            }
            for summary in summaries
        ],
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "semrush-snapshot.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("reports/seo"))
    parser.add_argument("--market", default="US")
    parser.add_argument("--device", default="desktop")
    parser.add_argument("--captured-at", default=date.today().isoformat())
    args = parser.parse_args()

    import_directory(
        args.input_dir,
        args.output_dir,
        market=args.market,
        device=args.device,
        captured_at=args.captured_at,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
