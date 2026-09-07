#!/usr/bin/env python3
"""Download a fail-closed Google Fonts acquisition pilot.

This intentionally creates a staging inventory, not an Approved catalog.
It uses only the official fonts.google.com metadata endpoint and google/fonts
repository, pins the upstream commit, and records a SHA256 for every file.
"""

import argparse
import csv
import hashlib
import json
import re
import shutil
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Tuple


OFFICIAL_METADATA_URL = "https://fonts.google.com/metadata/fonts"
OFFICIAL_REPO_URL = "https://github.com/google/fonts.git"
CHINESE_PILOT = [
    "Noto Sans SC",
    "Noto Sans TC",
    "Noto Sans HK",
    "Noto Serif SC",
    "Noto Serif TC",
    "Huninn",
    "Ma Shan Zheng",
    "ZCOOL XiaoWei",
    "ZCOOL KuaiLe",
    "ZCOOL QingKe HuangYou",
]
FONT_SUFFIXES = {".ttf", ".otf", ".woff", ".woff2"}
LICENSE_BY_ROOT = {
    "ofl": ("OFL-1.1", "OFL.txt"),
    "apache": ("Apache-2.0", "LICENSE.txt"),
    "ufl": ("UFL-1.0", "UFL.txt"),
}
MIN_FREE_BYTES = 5 * 1024 * 1024 * 1024
MAX_FAMILY_BYTES = 512 * 1024 * 1024


