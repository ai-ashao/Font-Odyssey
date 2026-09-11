#!/usr/bin/env bash
# Run from any directory. This performs read-only asset checks and local build/tests, not deployment.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -x .venv/bin/python ]]; then
  printf '%s\n' 'Create the existing project Python environment first:' \
    'python3 -m venv .venv' '.venv/bin/pip install -r requirements-font-ingest.txt'
  exit 1
fi
command -v pnpm >/dev/null || { echo 'pnpm 11.9.0 is required by this repository.'; exit 1; }
.venv/bin/python scripts/font-preview-assets.py --write-coverage --require-cors --sample-downloads
.venv/bin/python scripts/font-preview-assets.py --check-coverage
pnpm exec biome check --write \
  package.json scripts/check-font-preview-coverage.mjs tests/preview-build-guard.node.mjs \
  tests/font-preview-loader.test.ts \
  src/components/font-card.tsx src/components/font-catalog-page.tsx \
  src/components/font-detail-page.tsx src/components/font-detail-content.tsx \
  src/components/font-home.tsx src/components/font-preview.tsx \
  src/lib/font-preview-contract.ts src/lib/font-preview-loader.ts \
  src/data/font-preview-coverage.json src/font-usability.css \
  src/routes/__root.tsx tests/font-preview-contract.test.ts tests/browser-viewport.spec.ts
pnpm verify
git diff --check
printf '%s\n' 'Local verification completed. No deployment was performed; keep temporary noindex enabled.'
