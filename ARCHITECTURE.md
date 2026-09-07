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
Approved families. Site components read the snapshot and never infer approval
from upstream availability.

Large binary download packages remain outside Git. Production storage and URLs
must be configured before download buttons are enabled. The web runtime does not
require authentication, payments, a database, email, or server-side font processing.
