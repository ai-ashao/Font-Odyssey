#!/usr/bin/env python3
"""Download the user-confirmed 150-family curated launch set.

Only official files from the pinned google/fonts snapshot are materialized.
The output status is DOWNLOADED_REVIEW, never Approved.
"""

import argparse
import csv
import hashlib
import json
import shutil
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple


OFFICIAL_REPO_URL = "https://github.com/google/fonts.git"
FONT_SUFFIXES = {".ttf", ".otf", ".woff", ".woff2"}
SAFE_SUPPORT_SUFFIXES = {".txt", ".md", ".pb", ".yaml", ".yml", ".html"}
MIN_FREE_BYTES = 5 * 1024 * 1024 * 1024
MAX_FAMILY_BYTES = 512 * 1024 * 1024
MAGIC = {
    ".ttf": (b"\x00\x01\x00\x00", b"true", b"typ1", b"ttcf"),
    ".otf": (b"OTTO",),
    ".woff": (b"wOFF",),
    ".woff2": (b"wOF2",),
}
INVENTORY_FIELDS = [
    "family",
    "source_path",
    "source_commit",
    "license",
    "license_file",
    "reserved_font_names",
    "font_file_count",
    "support_file_count",
    "total_bytes",
    "status",
    "reason",
]


def run(*args: str, cwd: Optional[Path] = None, input_text: Optional[str] = None) -> str:
    result = subprocess.run(
        args,
        cwd=str(cwd) if cwd else None,
        input=input_text,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.strip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_font_magic(path: Path) -> bool:
    expected = MAGIC.get(path.suffix.lower())
    if not expected:
        return False
    with path.open("rb") as handle:
        prefix = handle.read(4)
    return prefix in expected


def verify_repo(repo: Path, expected_commit: str) -> str:
    if not (repo / ".git").is_dir():
        raise RuntimeError(f"missing google/fonts checkout: {repo}")
    origin = run("git", "remote", "get-url", "origin", cwd=repo)
    if origin != OFFICIAL_REPO_URL and not origin.endswith(
        "/https://github.com/google/fonts.git"
    ):
        raise RuntimeError(f"unexpected upstream origin: {origin}")
    if run("git", "status", "--porcelain", cwd=repo):
        raise RuntimeError("google/fonts checkout is dirty; refusing download")
    commit = run("git", "rev-parse", "HEAD", cwd=repo)
    if commit != expected_commit:
        raise RuntimeError(f"snapshot mismatch: expected {expected_commit}, got {commit}")
    return commit


def git_tree_files(repo: Path, commit: str) -> Set[str]:
    return set(
        run("git", "ls-tree", "-r", "--name-only", commit, cwd=repo).splitlines()
    )


def selected_tree_files(source_path: str, tree_files: Set[str]) -> List[str]:
    prefix = source_path.rstrip("/") + "/"
    selected = []
    for relative in tree_files:
        if not relative.startswith(prefix):
            continue
        suffix = Path(relative).suffix.lower()
        if suffix in FONT_SUFFIXES or suffix in SAFE_SUPPORT_SUFFIXES:
            selected.append(relative)
    return sorted(selected)


def sparse_literal(path: str) -> str:
    escaped = path.replace("\\", "\\\\")
    for character in ("*", "?", "[", "]"):
        escaped = escaped.replace(character, "\\" + character)
    return "/" + escaped


def materialize(repo: Path, selected_files: Iterable[str]) -> None:
    patterns = [
        "/ofl/*/OFL.txt",
        "/apache/*/LICENSE.txt",
        "/apache/*/NOTICE",
        "/apache/*/NOTICE.txt",
        "/ufl/*/UFL.txt",
        "/ufl/*/LICENCE.txt",
    ]
    patterns.extend(sparse_literal(path) for path in selected_files)
    run(
        "git",
        "sparse-checkout",
        "set",
        "--no-cone",
        "--stdin",
        cwd=repo,
        input_text="\n".join(sorted(set(patterns))) + "\n",
    )


def write_csv(path: Path, fields: List[str], rows: Iterable[Dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    reports = root / "reports"
    repo = root / "staging" / "google-fonts"
    with (reports / "fonts-launch-150.csv").open(
        encoding="utf-8", newline=""
    ) as handle:
        launch = list(csv.DictReader(handle))
    if len(launch) != 150 or len({row["family"] for row in launch}) != 150:
        raise RuntimeError("launch manifest must contain exactly 150 unique families")
    commits = {row["source_url"].split("/tree/", 1)[1].split("/", 1)[0] for row in launch}
    if len(commits) != 1:
        raise RuntimeError("launch manifest does not use one pinned source commit")
    expected_commit = next(iter(commits))
    commit = verify_repo(repo, expected_commit)
    if shutil.disk_usage(root).free < MIN_FREE_BYTES:
        raise RuntimeError("less than 5 GiB free; refusing curated download")
    tree_files = git_tree_files(repo, commit)
    files_by_family: Dict[str, List[str]] = {}
    all_selected_files: List[str] = []
    for row in launch:
        files = selected_tree_files(row["source_path"], tree_files)
        files_by_family[row["family"]] = files
        all_selected_files.extend(files)
    materialize(repo, all_selected_files)

    inventory: List[Dict[str, object]] = []
    checksums: List[Dict[str, object]] = []
    failures: List[Dict[str, object]] = []
    for row in launch:
        relative_files = files_by_family[row["family"]]
        paths = [repo / relative for relative in relative_files]
        missing = [relative for relative, path in zip(relative_files, paths) if not path.is_file()]
        symlinks = [relative for relative, path in zip(relative_files, paths) if path.is_symlink()]
        font_paths = [path for path in paths if path.suffix.lower() in FONT_SUFFIXES]
        bad_magic = [str(path.relative_to(repo)) for path in font_paths if not verify_font_magic(path)]
        total_bytes = sum(path.stat().st_size for path in paths if path.is_file())
        reason = ""
        status = "DOWNLOADED_REVIEW"
        if missing:
            status, reason = "FAILED", "MISSING_FILES:" + ";".join(missing)
        elif symlinks:
            status, reason = "FAILED", "SYMLINK_FILES:" + ";".join(symlinks)
        elif not font_paths:
            status, reason = "FAILED", "NO_FONT_FILES"
        elif bad_magic:
            status, reason = "FAILED", "INVALID_FONT_MAGIC:" + ";".join(bad_magic)
        elif total_bytes > MAX_FAMILY_BYTES:
            status, reason = "FAILED", "FAMILY_EXCEEDS_512_MIB"
        inventory_row = {
            "family": row["family"],
            "source_path": row["source_path"],
            "source_commit": commit,
            "license": row["license"],
            "license_file": Path(row["source_path"], "OFL.txt").name
            if row["license"] == "OFL-1.1"
            else ("LICENSE.txt" if row["license"] == "Apache-2.0" else "UFL.txt"),
            "reserved_font_names": row["reserved_font_names"],
            "font_file_count": len(font_paths),
            "support_file_count": len(paths) - len(font_paths),
            "total_bytes": total_bytes,
            "status": status,
            "reason": reason,
        }
        inventory.append(inventory_row)
        if status == "FAILED":
            failures.append(inventory_row)
        for path in paths:
            if path.is_file() and not path.is_symlink():
                checksums.append(
                    {
                        "family": row["family"],
                        "relative_path": str(path.relative_to(root)),
                        "size_bytes": path.stat().st_size,
                        "sha256": sha256(path),
                    }
                )

    queue_fields = list(launch[0].keys()) + ["queue_source", "queue_status"]
    queue_rows = []
    for row in launch:
        item = dict(row)
        item.update(
            queue_source="USER_CONFIRMED_CURATED_LAUNCH_150",
            queue_status="SELECTED_FOR_DOWNLOAD",
        )
        queue_rows.append(item)
    write_csv(reports / "fonts-download-queue.csv", queue_fields, queue_rows)
    write_csv(reports / "fonts-download-inventory.csv", INVENTORY_FIELDS, inventory)
    write_csv(reports / "fonts-download-failed.csv", INVENTORY_FIELDS, failures)
    write_csv(
        reports / "fonts-download-checksums.csv",
        ["family", "relative_path", "size_bytes", "sha256"],
        checksums,
    )
    statuses = Counter(str(row["status"]) for row in inventory)
    summary = [
        "# Curated launch download summary",
        "",
        f"- Generated at: {datetime.now(timezone.utc).isoformat()}",
        f"- Source commit: `{commit}`",
        "- Queue source: USER_CONFIRMED_CURATED_LAUNCH_150",
        f"- Families requested: {len(launch)}",
        f"- Statuses: {json.dumps(dict(statuses), sort_keys=True)}",
        f"- Font files: {sum(int(row['font_file_count']) for row in inventory)}",
        f"- Support files: {sum(int(row['support_file_count']) for row in inventory)}",
        f"- Total selected bytes: {sum(int(row['total_bytes']) for row in inventory)}",
        f"- Checksummed files: {len(checksums)}",
        "- SEO Opportunity Score: UNASSESSED; user explicitly approved downloading the curated set",
        "- Approval: NOT APPROVED; downloaded originals still require analysis and final license gate",
        "",
    ]
    (reports / "fonts-download-summary.md").write_text(
        "\n".join(summary), encoding="utf-8"
    )
    print(f"families: {len(launch)}")
    print("statuses: " + json.dumps(dict(statuses), sort_keys=True))
    print(f"font files: {sum(int(row['font_file_count']) for row in inventory)}")
    print(f"checksummed files: {len(checksums)}")
    return 1 if failures else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, KeyError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
