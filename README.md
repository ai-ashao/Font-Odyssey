# FontOdyssey

FontOdyssey is a focused multilingual font discovery and download project. The
launch catalog contains 149 license-gated families, ordered by a frozen editorial
`curationRank` rather than ingestion or alphabetical order.

## Product foundation

- TanStack Start, React, strict TypeScript, Tailwind CSS, and shadcn/ui primitives;
- Cloudflare-first runtime inherited from ShipLean;
- English and Simplified Chinese home and font-directory routes;
- search, category, language, Featured, Popular, A–Z, and Most Styles controls;
- canonical, reciprocal hreflang, sitemap, robots, security-header, and legal-page contracts;
- a reproducible Python acquisition, analysis, license-gate, and packaging pipeline.

The repository intentionally does not track generated font ZIPs, WOFF2 previews,
the Google Fonts staging checkout, or analysis reports. Those local artifacts are
large and reproducible. Production font assets are published as immutable, remotely
verified objects under `https://assets.fontodyssey.com`; Git stores release metadata,
not the generated binary payloads.

## Run the site

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Verify

```bash
pnpm verify
```

## Refresh the site catalog

The checked-in source evidence is under `data/font-catalog/`. After updating the
final gate reports, regenerate the compact frontend snapshot with:

```bash
python3 scripts/font-ingest/export_site_catalog.py --root .
```

The exporter validates the shared publishing schema, rejects non-`APPROVED`
rows, preserves preview restrictions, and writes catalog version 2. Running it
twice with unchanged evidence must produce identical bytes.

For a full acquisition run, create a Python virtual environment, install
`requirements-font-ingest.txt`, and follow the scripts in `scripts/font-ingest/`.

## Build the local five-font pilot

The checked-in pilot selection covers variable Latin, static Latin, Simplified
Chinese, Traditional Chinese, and Reserved Font Name behavior:

```bash
.venv/bin/python scripts/font-ingest/package_approved.py \
  --root . \
  --selection data/font-catalog/pilot-fonts-v1.json \
  --report-prefix pilot-fonts-v1
```

The command writes immutable local artifacts under ignored `artifacts/font-releases/`
and evidence reports under ignored `reports/`. Its manifest remains
`LOCAL_VERIFIED`, `publishable: false`, and `remoteReadback: false`; it does not
upload to R2 or deploy the website.

## Routes

- `/` and `/zh`: curated homepages with 12 featured families;
- `/fonts` and `/zh/fonts`: complete 149-family directories;
- `/about`, `/contact`, `/privacy-policy`, and `/terms-of-service`: trust and legal surfaces.

Privacy and Terms use the normal public-page publishing path and are included
in the sitemap. Their content is limited to the product's actual features and
data practices. The current SEO brief records user-provided product evidence
only; it makes no keyword-volume, difficulty, or SERP-ranking claim.

Production is configured for `https://fontodyssey.com`. Search indexing is
temporarily disabled sitewide through matching HTML robots metadata and the
`X-Robots-Tag` response header.
