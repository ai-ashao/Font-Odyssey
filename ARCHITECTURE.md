# FontOdyssey architecture

FontOdyssey uses the ShipLean TanStack Start and Cloudflare-first foundation.

```text
Google Fonts pinned source
  -> curation and download
  -> fontTools analysis
  -> final license gate
  -> deterministic packages and frontend catalog
  -> TanStack Start discovery pages
```

`data/font-catalog/` stores the compact checked-in evidence required to rebuild
the frontend snapshot. `src/data/font-catalog.json` is generated and contains only
families whose final gate is `APPROVED`. The exporter and frontend both enforce
`src/data/font-publishing.schema.json`; unknown preview states and incomplete facts
fail closed.

Publishing is split into three evidence layers: approval facts, verified asset
releases, and locale-specific editorial content. A future detail route becomes
eligible only when all three layers agree on the font identity and the preview is
compatible with its Reserved Font Name constraints. Site components never infer
approval or asset readiness from upstream availability.

Local packaging writes to ignored `artifacts/font-releases/{releaseVersion}` instead
of the website build `dist/`. The local manifest mirrors future versioned R2 object
keys, but stays explicitly non-publishable until a separate upload and remote
readback step produces a `VERIFIED` asset release.

Large binary download packages remain outside Git. Production storage and URLs
must be configured before download buttons are enabled. The web runtime does not
require authentication, payments, a database, email, or server-side font processing.
