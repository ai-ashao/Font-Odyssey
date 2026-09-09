#!/usr/bin/env python3
"""Upload immutable release artifacts, read them back, and emit VERIFIED records."""

import argparse
import concurrent.futures
import csv
import hashlib
import json
import subprocess
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ORIGIN = "https://font-odyssey.wangshao0713.workers.dev"


def sha256_bytes(value):
    return hashlib.sha256(value).hexdigest()


def read_remote(url):
    separator = "&" if "?" in url else "?"
    request = urllib.request.Request(
        f"{url}{separator}verify={time.time_ns()}",
        headers={
            "Origin": ORIGIN,
            "User-Agent": "FontOdysseyPublisher/1",
            "Cache-Control": "no-cache",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.status, dict(response.headers.items()), response.read()
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers.items()), error.read()


def normalized_headers(headers):
    return {key.lower(): value for key, value in headers.items()}


def verify_remote(url, artifact):
    status, raw_headers, body = read_remote(url)
    headers = normalized_headers(raw_headers)
    if status == 404:
        return None
    issues = []
    if status != 200:
        issues.append(f"HTTP {status}")
    if len(body) != artifact["bytes"]:
        issues.append(f"bytes {len(body)} != {artifact['bytes']}")
    if sha256_bytes(body) != artifact["sha256"]:
        issues.append("SHA-256 mismatch")
    if headers.get("content-type") != artifact["contentType"]:
        issues.append(f"Content-Type {headers.get('content-type')!r}")
    if headers.get("access-control-allow-origin") != ORIGIN:
        issues.append("CORS origin mismatch")
    etag = headers.get("etag", "").strip('"')
    if not etag:
        issues.append("ETag missing")
    if issues:
        raise ValueError(f"remote object mismatch for {url}: {', '.join(issues)}")
    return etag


def verify_with_retry(url, artifact, attempts=8):
    for attempt in range(attempts):
        etag = verify_remote(url, artifact)
        if etag is not None:
            return etag
        if attempt + 1 < attempts:
            time.sleep(0.5 * (attempt + 1))
    return None


def upload(root, bucket, release_dir, artifact):
    source = (release_dir / artifact["localPath"]).resolve()
    if not source.is_relative_to(release_dir.resolve()) or not source.is_file():
        raise ValueError(f"unsafe or missing artifact: {artifact['localPath']}")
    body = source.read_bytes()
    if len(body) != artifact["bytes"] or sha256_bytes(body) != artifact["sha256"]:
        raise ValueError(f"local artifact mismatch: {artifact['localPath']}")
    result = subprocess.run(
        [
            "pnpm", "exec", "wrangler", "r2", "object", "put",
            f"{bucket}/{artifact['objectKey']}", "--remote", "--file", str(source),
            "--content-type", artifact["contentType"],
            "--cache-control", "public, max-age=31536000, immutable",
        ],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"R2 upload failed for {artifact['objectKey']}: {result.stderr}")


def release_records(manifest, verified, base_url):
    artifacts_by_family = {}
    for artifact in manifest["artifacts"]:
        artifacts_by_family.setdefault(artifact["family"], []).append(artifact)
    verified_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    records = []
    for font in manifest["fonts"]:
        family_artifacts = artifacts_by_family[font["family"]]
        slug = font["slug"]
        primary = next(
            item for item in family_artifacts
            if item["kind"] == "download_zip" and Path(item["localPath"]).name == f"{slug}.zip"
        )
        license_object = next(item for item in family_artifacts if item["kind"] == "license_text")
        preview = next((item for item in family_artifacts if item["kind"] == "preview_woff2"), None)

        def public_object(item):
            result = {
                "url": f"{base_url.rstrip('/')}/{item['objectKey']}",
                "sha256": item["sha256"],
                "bytes": item["bytes"],
                "contentType": item["contentType"],
                "etag": verified[item["objectKey"]],
            }
            return result

        record = {
            "slug": slug,
            "releaseVersion": manifest["releaseVersion"],
            "sourceCommit": manifest["sourceCommits"][0],
            "package": public_object(primary),
            "license": public_object(license_object),
            "previewStatus": font["previewStatus"],
            "status": "VERIFIED",
            "verifiedAt": verified_at,
        }
        if preview:
            record["preview"] = public_object(preview)
        records.append(record)
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--bucket", default="fontodyssey-assets")
    parser.add_argument("--base-url", default="https://assets.fontodyssey.com")
    parser.add_argument("--registry", type=Path, default=Path("src/data/font-asset-releases.json"))
    parser.add_argument("--report", type=Path)
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()
    root = args.root.resolve()
    manifest_path = args.manifest.resolve()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest["status"] != "LOCAL_VERIFIED" or manifest["publishable"] or manifest["remoteReadback"]:
        raise ValueError("manifest is not an unpublished LOCAL_VERIFIED release")
    release_dir = manifest_path.parent
    object_keys = [artifact["objectKey"] for artifact in manifest["artifacts"]]
    if len(object_keys) != len(set(object_keys)):
        raise ValueError("manifest contains duplicate object keys")

    def publish_artifact(artifact):
        url = f"{args.base_url.rstrip('/')}/{artifact['objectKey']}"
        etag = verify_remote(url, artifact)
        did_upload = False
        if etag is None:
            if not args.upload:
                raise ValueError(f"remote object missing: {artifact['objectKey']}")
            upload(root, args.bucket, release_dir, artifact)
            did_upload = True
            etag = verify_with_retry(url, artifact)
            if etag is None:
                raise ValueError(f"uploaded object is still missing: {artifact['objectKey']}")
        return artifact["objectKey"], etag, did_upload

    verified, uploaded = {}, 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(publish_artifact, artifact) for artifact in manifest["artifacts"]]
        for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
            object_key, etag, did_upload = future.result()
            verified[object_key] = etag
            uploaded += int(did_upload)
            print(f"verified {index}/{len(futures)}: {object_key}", flush=True)
    registry_path = (root / args.registry).resolve() if not args.registry.is_absolute() else args.registry
    existing = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else []
    merged = {record["slug"]: record for record in existing}
    merged.update({record["slug"]: record for record in release_records(manifest, verified, args.base_url)})
    with (root / "data/font-catalog/fonts-launch-150.csv").open(newline="", encoding="utf-8") as handle:
        ranks = {row["slug"]: int(row["curation_rank"]) for row in csv.DictReader(handle)}
    output = sorted(merged.values(), key=lambda record: ranks[record["slug"]])
    registry_path.parent.mkdir(parents=True, exist_ok=True)
    registry_path.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    summary = {
        "releaseVersion": manifest["releaseVersion"],
        "fonts": manifest["fontCount"], "objects": manifest["artifactCount"],
        "uploaded": uploaded, "verified": len(verified),
        "bytes": sum(item["bytes"] for item in manifest["artifacts"]),
        "previews": sum(font["previewStatus"] == "GENERATED_SUBSET" for font in manifest["fonts"]),
        "noPreviewRfn": sum(font["previewStatus"] == "UNAVAILABLE_RFN" for font in manifest["fonts"]),
        "registryCount": len(output),
    }
    if args.report:
        report_path = (root / args.report).resolve() if not args.report.is_absolute() else args.report
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
