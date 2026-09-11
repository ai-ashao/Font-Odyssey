#!/usr/bin/env python3
"""Read-only release audit + exact cmap index. Never uploads, republishes or edits font files.

Uses the project's existing fontTools dependency. Coverage is extracted from the *verified
WOFF2 bytes*, not guessed from the full font's language scores or the subset input string.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import tempfile
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

ASSET_ORIGIN = 'https://assets.fontodyssey.com'
SITE_ORIGIN = 'https://fontodyssey.com'
MAX_OBJECT = 64 * 1024 * 1024
MAX_PREVIEW = 8 * 1024 * 1024
DEFAULT_DOWNLOADS = ['inter', 'firasans', 'notoserifsc', 'notoseriftc', 'raleway']


def sample_text(language_group: str) -> str:
    return {
        'Chinese': '字型探索 FontOdyssey 0123456789',
        'Japanese': '文字の旅 フォント FontOdyssey 0123456789',
        'Korean': '글꼴 여행 폰트 FontOdyssey 0123456789',
    }.get(language_group, 'Sphinx of black quartz, judge my vow.')


def atomic_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent, delete=False) as handle:
        tmp = Path(handle.name)
        json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write('\n')
    os.replace(tmp, path)


def validate_url(url: str, slug: str, version: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != 'https' or parsed.netloc != 'assets.fontodyssey.com' or parsed.query or parsed.fragment:
        raise ValueError('Asset must use the exact HTTPS production origin, without query or fragment')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or not version or any(ch not in '0123456789abcdefghijklmnopqrstuvwxyz-' for ch in version):
        raise ValueError('Invalid release identity')
    prefix = f'/fonts/{slug}/{version}/'
    if not parsed.path.startswith(prefix) or '/' in parsed.path[len(prefix):] or '%' in parsed.path or '..' in parsed.path:
        raise ValueError('Asset URL is outside its immutable release directory')
    return parsed.path


class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Immutable asset unexpectedly redirected; update evidence rather than following it')


def read_object(obj: dict[str, Any], slug: str, version: str, kind: str, local_assets: Path | None = None) -> tuple[bytes, dict[str, Any]]:
    path = validate_url(obj['url'], slug, version)
    size = obj['bytes']
    limit = MAX_PREVIEW if kind == 'preview' else MAX_OBJECT
    if not isinstance(size, int) or isinstance(size, bool) or not 0 < size <= limit:
        raise ValueError(f'Invalid or oversized {kind} object: {size}')
    sha = obj['sha256']
    if not isinstance(sha, str) or len(sha) != 64 or any(ch not in '0123456789abcdef' for ch in sha):
        raise ValueError('Invalid SHA-256')
    if local_assets:
        candidate = (local_assets / path.lstrip('/')).resolve()
        if not candidate.is_relative_to(local_assets.resolve()):
            raise ValueError('Local asset escaped its root')
        with candidate.open('rb') as handle:
            data = handle.read(size + 1)
        headers = {'corsOk': None, 'contentType': 'local-file', 'status': None}
    else:
        request = urllib.request.Request(obj['url'], headers={'Origin': SITE_ORIGIN, 'Accept-Encoding': 'identity', 'User-Agent': 'FontOdyssey-release-audit/1.0'})
        opener = urllib.request.build_opener(NoRedirects())
        with opener.open(request, timeout=25) as response:
            if response.status != 200:
                raise ValueError(f'Expected HTTP 200, got {response.status}')
            data = response.read(size + 1)
            content_type = response.headers.get('Content-Type', '').split(';')[0].strip().lower()
            expected = obj.get('contentType', '').split(';')[0].strip().lower()
            if content_type != expected:
                raise ValueError(f'Content-Type mismatch: {content_type!r}, expected {expected!r}')
            allowed = response.headers.get('Access-Control-Allow-Origin', '')
            headers = {'status': response.status, 'contentType': content_type, 'corsOk': allowed in (SITE_ORIGIN, '*'), 'allowOrigin': allowed, 'cacheStatus': response.headers.get('CF-Cache-Status', '')}
    if len(data) != size:
        raise ValueError(f'Byte count mismatch: expected {size}, received {len(data)}')
    actual = hashlib.sha256(data).hexdigest()
    if actual != sha:
        raise ValueError('SHA-256 mismatch: do not publish evidence for these bytes')
    return data, headers


def extract_preview(data: bytes, font: dict[str, Any], obj: dict[str, Any]) -> dict[str, Any]:
    from fontTools.ttLib import TTFont
    with TTFont(io.BytesIO(data), lazy=False) as parsed:
        if parsed.flavor != 'woff2':
            raise ValueError('Preview payload is not WOFF2')
        cmap = parsed.getBestCmap() or {}
        codepoints = sorted(cp for cp, glyph in cmap.items() if parsed.getGlyphID(glyph) != 0 and not 0xD800 <= cp <= 0xDFFF)
    if not codepoints or len(codepoints) > 100000:
        raise ValueError('Preview has no usable cmap or exceeds the index limit')
    available = set(codepoints)
    preferred = sample_text(font['languageGroup'])
    default = ''.join(ch for ch in preferred if ord(ch) in available).strip()
    if not default:
        default = ''.join(chr(cp) for cp in codepoints if unicodedata.category(chr(cp))[0] not in ('C', 'M'))[:70].strip()
    if not default:
        raise ValueError('No printable default specimen can be made')
    return {'previewUrl': obj['url'], 'sha256': obj['sha256'], 'bytes': obj['bytes'], 'codepoints': codepoints, 'defaultText': default[:140]}


def verify_zip(data: bytes) -> dict[str, Any]:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        infos = archive.infolist()
        names = [item.filename for item in infos]
        if len(infos) > 2000 or len(names) != len(set(names)) or sum(item.file_size for item in infos) > 256 * 1024 * 1024:
            raise ValueError('ZIP exceeds safe extraction limits or contains duplicate names')
        if any(name.startswith(('/', '\\')) or '..' in name.replace('\\', '/').split('/') for name in names):
            raise ValueError('Unsafe ZIP entry')
        if 'LICENSE.txt' not in names or 'SOURCE.txt' not in names:
            raise ValueError('ZIP lacks license/source notices')
        formats = sorted({Path(name).suffix.lower()[1:].upper() for name in names if Path(name).suffix.lower() in ('.ttf', '.otf', '.woff', '.woff2')})
        if not formats:
            raise ValueError('ZIP contains no font files')
        if archive.testzip():
            raise ValueError('ZIP CRC verification failed')
        return {'entries': len(names), 'formats': formats, 'licenseAndSourcePresent': True}


def audit_preview(release: dict[str, Any], font: dict[str, Any], local_assets: Path | None, require_cors: bool) -> tuple[str, dict[str, Any], dict[str, Any]]:
    if font['finalStatus'] != 'APPROVED' or release.get('status') != 'VERIFIED' or font['sourceCommit'] != release['sourceCommit']:
        raise ValueError('Approval/source/release gate mismatch')
    if release['previewStatus'] not in ('GENERATED_SUBSET', 'ORIGINAL_UNMODIFIED_WEBFONT'):
        raise ValueError('A preview object exists for a non-previewable release')
    if font.get('reservedFontNames') and release['previewStatus'] == 'GENERATED_SUBSET':
        raise ValueError('RFN derivative preview is not permitted by the current gate')
    data, headers = read_object(release['preview'], release['slug'], release['releaseVersion'], 'preview', local_assets)
    if require_cors and not headers['corsOk']:
        raise ValueError(f'Production Origin did not receive a valid CORS response: {headers}')
    return release['slug'], extract_preview(data, font, release['preview']), headers


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path.cwd())
    parser.add_argument('--write-coverage', action='store_true')
    parser.add_argument('--require-cors', action='store_true')
    parser.add_argument('--sample-downloads', action='store_true')
    parser.add_argument('--check-coverage', action='store_true', help='Offline readiness gate; no HTTP requests or writes')
    parser.add_argument('--local-assets', type=Path, help='Optional local immutable /fonts/... mirror; never pretends to test CORS')
    args = parser.parse_args(argv)
    if args.local_assets and args.require_cors:
        parser.error('--require-cors needs live HTTP requests, not --local-assets')
    root = args.root.resolve()
    fonts = json.loads((root / 'src/data/font-catalog.json').read_text(encoding='utf-8'))['fonts']
    releases = json.loads((root / 'src/data/font-asset-releases.json').read_text(encoding='utf-8'))
    by_slug = {font['slug']: font for font in fonts}
    release_map = {release['slug']: release for release in releases}
    if len(by_slug) != len(fonts) or len(release_map) != len(releases) or set(by_slug) != set(release_map):
        raise ValueError('Catalog and release registry must match exactly without duplicate slugs')
    if args.check_coverage:
        payload = json.loads((root / 'src/data/font-preview-coverage.json').read_text(encoding='utf-8'))
        if not isinstance(payload, dict) or not isinstance(payload.get('releases'), dict):
            print('Invalid coverage index: releases must be an object')
            return 1
        stored = payload.get('releases', {})
        expected = {release['slug']: release for release in releases if release.get('preview')}
        problems = []
        if payload.get('version') != 1 or set(stored) != set(expected):
            problems.append('Coverage index must match all previewable releases exactly')
        for slug, release in expected.items():
            entry = stored.get(slug, {})
            if not isinstance(entry, dict):
                problems.append(f'{slug}: evidence must be an object')
                continue
            obj = release['preview']
            if entry.get('previewUrl') != obj['url'] or entry.get('sha256') != obj['sha256'] or entry.get('bytes') != obj['bytes']:
                problems.append(f'{slug}: missing or stale release evidence')
                continue
            cps = entry.get('codepoints', [])
            default = entry.get('defaultText', '')
            valid_cps = (
                isinstance(cps, list) and 0 < len(cps) <= 100000
                and all(isinstance(cp, int) and not isinstance(cp, bool)
                        and 0 <= cp <= 0x10FFFF and not 0xD800 <= cp <= 0xDFFF for cp in cps)
                and cps == sorted(set(cps))
            )
            # JavaScript string.length measures UTF-16 code units, not Python code points.
            valid_text = (
                isinstance(default, str) and bool(default.strip())
                and len(default.encode('utf-16-le', errors='surrogatepass')) // 2 <= 140
            )
            if not valid_cps or not valid_text or not set(map(ord, default)).issubset(cps):
                problems.append(f'{slug}: invalid cmap evidence or default text')
        print(json.dumps({'previewableReleases': len(expected), 'indexedReleases': len(stored), 'problems': problems}, ensure_ascii=False, indent=2))
        return 1 if problems else 0
    coverage: dict[str, Any] = {}
    result: dict[str, Any] = {'catalogFamilies': len(fonts), 'previewChecks': {}, 'downloadChecks': {}, 'failures': {}, 'coverageWritten': False, 'liveHttp': args.local_assets is None}
    preview_releases = [release for release in releases if release.get('preview')]
    with ThreadPoolExecutor(max_workers=3) as executor:
        work = {executor.submit(audit_preview, release, by_slug[release['slug']], args.local_assets, args.require_cors): release['slug'] for release in preview_releases}
        for future in as_completed(work):
            slug = work[future]
            try:
                slug, evidence, headers = future.result()
                coverage[slug] = evidence
                result['previewChecks'][slug] = {**headers, 'sha256Verified': True, 'codepointCount': len(evidence['codepoints'])}
            except Exception as error:
                result['failures'][f'preview:{slug}'] = f'{type(error).__name__}: {error}'
    if args.sample_downloads:
        for slug in DEFAULT_DOWNLOADS:
            try:
                release = release_map[slug]
                package, headers = read_object(release['package'], slug, release['releaseVersion'], 'package', args.local_assets)
                license_data, _ = read_object(release['license'], slug, release['releaseVersion'], 'license', args.local_assets)
                if not license_data.strip():
                    raise ValueError('Empty license')
                result['downloadChecks'][slug] = {**headers, 'sha256Verified': True, **verify_zip(package)}
            except Exception as error:
                result['failures'][f'download:{slug}'] = f'{type(error).__name__}: {error}'
    if args.write_coverage and not result['failures']:
        atomic_json(root / 'src/data/font-preview-coverage.json', {'version': 1, 'releases': coverage})
        result['coverageWritten'] = True
    atomic_json(root / 'reports/font-preview-audit.json', result)
    print(json.dumps({'previewsPassed': len(coverage), 'previewsExpected': len(preview_releases), 'downloadsPassed': len(result['downloadChecks']), 'coverageWritten': result['coverageWritten'], 'failures': result['failures']}, ensure_ascii=False, indent=2))
    return 1 if result['failures'] else 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError) as error:
        print(f'Audit failed: {error}')
        raise SystemExit(1)