def run(*args: str, cwd: Optional[Path] = None) -> str:
    result = subprocess.run(
        args,
        cwd=str(cwd) if cwd else None,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.strip()


def slug(family: str) -> str:
    return re.sub(r"[^a-z0-9]", "", family.lower())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_metadata(cache_path: Path) -> dict:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    if not cache_path.exists():
        request = urllib.request.Request(
            OFFICIAL_METADATA_URL,
            headers={"User-Agent": "FontOdyssey-Acquisition-Pilot/1.0"},
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = response.read()
        cache_path.write_bytes(payload)
    return json.loads(cache_path.read_text(encoding="utf-8"))


def select_families(metadata: dict, limit: int) -> list[dict]:
    if not 1 <= limit <= 25:
        raise ValueError("pilot limit must be between 1 and 25 families")
    records = metadata["familyMetadataList"]
    by_name = {record["family"]: record for record in records}
    chinese = [by_name[name] for name in CHINESE_PILOT if name in by_name]
    chinese = chinese[: min(10, limit)]
    selected_names = {record["family"] for record in chinese}
    latin_slots = limit - len(chinese)
    latin = sorted(records, key=lambda record: record.get("popularity", 10**9))
    latin = [
        record
        for record in latin
        if record.get("isOpenSource") is True
        and record.get("isBrandFont") is False
        and record["family"] not in selected_names
        and not any(
            token.startswith(("chinese", "japanese", "korean"))
            for token in record.get("subsets", [])
        )
    ][:latin_slots]
    return latin + chinese


def check_capacity(root: Path, selected: list[dict]) -> None:
    oversized = [
        record["family"]
        for record in selected
        if int(record.get("size") or 0) > MAX_FAMILY_BYTES
    ]
    if oversized:
        raise RuntimeError("families exceed 512 MiB metadata limit: " + ", ".join(oversized))
    if shutil.disk_usage(root).free < MIN_FREE_BYTES:
        raise RuntimeError("less than 5 GiB free; refusing font acquisition")


def ensure_sparse_checkout(repo: Path, paths: list[str], execute: bool) -> Tuple[str, str]:
    if not execute:
        return run("git", "ls-remote", OFFICIAL_REPO_URL, "HEAD").split()[0], "DRY_RUN"
    repo.parent.mkdir(parents=True, exist_ok=True)
    if not repo.exists():
        run(
            "git",
            "clone",
            "--depth=1",
            "--filter=blob:none",
            "--no-checkout",
            OFFICIAL_REPO_URL,
            str(repo),
        )
    elif not (repo / ".git").is_dir():
        raise RuntimeError(f"refusing non-git source directory: {repo}")
    origin = run("git", "remote", "get-url", "origin", cwd=repo)
    if origin != OFFICIAL_REPO_URL and not origin.endswith(
        "/https://github.com/google/fonts.git"
    ):
        raise RuntimeError(f"unexpected origin for {repo}: {origin}")
    run("git", "sparse-checkout", "init", "--cone", cwd=repo)
    run("git", "sparse-checkout", "set", *paths, cwd=repo)
    run("git", "checkout", "--detach", "origin/main", cwd=repo)
    return run("git", "rev-parse", "HEAD", cwd=repo), origin


def locate_family(repo: Path, family_slug: str) -> Optional[Path]:
    for license_root in ("ofl", "apache", "ufl"):
        candidate = repo / license_root / family_slug
        if candidate.is_dir() and not candidate.is_symlink():
            return candidate
    return None


def license_status(family_dir: Path) -> tuple[str, str]:
    license_id, name = LICENSE_BY_ROOT.get(family_dir.parent.name, ("REVIEW", ""))
    if name and (family_dir / name).is_file():
        return license_id, name
    return "REVIEW", ""


def write_candidate_pool(root: Path, metadata: dict) -> None:
    reports = root / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    records = sorted(
        (
            record
            for record in metadata["familyMetadataList"]
            if record.get("isOpenSource") is True
        ),
        key=lambda record: record.get("popularity", 10**9),
    )[:1000]
    fields = [
        "family",
        "slug",
        "category",
        "subsets",
        "official_popularity_rank",
        "source_type",
        "source_url",
        "license_preflight",
        "search_demand_score",
        "serp_opportunity_score",
        "seo_opportunity_score",
        "status",
    ]
    with (reports / "google-fonts-candidates.csv").open(
        "w", encoding="utf-8", newline=""
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for record in records:
            family_slug = slug(record["family"])
            writer.writerow(
                {
                    "family": record["family"],
                    "slug": family_slug,
                    "category": record.get("category", ""),
                    "subsets": ";".join(record.get("subsets", [])),
                    "official_popularity_rank": record.get("popularity", ""),
                    "source_type": "google-fonts-official-metadata",
                    "source_url": OFFICIAL_METADATA_URL,
                    "license_preflight": "UNASSESSED",
                    "search_demand_score": "UNASSESSED",
                    "serp_opportunity_score": "UNASSESSED",
                    "seo_opportunity_score": "UNASSESSED",
                    "status": "CANDIDATE",
                }
            )


def write_reports(
    root: Path, selected: list[dict], commit: str, transport_url: str, execute: bool
) -> None:
    reports = root / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    inventory_path = reports / "acquisition-pilot.csv"
    checksum_path = reports / "acquisition-pilot-checksums.csv"
    source_repo = root / "staging" / "google-fonts"
    inventory_rows = []
    checksum_rows = []
    for record in selected:
        family_slug = slug(record["family"])
        family_dir = locate_family(source_repo, family_slug) if execute else None
        license_id, license_file = (
            license_status(family_dir) if family_dir else ("PENDING", "")
        )
        font_files = []
        has_symlink = False
        has_rfn = False
        notice_file = ""
        if family_dir:
            has_symlink = any(path.is_symlink() for path in family_dir.rglob("*"))
            files = sorted(
                path
                for path in family_dir.rglob("*")
                if path.is_file() and not path.is_symlink()
            )
            font_files = [path for path in files if path.suffix.lower() in FONT_SUFFIXES]
            notice = family_dir / "NOTICE"
            notice_txt = family_dir / "NOTICE.txt"
            if notice.is_file():
                notice_file = notice.name
            elif notice_txt.is_file():
                notice_file = notice_txt.name
            if license_file:
                license_text = (family_dir / license_file).read_text(
                    encoding="utf-8", errors="replace"
                )
                license_header = license_text.split("SIL OPEN FONT LICENSE", 1)[0]
                has_rfn = "reserved font name" in license_header.lower()
            for path in files:
                checksum_rows.append(
                    {
                        "family": record["family"],
                        "relative_path": str(path.relative_to(root)),
                        "size_bytes": path.stat().st_size,
                        "sha256": sha256(path),
                    }
                )
        status = (
            "DOWNLOADED_REVIEW"
            if family_dir and font_files and license_file and not has_symlink
            else "FAILED"
        )
        if not execute:
            status = "DRY_RUN"
        inventory_rows.append(
            {
                "family": record["family"],
                "slug": family_slug,
                "category": record.get("category", ""),
                "subsets": ";".join(record.get("subsets", [])),
                "official_popularity_rank": record.get("popularity", ""),
                "search_demand_score": "UNASSESSED",
                "serp_opportunity_score": "UNASSESSED",
                "seo_opportunity_score": "UNASSESSED",
                "license": license_id,
                "license_file": license_file,
                "reserved_font_name_declared": has_rfn,
                "notice_file": notice_file,
                "font_file_count": len(font_files),
                "source_commit": commit,
                "source_url": f"https://github.com/google/fonts/tree/{commit}/{family_dir.relative_to(source_repo) if family_dir else family_slug}",
                "status": status,
            }
        )
    fields = list(inventory_rows[0].keys())
    with inventory_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(inventory_rows)
    with checksum_path.open("w", encoding="utf-8", newline="") as handle:
        fields = ["family", "relative_path", "size_bytes", "sha256"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(checksum_rows)
    snapshot = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "official_metadata_url": OFFICIAL_METADATA_URL,
        "official_repo_url": OFFICIAL_REPO_URL,
        "transport_url": transport_url,
        "source_commit": commit,
        "family_count": len(selected),
        "mode": "execute" if execute else "dry-run",
        "approval_status": "NOT_APPROVED_ACQUISITION_PILOT",
    }
    (reports / "acquisition-pilot-source.json").write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    status_counts = {}
    for row in inventory_rows:
        status_counts[row["status"]] = status_counts.get(row["status"], 0) + 1
    license_counts = {}
    for row in inventory_rows:
        license_counts[row["license"]] = license_counts.get(row["license"], 0) + 1
    summary = [
        "# Acquisition pilot summary",
        "",
        f"- Mode: {snapshot['mode']}",
        f"- Source commit: `{commit}`",
        f"- Families: {len(inventory_rows)}",
        f"- Font files: {sum(row['font_file_count'] for row in inventory_rows)}",
        f"- Checksummed files: {len(checksum_rows)}",
        f"- Statuses: {json.dumps(status_counts, sort_keys=True)}",
        f"- Licenses: {json.dumps(license_counts, sort_keys=True)}",
        f"- RFN declarations requiring derivative review: {sum(row['reserved_font_name_declared'] for row in inventory_rows)}",
        "- Approval: NOT APPROVED; acquisition staging only",
        "",
    ]
    (reports / "acquisition-pilot-summary.md").write_text(
        "\n".join(summary), encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--limit", type=int, default=25)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--candidates-only", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    metadata = load_metadata(root / "data" / "upstream" / "google-fonts-metadata.json")
    write_candidate_pool(root, metadata)
    if args.candidates_only:
        print("candidate families: 1000")
        print("mode: candidates-only")
        return 0
    selected = select_families(metadata, args.limit)
    check_capacity(root, selected)
    sparse_paths = [
        f"{license_root}/{slug(record['family'])}"
        for record in selected
        for license_root in ("ofl", "apache", "ufl")
    ]
    commit, transport_url = ensure_sparse_checkout(
        root / "staging" / "google-fonts", sparse_paths, args.execute
    )
    write_reports(root, selected, commit, transport_url, args.execute)
    print(f"pilot families: {len(selected)}")
    print(f"source commit: {commit}")
    print(f"mode: {'execute' if args.execute else 'dry-run'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
