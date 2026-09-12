# FontOdyssey V1.3 — Round 1 Implementation

Baseline: `main@f91d8080aaadda37fd1d59b3c6dd123eac4496d8`.

This round implements the release/preview/internal-linking work that can be completed without Semrush exports or new font binaries.

## Included

- Fix GitHub Actions Python cache discovery by pointing `setup-python` at `requirements-font-ingest.txt`.
- Expand generated preview subsets from a sample-only seed to a baseline that includes A–Z, a–z, 0–9, common punctuation and currency characters, plus the locale specimen.
- Add deterministic related-font scoring for detail-to-detail internal links.
- Add detail-to-hub collection links for category, primary language, free-commercial, and variable-font collections when applicable.
- Add `scripts/release-readiness.mjs` to identify stale preview evidence and Latin previews that still need republishing.
- Add unit coverage for preview seed and related-font behavior.

## Deliberately deferred

- Quark/Baidu/netdisk routing and monetization.
- Opening search indexing (`indexingEnabled` stays `false`).
- New keyword hubs that require external keyword evidence.
- Bulk font expansion beyond the current catalog.
- New font binary publication. The code changes prepare the next asset release but do not fabricate or upload binary assets.

## After applying

1. Run `pnpm install --frozen-lockfile` if dependencies are absent.
2. Run `pnpm verify`.
3. Run `pnpm check:release` and inspect the report. Existing preview releases generated with the old sample-only seed are expected to be flagged until regenerated.
4. Regenerate approved font artifacts from the real staging source with the updated `package_approved.py`.
5. Publish immutable R2 release objects using the existing pipeline, remote-readback them, then regenerate `src/data/font-preview-coverage.json` with the existing production audit workflow.
6. Run `pnpm check:release -- --strict`; it must pass before the indexing decision.
7. Keep `indexingEnabled: false` until full production QA is complete.

## Non-goals

This package does not deploy, upload R2 objects, change Cloudflare configuration, change netdisk behavior, or enable indexing.
