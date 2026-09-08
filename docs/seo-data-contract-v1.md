# FontOdyssey Semrush SEO Data Contract V1

This contract is for the next SEO-scoring pass after the current 149-family catalog.
It deliberately keeps paid Semrush exports out of Git while allowing small derived evidence tables to be committed.

## Benchmark scope

Use the same benchmark for all three competitors unless a separate market study is explicitly requested:

- Database / market: US
- Device: Desktop
- Competitors: `fontmirror.com`, `fontget.com`, `fontbolt.com`
- Reports per competitor: Top Pages + Organic Keywords
- Suggested export depth: Top 300–500 pages, Top 1000 keywords

Do not mix US, UK, TW, or other databases in one score without a market field.

## Raw export location

The repository already ignores `research/`. Put paid/raw exports under:

```text
research/semrush/YYYY-MM-DD/
├── fontmirror.com-us-desktop-pages.csv
├── fontmirror.com-us-desktop-keywords.csv
├── fontget.com-us-desktop-pages.csv
├── fontget.com-us-desktop-keywords.csv
├── fontbolt.com-us-desktop-pages.csv
└── fontbolt.com-us-desktop-keywords.csv
```

Raw Semrush exports MUST NOT be committed.

## Required keyword fields

Keep these fields when available:

```text
Keyword
Position
Search Volume / Volume
KD / Keyword Difficulty
Traffic
Traffic %
URL
Intent
SERP Features
```

## Required page fields

Keep these fields when available:

```text
URL
Traffic
Traffic %
Keywords
Main Keyword
Referring Domains
Intent
```

Semrush column labels can differ by UI language/version. The importer must map aliases explicitly; it must not silently guess a field when two candidate columns exist.

## Provenance fields

Every derived record must retain:

```text
source_domain
report_type
market
device
captured_at
source_snapshot
```

`source_snapshot` should identify the raw snapshot directory/date, not copy the raw paid data into Git.


## Normalization command

After placing the six raw exports in one dated snapshot directory, run:

```bash
.venv/bin/python scripts/seo/import_semrush.py \
  --input-dir research/semrush/2026-09-08 \
  --market US \
  --device desktop \
  --captured-at 2026-09-08
```

Intermediate normalized files are written under ignored `reports/seo/`:

```text
reports/seo/
├── semrush-keywords-normalized.csv
├── semrush-pages-normalized.csv
└── semrush-snapshot.json
```

The importer is fail-closed for required headers and records unknown columns instead of guessing them. These normalized reports are still analysis intermediates and should not be committed.

## Derived repository outputs

After the raw files are available, generate compact evidence only:

```text
data/seo/
├── font-seo-evidence.csv
├── page-opportunities.csv
└── seo-snapshot.json
```

### `font-seo-evidence.csv`

Recommended fields:

```text
family
slug
keyword
keyword_type
market
device
captured_at
search_volume
kd
best_competitor_position
competitor_count
max_competitor_keyword_traffic
max_competitor_page_traffic
matched_competitors
seo_opportunity_score
seo_evidence_state
notes
```

`seo_evidence_state` is one of:

```text
ASSESSED
PARTIAL
UNASSESSED
```

### `page-opportunities.csv`

Keep page opportunities separate from downloadable font candidates. Example topics such as `fortnite font`, `tattoo fonts`, or `old english fonts` can be SEO opportunities without implying that FontOdyssey may redistribute a corresponding proprietary font file.

Recommended fields:

```text
keyword
normalized_topic
page_type
market
volume
kd
competitor_count
best_position
max_page_traffic
recommended_action
license_or_trademark_note
```

## Scoring rule

`seo_opportunity_score` measures search opportunity only. It must not include license status, R2 availability, download readiness, or editorial taste.

V1 weights:

| Factor | Weight |
|---|---:|
| Exact / near-exact font keyword demand | 35 |
| Competitor page / keyword traffic evidence | 25 |
| Multi-competitor validation | 15 |
| KD / attainability | 15 |
| Multi-market / locale expansion value | 10 |

Missing critical fields must produce `PARTIAL` or `UNASSESSED`; do not impute a neutral-looking number such as 50.

## Existing catalog first

Before selecting new downloads, score the existing 149 approved families. This separates:

- SEO-core fonts worth deeper editorial work;
- useful catalog fonts that should remain factual/templated;
- gaps that should drive the 149 → 300 → 500 expansion manifest.
