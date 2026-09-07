#!/usr/bin/env python3
"""Preflight Google Fonts candidates without approving or downloading fonts.

The script validates candidates against a pinned google/fonts Git tree,
materializes only small license files (while preserving existing pilot paths),
and emits fail-closed ALLOW_CANDIDATE / REVIEW / REJECT reports.
"""

import argparse
import csv
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple


OFFICIAL_REPO_URL = "https://github.com/google/fonts.git"
KNOWN_LICENSES = {
    "ofl": ("OFL-1.1", "OFL.txt", ("SIL OPEN FONT LICENSE", "Version 1.1")),
    "apache": ("Apache-2.0", "LICENSE.txt", ("Apache License", "Version 2.0")),
    "ufl": ("UFL-1.0", "UFL.txt", ("UBUNTU FONT LICENCE", "Version 1.0")),
}
FONT_SUFFIXES = {".ttf", ".otf", ".woff", ".woff2"}
OUTPUT_FIELDS = [
    "family",
    "slug",
    "source_commit",
    "source_path",
    "source_url",
    "license",
    "license_file",
    "license_sha256",
    "reserved_font_names",
    "notice_file",
    "metadata_present",
    "upstream_info_present",
    "font_file_count",
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


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def parse_reserved_font_names(license_text: str) -> str:
    header = re.split(
        r"SIL\s+OPEN\s+FONT\s+LICENSE", license_text, maxsplit=1, flags=re.IGNORECASE
    )[0]
    matches = re.finditer(
        r"reserved font names?\s*:?\s*(.*?)(?:\n\s*\n|$)",
        header,
        flags=re.IGNORECASE | re.DOTALL,
    )
    names: List[str] = []
    for match in matches:
        declaration = re.sub(r"\s+", " ", match.group(1)).strip(" .,;:'\"“”‘’")
        names.extend(
            part.strip(" .:'\"“”‘’")
            for part in declaration.split(",")
            if part.strip(" .:'\"“”‘’")
        )
    return ";".join(names)


def verify_repo(repo: Path, expected_commit: Optional[str]) -> str:
    if not (repo / ".git").is_dir():
        raise RuntimeError(f"missing google/fonts checkout: {repo}")
    origin = run("git", "remote", "get-url", "origin", cwd=repo)
    if origin != OFFICIAL_REPO_URL and not origin.endswith(
        "/https://github.com/google/fonts.git"
    ):
        raise RuntimeError(f"unexpected upstream origin: {origin}")
    if run("git", "status", "--porcelain", cwd=repo):
        raise RuntimeError("google/fonts checkout is dirty; refusing preflight")
    commit = run("git", "rev-parse", "HEAD", cwd=repo)
    if expected_commit and commit != expected_commit:
        raise RuntimeError(f"snapshot mismatch: expected {expected_commit}, got {commit}")
    return commit


def git_tree_files(repo: Path, commit: str) -> Set[str]:
    listing = run("git", "ls-tree", "-r", "--name-only", commit, cwd=repo)
    return set(listing.splitlines())


def preserve_pilot_paths(root: Path) -> List[str]:
    report = root / "reports" / "acquisition-pilot.csv"
    if not report.is_file():
        return []
    with report.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    paths = []
    for row in rows:
        source_url = row.get("source_url", "")
        marker = "/tree/" + row.get("source_commit", "") + "/"
        if marker in source_url:
            paths.append("/" + source_url.split(marker, 1)[1].strip("/") + "/")
    return sorted(set(paths))


def materialize_licenses(repo: Path, root: Path) -> None:
    patterns = [
        "/ofl/*/OFL.txt",
        "/apache/*/LICENSE.txt",
        "/apache/*/NOTICE",
        "/apache/*/NOTICE.txt",
        "/ufl/*/UFL.txt",
        "/ufl/*/LICENCE.txt",
    ]
    patterns.extend(preserve_pilot_paths(root))
    run(
        "git",
        "sparse-checkout",
        "set",
        "--no-cone",
        "--stdin",
        cwd=repo,
        input_text="\n".join(patterns) + "\n",
    )


def candidate_paths(slug: str, tree_files: Set[str]) -> List[str]:
    matches = []
    for license_root in KNOWN_LICENSES:
        prefix = f"{license_root}/{slug}/"
        if any(path.startswith(prefix) for path in tree_files):
            matches.append(prefix.rstrip("/"))
    return matches


def read_license(repo: Path, source_path: str) -> Tuple[str, str, bytes]:
    license_root = source_path.split("/", 1)[0]
    license_id, expected_name, markers = KNOWN_LICENSES[license_root]
    candidates = [expected_name]
    if license_root == "ufl":
        candidates.append("LICENCE.txt")
    for name in candidates:
        path = repo / source_path / name
        if path.is_file() and not path.is_symlink():
            payload = path.read_bytes()
            text = payload.decode("utf-8", errors="replace")
            if all(marker.lower() in text.lower() for marker in markers):
                return license_id, name, payload
    return "", "", b""


def classify(
    candidate: Dict[str, str], repo: Path, tree_files: Set[str], commit: str
) -> Dict[str, object]:
    family = candidate["family"]
    slug = candidate["slug"]
    matches = candidate_paths(slug, tree_files)
    base: Dict[str, object] = {
        "family": family,
        "slug": slug,
        "source_commit": commit,
        "source_path": "",
        "source_url": "",
        "license": "",
        "license_file": "",
        "license_sha256": "",
        "reserved_font_names": "",
        "notice_file": "",
        "metadata_present": False,
        "upstream_info_present": False,
        "font_file_count": 0,
        "status": "REJECT",
        "reason": "SOURCE_NOT_FOUND",
    }
    if len(matches) > 1:
        base.update(reason="MULTIPLE_LICENSE_ROOTS", status="REVIEW")
        return base
    if not matches:
        return base
    source_path = matches[0]
    prefix = source_path + "/"
    family_files = [path for path in tree_files if path.startswith(prefix)]
    license_id, license_file, license_payload = read_license(repo, source_path)
    notice_file = next(
        (name for name in ("NOTICE", "NOTICE.txt") if prefix + name in tree_files),
        "",
    )
    font_file_count = sum(
        Path(path).suffix.lower() in FONT_SUFFIXES for path in family_files
    )
    metadata_present = prefix + "METADATA.pb" in tree_files
    upstream_present = prefix + "upstream_info.md" in tree_files
    base.update(
        source_path=source_path,
        source_url=f"https://github.com/google/fonts/tree/{commit}/{source_path}",
        license=license_id,
        license_file=license_file,
        license_sha256=sha256_bytes(license_payload) if license_payload else "",
        reserved_font_names=(
            parse_reserved_font_names(license_payload.decode("utf-8", errors="replace"))
            if license_id == "OFL-1.1"
            else ""
        ),
        notice_file=notice_file,
        metadata_present=metadata_present,
        upstream_info_present=upstream_present,
        font_file_count=font_file_count,
    )
    if not license_id:
        base.update(reason="LICENSE_MISSING_OR_UNRECOGNIZED")
    elif not font_file_count:
        base.update(reason="NO_FONT_FILES")
    elif not metadata_present:
        base.update(status="REVIEW", reason="METADATA_MISSING")
    else:
        base.update(status="ALLOW_CANDIDATE", reason="KNOWN_LICENSE_AND_OFFICIAL_SOURCE")
    return base


def write_csv(path: Path, rows: Iterable[Dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def write_reports(root: Path, rows: List[Dict[str, object]], commit: str) -> None:
    reports = root / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    write_csv(reports / "fonts-preflight.csv", rows)
    write_csv(
        reports / "fonts-preflight-allow.csv",
        (row for row in rows if row["status"] == "ALLOW_CANDIDATE"),
    )
    write_csv(
        reports / "fonts-review.csv",
        (row for row in rows if row["status"] == "REVIEW"),
    )
    write_csv(
        reports / "fonts-rejected.csv",
        (row for row in rows if row["status"] == "REJECT"),
    )
    statuses = Counter(str(row["status"]) for row in rows)
    licenses = Counter(str(row["license"] or "NONE") for row in rows)
    reasons = Counter(str(row["reason"]) for row in rows)
    summary = [
        "# Font source and license preflight",
        "",
        f"- Generated at: {datetime.now(timezone.utc).isoformat()}",
        f"- Source commit: `{commit}`",
        f"- Candidate families checked: {len(rows)}",
        f"- Statuses: {json.dumps(dict(statuses), sort_keys=True)}",
        f"- Licenses: {json.dumps(dict(licenses), sort_keys=True)}",
        f"- Reasons: {json.dumps(dict(reasons), sort_keys=True)}",
        f"- RFN declarations: {sum(bool(row['reserved_font_names']) for row in rows)}",
        f"- Missing upstream_info.md: {sum(not row['upstream_info_present'] for row in rows)}",
        "- Approval: NONE; ALLOW_CANDIDATE still requires SEO scoring and final license gate",
        "",
    ]
    (reports / "fonts-preflight-summary.md").write_text(
        "\n".join(summary), encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    repo = root / "staging" / "google-fonts"
    snapshot_path = root / "reports" / "acquisition-pilot-source.json"
    expected_commit = None
    if snapshot_path.is_file():
        expected_commit = json.loads(snapshot_path.read_text(encoding="utf-8"))[
            "source_commit"
        ]
    commit = verify_repo(repo, expected_commit)
    tree_files = git_tree_files(repo, commit)
    materialize_licenses(repo, root)
    candidate_path = root / "reports" / "google-fonts-candidates.csv"
    with candidate_path.open(encoding="utf-8", newline="") as handle:
        candidates = list(csv.DictReader(handle))
    rows = [classify(candidate, repo, tree_files, commit) for candidate in candidates]
    write_reports(root, rows, commit)
    statuses = Counter(str(row["status"]) for row in rows)
    print(f"checked: {len(rows)}")
    print("statuses: " + json.dumps(dict(statuses), sort_keys=True))
    print(f"source commit: {commit}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError, KeyError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
