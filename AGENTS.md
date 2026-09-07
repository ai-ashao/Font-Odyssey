# FontOdyssey agent contract

- Keep FontOdyssey a curated catalog, not an indiscriminate font mirror.
- Preserve `curationRank` as the default public order.
- Do not publish a family unless the final license gate says `APPROVED`.
- Treat Reserved Font Names conservatively when generating derivative previews.
- Do not commit `staging/`, `analysis/`, `reports/`, generated ZIPs, or local virtual environments.
- Keep real localized equivalents behind shared components and stable page identities.
- Run `pnpm verify`, the Python unit tests, and `git diff --check` before release.
- `origin` must be the FontOdyssey repository. The ShipLean `template` remote is fetch-only.
