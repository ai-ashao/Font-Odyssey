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
large and reproducible. A production download store and public domain are still
release gates.

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

For a full acquisition run, create a Python virtual environment, install
`requirements-font-ingest.txt`, and follow the scripts in `scripts/font-ingest/`.

## Routes

- `/` and `/zh`: curated homepages with 12 featured families;
- `/fonts` and `/zh/fonts`: complete 149-family directories;
- `/about`, `/contact`, `/privacy-policy`, and `/terms-of-service`: trust and legal surfaces.

Privacy and Terms remain in starter legal-review status and stay out of the
sitemap until reviewed. The current SEO brief records user-provided product
evidence only; it makes no keyword-volume, difficulty, or SERP-ranking claim.
