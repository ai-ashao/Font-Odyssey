# FontOdyssey V1.2 WP0 — Codex handoff

Base: `main@60cc7d1e1e933e615135c8bc89d9e1b3a289179d`

## Hard constraints

- Do **not** deploy.
- Do **not** run `pnpm deploy` or `wrangler deploy`.
- Do **not** download/expand the font catalog in this WP0 pass.
- Do **not** upload anything to R2 yet.
- Apply the patch, regenerate generated router output through the normal build, run verification, and stop.

## Intended changes

1. Remove the conflicting `/fonts/$slug` detail route. `/font/{slug}` remains the only font entity URL; `/fonts/{hub}` remains collection/hub space.
2. Remove the obsolete plural-detail publishing registry if no imports remain after route removal.
3. Decouple page publication from optional preview rendering. A VERIFIED package + VERIFIED license + READY locale content can publish without a preview.
4. Keep preview validation strict: statuses that promise a preview require a verified WOFF2 object; statuses that mean no preview must not carry one.
5. Put Python font pipeline tests inside the main `pnpm verify` gate and provision Python/fontTools in GitHub Actions.
6. Make Official Source point to the pinned Google Fonts commit/path already stored in catalog facts.
7. Make the Quark “高速” claim explicit via `ctaMode: 'fast'`; ordinary links default to neutral “夸克网盘下载”.
8. Add the Semrush raw/derived-data contract. Raw paid CSVs stay under ignored `research/`.
9. Add the fail-closed Semrush normalizer and its Python unit tests; do not score or commit paid raw rows yet.

## Required verification

Create/activate `.venv` and install `requirements-font-ingest.txt`, then run:

```bash
pnpm install --frozen-lockfile
pnpm verify
git diff --check
```

After `pnpm build` regenerates `src/routeTree.gen.ts`, verify the generated route tree contains:

```text
/font/$slug
/fonts/$hub
```

and does **not** contain:

```text
/fonts/$slug
```

Also confirm the three locale font entity paths remain:

```text
/font/{slug}
/zh/font/{slug}
/zh-tw/font/{slug}
```

## Stop condition

Stop after tests/build/typecheck/e2e pass and the generated router diff is included. Do not deploy, publish R2, or start the 30–50 font download pilot in this task.
