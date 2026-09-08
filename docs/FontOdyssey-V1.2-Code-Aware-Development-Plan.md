# FontOdyssey V1.2 — 基于现有代码的下一阶段开发文档

**文档版本**：v1.2（Code-aware revision）
**项目**：FontOdyssey.com
**仓库**：`ai-ashao/Font-Odyssey`
**审计基线**：`main@60cc7d1e1e933e615135c8bc89d9e1b3a289179d`
**审计日期**：2026-09-08
**阶段定位**：SEO-first 字体发现与安全下载站
**核心原则**：复用现有资产与发布门禁，不重写已经完成的 Pipeline；SEO 数据用于扩容与页面机会发现，不反向破坏稳定的授权与发布体系。

---

# 0. v1.2 结论先行

v1.1 的产品方向仍然成立，但其实施假设已经落后于当前仓库。

当前项目不是“尚未开始资源 Pipeline / 前端”的状态，而是已经具备：

- 149 个 `APPROVED` 字体家族；
- Google Fonts pinned source → 下载 → fontTools 分析 → License Gate → deterministic package 的完整资源链；
- EN / zh-CN / zh-TW 三语言首页、字体目录、字体详情入口与 SEO Hub；
- 实测字符覆盖率；
- 搜索、筛选、排序与 faceted query `noindex,follow`；
- sitemap / canonical / hreflang / robots / legal release gate；
- R2 / 夸克 / 百度下载接口契约；
- 本地 immutable release manifest 和远端验证模型。

因此，V1.2 **禁止重新实现**以下能力：

```text
License Gate
fontTools 字体解析
Google Fonts pinned-source acquisition
本地 deterministic ZIP packaging
字符覆盖率分析
基础三语前端
字体目录搜索/筛选
基础 SEO Hub
现有 canonical/hreflang 基础设施
```

下一阶段应收敛为：

```text
先修当前 P0 架构冲突
        ↓
导入 Semrush 竞品证据
        ↓
填充 seo_opportunity_score
        ↓
149 → 300 → 450–500 字体扩容
        ↓
复用并泛化现有 License / Analyze / Package Pipeline
        ↓
补齐 R2 Upload + Remote Readback
        ↓
建立可规模化三语内容生成/审核
        ↓
扩展高价值 SEO Hub
        ↓
上线 → GSC 数据循环
```

---

# 1. 当前代码基线

## 1.1 已完成：保留并继续使用

| 子系统 | 当前状态 | V1.2 决策 |
|---|---|---|
| TanStack Start / React / Cloudflare | 已完成 | 保留 |
| EN / zh-CN / zh-TW locale | 已完成 | 保留 |
| 字体首页 | 已完成 | 后续只做数据驱动优化 |
| `/fonts` 字体目录 | 已完成 | 保留 |
| 搜索 / category / language / sort | 已完成 | 扩展数据字段，不重写 |
| 参数筛选 noindex | 已完成 | 保留 |
| 字体详情 UI | 已完成 | 修正发布路径后继续增强 |
| 字符覆盖率 | 已完成 | 保留 |
| License Gate | 已完成 | 泛化 source adapter |
| 字体 SHA / parse / axes / glyph | 已完成 | 保留 |
| Deterministic ZIP | 已完成 | 保留 |
| WOFF2 subset preview | 已完成 | 调整 preview/page gate 关系 |
| Reserved Font Name 防护 | 已完成 | 保留保守策略 |
| 本地 release manifest | 已完成 | 接 R2 remote publish |
| sitemap / hreflang | 已完成基础 | 修正 URL 双轨问题 |
| SEO Hub | 已有 10 个 | 数据驱动扩展 |

## 1.2 当前真实资源状态

当前首发策展表为 150 个字体家族，其中：

```text
149 APPROVED
1 REVIEW
```

`Roboto Condensed` 当前处于：

```text
REVIEW
INTERNAL_LICENSE_METADATA_CONFLICT
```

因此以后所有文案和 KPI 统一使用：

> **149 approved families**

在该字体重新通过 Gate 前，不使用“150 approved”。

## 1.3 当前 SEO 选品状态

现有 `fonts-launch-150.csv` 已经预留：

```text
seo_opportunity_score
```

但目前统一为：

```text
UNASSESSED
```

这是本轮 Semrush 数据最自然的接入点。

现有：

```text
curation_score
```

和未来：

```text
seo_opportunity_score
```

必须保持独立。

定义：

```text
curation_score
= 产品策展 / Google Fonts popularity / 语言价值 / 页面深度潜力

seo_opportunity_score
= 外部真实搜索需求 / 竞品 SEO 流量证据 / SERP 机会
```

禁止把两个概念重新揉成一个不可解释的“总分”。

---

# 2. 本轮代码复审发现的 P0 问题

下面问题优先级高于继续扩字体。

---

## P0-1：字体详情 URL 存在双轨与动态路由冲突

当前代码同时存在：

```text
/font/$slug
/fonts/$slug
/fonts/$hub
```

其中：

```text
/font/$slug
```

是当前首页卡片、hreflang、sitemap 与三语言详情体系实际使用的路径。

同时新增的：

```text
/fonts/$slug
```

与：

```text
/fonts/$hub
```

具有完全相同的动态 URL shape。

这是发布前必须消除的结构性问题。

### V1.2 冻结决策

**保留当前已经贯穿全站的 URL 模型：**

```text
/                       首页
/fonts                  字体目录
/font/{slug}             单字体详情
/fonts/{hub-slug}        SEO Collection / Hub

/zh/...
/zh-tw/...
```

即：

```text
/font/inter
/zh/font/inter
/zh-tw/font/inter

/fonts/chinese
/fonts/sans-serif
/fonts/free-commercial
```

### 原因

1. 当前 `FontCard`、`font-routes.ts`、sitemap 和 locale switching 已经使用该模型；
2. `font` 单数 = entity page，`fonts` 复数 = collection page，语义清楚；
3. 能天然避免 font slug 与 hub slug 的路由冲突；
4. 不需要为了 URL 美观重构大量现有代码；
5. SEO 价值主要来自页面意图、内容和内链，不值得为 `/font/` vs `/fonts/` 重构。

### 必须修改

- 删除或退役 `src/routes/fonts.$slug.tsx`；
- 删除或重构 `src/lib/font-publishing-registry.ts` 中的 plural detail path；
- 所有 PublishedFont detail path 统一走 `fontPath()`；
- `routeTree.gen.ts` 重新生成后不得再同时出现：

```text
/fonts/$hub
/fonts/$slug
```

### 验收

```text
/font/inter             → font detail
/fonts/chinese          → hub
/fonts/inter            → 不得被动态解释成两个 route
```

若项目在修复前尚未对公网索引，则直接删除错误 route，不做 301。

如果确认 `/fonts/{font-slug}` 已经被真实用户/Google 收录，再单独制定迁移映射，不允许用一个会误伤 hub 的宽泛动态 redirect。

---

## P0-2：Preview Gate 错误阻塞可合法发布的字体详情页

当前 `fontPageEligible()` 要求：

```text
compliant preview asset
```

但当前 packaging 明确规定：

```text
Apache / UFL
→ ELIGIBLE_NOT_GENERATED
→ 不生成 V1 subset preview

OFL + Reserved Font Name
→ UNAVAILABLE_RFN
→ 不生成 derivative preview
```

这意味着当前逻辑会导致：

```text
授权合法
+ package VERIFIED
+ license VERIFIED
+ content READY
```

但因为没有 WOFF2 preview，字体详情页仍然永久无法 index。

这不合理。

### V1.2 冻结决策

拆成两个门禁：

```text
Font Page Publish Gate
Font Preview Render Gate
```

### Font Page Publish Gate

页面可以索引必须满足：

```text
approval facts = APPROVED
asset package = VERIFIED
license asset = VERIFIED
source identity matches
locale content = READY
```

**不要求一定存在 webfont preview。**

### Font Preview Render Gate

只有以下情况允许真正加载字体 face：

```text
GENERATED_SUBSET + no RFN
ORIGINAL_UNMODIFIED_WEBFONT
```

以下情况页面仍可发布，但 Live Preview 降级：

```text
UNAVAILABLE_RFN
ELIGIBLE_NOT_GENERATED
```

降级 UI：

```text
Preview unavailable / system fallback specimen
+ 解释原因
+ License / Source / Download 仍正常展示
```

### 验收测试新增

至少覆盖：

1. OFL + generated preview → 页面可索引；
2. OFL + RFN + no preview → 页面仍可索引，但不加载 derivative font；
3. Apache + no subset preview → 页面仍可索引；
4. 非 VERIFIED package → 页面不可索引；
5. preview 存在但不合规 → preview 不可渲染，且 release validator 报错。

---

## P0-3：R2 Production Publish 尚未完成

当前 `package_approved.py` 已经生成：

```text
local-release-manifest.json
status = LOCAL_VERIFIED
publishable = false
remoteReadback = false
objectKey
sha256
bytes
contentType
```

这是正确基础。

当前缺失的是：

```text
Upload
→ Remote Readback
→ VERIFIED Asset Release
→ Frontend Registry
```

而当前：

```text
fontAssetReleases = []
```

因此生产字体包和真实预览尚未发布。

### V1.2 新增脚本

建议：

```text
scripts/font-ingest/publish_r2_release.py
```

职责：

1. 输入 immutable local release manifest；
2. 上传全部 artifacts 到 R2；
3. 对每个 object 做远端 readback；
4. 校验：
   - HTTP 200
   - bytes
   - content-type
   - sha256
   - object key
5. 只有全部成功才生成：

```text
VERIFIED release manifest
```

6. 再生成 frontend-safe asset registry。

### 推荐数据路径

不要人工维护 TypeScript 数组。

改为：

```text
data/font-catalog/font-asset-releases.json
        ↓
src/modules/font-asset-releases.ts
只负责 import + validate
```

### 失败原则

```text
1 个 object readback 失败
→ 整个对应 family 不进入 VERIFIED
```

不得根据 R2 base URL + slug 猜测文件存在。

---

## P0-4：三语 Editorial Content 当前不可扩展到 300–500 字体

当前 `font-editorial-content.ts` 仅有少量 EN draft，且采用手写 TypeScript 数组。

对于 300–500 个字体 × 3 locales：

```text
900–1500 locale pages
```

完全手工维护不可行。

### V1.2 冻结方案：Factual Baseline + Editorial Override

拆成两层：

```text
Verified factual content
        +
optional editorial overrides
```

#### Baseline 内容

由已经验证的 metadata 自动生成，只允许描述可证明事实：

- family
- category
- style count
- weights
- variable axes
- character coverage
- license
- source
- designer / manufacturer（有证据时）
- taxonomy tags（有明确标注时）

禁止自动编造：

- “最适合奢侈品牌”
- “深受设计师喜爱”
- “2026 最流行”
- 未经数据支持的 use case

#### Editorial Override

只给 SEO 价值最高的字体做人工增强：

```text
Top 50 → 强人工增强
Top 150 → 中度增强
Long Tail → factual baseline
```

### 建议结构

```text
data/editorial/
├── overrides.en.json
├── overrides.zh-cn.json
└── overrides.zh-tw.json

scripts/font-content/build_font_content.py
        ↓
src/data/font-editorial-content.json
```

`src/modules/font-editorial-content.ts` 只读取生成结果。

### Schema 调整

建议增加：

```text
contentLevel:
  FACTUAL
  EDITORIAL

contentStatus:
  DRAFT
  READY
```

`useCases` 不应再作为所有页面 READY 的硬要求。

无真实证据时允许：

```text
useCases = []
```

避免为了通过 schema 生成假信息。

---

## P0-5：Python 字体 Pipeline 测试没有进入 CI 主门禁

当前仓库：

```text
pnpm verify
```

没有执行：

```text
pnpm test:fonts
```

而 GitHub Actions 也没有设置 Python + requirements。

这意味着字体 Pipeline 是核心资产，但 CI 实际不会自动测试它。

### V1.2 必须修改

CI 增加：

```text
setup-python
pip install -r requirements-font-ingest.txt
pnpm test:fonts
```

推荐最终：

```text
pnpm verify
```

直接包含 `test:fonts`，避免开发者忘记。

Release 前仍执行：

```text
pnpm verify
git diff --check
```

---

# 3. P1 代码问题

## P1-1：Official Source fallback 不够精确

当前 fallback 使用：

```text
https://fonts.google.com/?query={family}
```

但现有 catalog 已经拥有：

```text
sourcePath
sourceCommit
```

V1.2 应优先展示精确 pinned source：

```text
https://github.com/google/fonts/tree/{sourceCommit}/{sourcePath}
```

未来非 Google Fonts source 使用对应官方 URL。

原则：

> Official Source 应该是证据链接，不是搜索结果页。

---

## P1-2：中文网盘 CTA 文案无法验证“高速”语义

当前：

```text
只要 quark URL 存在
→ label = 高速网盘下载
```

数据结构只有 URL，没有体验验证状态。

建议改为：

```ts
{
  url,
  verifiedAt,
  ctaMode: 'standard' | 'fast',
  sponsored: true
}
```

只有：

```text
ctaMode = fast
```

才允许：

```text
高速下载
极速下载
```

否则默认：

```text
夸克网盘下载
```

---

## P1-3：当前 approval category 只有 5 种，不适合直接承担 SEO Taxonomy

当前 publication facts：

```text
Sans Serif
Serif
Display
Handwriting
Monospace
```

不要为了：

```text
Tattoo
Retro
Cursive
Old English
Wedding
Gaming
```

去污染或频繁修改 License / approval schema。

### 冻结决策

Approval facts 保留粗分类。

另建：

```text
SEO Taxonomy Layer
```

例如：

```text
styleTags
moodTags
useCaseTags
entityTags
aliases
```

这样资源证据和 SEO 页面分类解耦。

---

# 4. V1.2 URL Architecture 冻结

## 4.1 Font Entity

```text
/font/{slug}
/zh/font/{slug}
/zh-tw/font/{slug}
```

上线后该 URL 不因 keyword 变化而修改。

关键词：

```text
Inter
Inter font
Inter download
Inter font download
```

通过 Title / H1 / body / anchor 承接，不改 slug。

## 4.2 Font Directory

```text
/fonts
/zh/fonts
/zh-tw/fonts
```

参数搜索/筛选：

```text
/fonts?q=inter
/fonts?category=serif
```

维持：

```text
noindex,follow
```

除非某个筛选需求被正式提升成独立 SEO Hub。

## 4.3 SEO Hub

统一保持短结构：

```text
/fonts/{hub-slug}
/zh/fonts/{hub-slug}
/zh-tw/fonts/{hub-slug}
```

现有：

```text
/fonts/chinese
/fonts/japanese
/fonts/korean
/fonts/latin
/fonts/sans-serif
/fonts/serif
/fonts/handwriting
/fonts/monospace
/fonts/free-commercial
/fonts/variable-fonts
```

未来 Semrush 验证后新增：

```text
/fonts/cursive
/fonts/old-english
/fonts/tattoo
/fonts/wedding
/fonts/pixel
/fonts/retro
/fonts/gaming
...
```

不为了“信息架构看起来漂亮”强制拆成：

```text
/styles/
/use/
/languages/
```

当前阶段 URL 越稳定、越短越好。

---

# 5. SEO Hub Index Gate

新 Hub 不允许因为 taxonomy 有一个标签就自动生成。

必须同时满足：

```text
有独立 keyword / SERP intent
+ 至少 8 个真正相关字体
+ 有独立 title / h1 / intro
+ 不是另一个 Hub 的近义重复页
+ 能产生有意义的 internal links
```

推荐：

```text
>= 12 fonts      → 正常 index
8–11 fonts       → REVIEW
< 8 fonts        → 不创建 SEO Hub
```

竞争数据极强时可人工 override。

---

# 6. Phase A：Semrush 竞品数据接入

继续只研究：

```text
fontmirror.com
fontget.com
fontbolt.com
```

100font / maoken 保留为产品与中文市场参考，不用 Semrush 数据做主量化依据。

## 6.1 原始数据目录

仓库是 public repository。

**Semrush 原始付费导出不要提交 Git。**

利用现有 `.gitignore` 的：

```text
research/
```

保存：

```text
research/semrush/
└── 2026-09-xx/
    ├── fontmirror-us-desktop-pages.csv
    ├── fontmirror-us-desktop-keywords.csv
    ├── fontget-us-desktop-pages.csv
    ├── fontget-us-desktop-keywords.csv
    ├── fontbolt-us-desktop-pages.csv
    └── fontbolt-us-desktop-keywords.csv
```

默认 benchmark：

```text
Database: US
Device: Desktop
```

其他 market 必须单独记录，禁止混算。

## 6.2 新增导入脚本

建议：

```text
scripts/seo/import_semrush.py
```

输出可提交的派生数据：

```text
data/seo/
├── font-seo-evidence.csv
├── page-opportunities.csv
└── seo-snapshot.json
```

不得把完整付费原始 CSV 复制进 `data/`。

## 6.3 Font SEO Evidence 字段

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

`seo_evidence_state`：

```text
ASSESSED
PARTIAL
UNASSESSED
```

---

# 7. SEO Opportunity Score V1

该分数只衡量 SEO 机会。

不放：

- License；
- 设计审美；
- 下载是否已完成；
- R2 是否已发布。

建议：

| 因子 | 权重 |
|---|---:|
| Exact / near-exact font keyword demand | 35 |
| Competitor page / keyword traffic evidence | 25 |
| 多竞品重复验证 | 15 |
| KD / attainability | 15 |
| EN / zh / 多市场扩张价值 | 10 |

### 缺数据原则

不能因为缺 KD 就随便填 50。

如果关键字段不足：

```text
seo_evidence_state = PARTIAL / UNASSESSED
```

分数必须能追溯到原始快照。

### Existing 149

首先给当前 149 个字体补分。

这一步会告诉我们：

```text
当前 149 中
哪些是真正 SEO 核心
哪些只是策展价值高
哪些应该保留但不值得人工增强
```

---

# 8. Page Opportunity Pool

不要把 FontBolt 的所有 keyword 都塞进下载字体池。

独立维护：

```text
data/seo/page-opportunities.csv
```

字段：

```text
keyword
normalized_topic
page_type
market
volume
kd
competitor_page_traffic
competitor_count
legal_risk
asset_required
recommended_hub_slug
status
notes
```

`page_type`：

```text
FONT_DETAIL
STYLE_HUB
USE_CASE_HUB
LANGUAGE_HUB
LICENSE_HUB
ENTITY_REFERENCE
SIMILAR_FONT_PAGE
REJECT
```

例如：

```text
fortnite font
```

可以：

```text
ENTITY_REFERENCE
SIMILAR_FONT_PAGE
```

但绝不因为有流量自动进入 downloadable asset pool。

---

# 9. Phase B：149 → 300 → 450–500 Candidate Expansion

## 9.1 不重跑“从零选 500”

现有 149 是已验证资产。

新流程：

```text
Existing Approved 149
        +
SEO-backed new candidates
        +
high-quality legal open fonts
        ↓
Expansion Candidate Pool
```

## 9.2 新候选目标

建议建立：

```text
600–900 new candidates
```

和现有 149 合并后，总 Candidate Pool 约：

```text
750–1050
```

通过 License / source / quality 后最终：

```text
300 publishable checkpoint
450–500 V1 complete
```

## 9.3 Source 类型

新增 candidate source schema：

```text
GOOGLE_FONTS
OFFICIAL_GITHUB
OFFICIAL_WEBSITE
MANUAL_REVIEW
```

禁止：

```text
COMPETITOR_DOWNLOAD
UNKNOWN_MIRROR
```

直接成为最终资产源。

竞品只用于发现需求。

---

# 10. 不要直接改写现有 curate_small_beautiful.py 的历史语义

当前脚本：

```text
250 library
150 launch
固定 category quotas
Google Fonts source
```

它已经形成可复现的 v1 baseline。

V1.2 推荐：

**保留原脚本作为历史基线。**

新增：

```text
scripts/font-ingest/build_expansion_candidates.py
scripts/font-ingest/rank_expansion.py
```

输入：

```text
existing approved catalog
+ SEO evidence
+ official source candidate manifests
```

输出：

```text
data/font-catalog/fonts-expansion-candidates.csv
```

这样不会破坏当前 149 的可复现性。

---

# 11. Release Priority 与 Curation Rank 分离

当前 public 默认排序继续使用：

```text
curationRank
```

不因为 Semrush 数据每天变化导致首页/目录不断重排。

新增内部字段：

```text
release_priority_score
```

用于决定“先处理哪个新字体”。

建议：

```text
release_priority_score
= 60% seo_opportunity_score
+ 40% curation_score
```

前提：

```text
License Gate = APPROVED
```

License 不作为软分数参与排序，而是硬门禁。

---

# 12. Phase C：泛化现有 Source / License Pipeline

当前 Google Fonts Pipeline 已经成熟。

不要重写。

需要增加 source adapter。

## 12.1 Google Fonts Adapter

继续使用现有：

```text
google_fonts_preflight.py
download_curated.py
analyze_and_license_gate.py
package_approved.py
```

## 12.2 Official GitHub Adapter

新增 manifest：

```text
data/sources/official-github-fonts.csv
```

字段：

```text
family
repo
ref
font_path
license_path
official_url
expected_license
notes
```

流程：

```text
Fetch pinned ref
→ verify license file
→ inspect original files
→ existing analyzer
→ existing package step
```

## 12.3 Manual Official Source

只有不能稳定自动化的少量高价值字体进入：

```text
MANUAL_REVIEW
```

每条必须有：

```text
source_url
license_url
retrieved_at
source_hash
review_note
```

V1 不为自动化而自动化。

---

# 13. 先做 30–50 个 Expansion Pilot

在一次性处理 300 个新字体前：

```text
选 30–50 个高 SEO 新候选
```

必须完整跑通：

```text
Semrush evidence
→ Candidate normalization
→ SEO score
→ official source
→ License Gate
→ download
→ analyze
→ package
→ local manifest
→ R2 upload
→ remote readback
→ editorial content
→ page eligible
```

### Pilot 验收

```text
>= 95% pipeline 自动完成
0 unauthorized asset
0 route collision
0 wrong canonical
0 unverified R2 link
0 fabricated editorial claim
```

通过后再批量扩容。

---

# 14. Metadata V1.2

当前 analyzer 已经产生很多字段，但 frontend catalog 没有全部利用。

V1.2 优先补：

```text
designers
manufacturers / foundry
formats
weights
italic availability
variable axes detail
exact source URL
exact license URL / license asset
SEO score
aliases
taxonomy tags
```

不要把所有东西塞回 `FontApprovalFacts`。

建议数据分层：

```text
Approval Facts
= 授权与原文件事实

SEO Evidence
= 搜索需求

Taxonomy
= 页面分类标签

Editorial Content
= locale copy

Asset Release
= 发布后的真实下载对象
```

页面 assemble 时组合。

---

# 15. Taxonomy V1.2

## 15.1 Approval Category 保持不变

```text
Sans Serif
Serif
Display
Handwriting
Monospace
```

## 15.2 新建 SEO Taxonomy

建议：

```text
data/taxonomy/font-taxonomy.csv
```

字段：

```text
slug
style_tags
visual_tags
use_case_tags
language_tags
license_tags
aliases
evidence
review_status
```

### Style Tags

第一批不需要一次性全做：

```text
cursive
old-english
pixel
retro
vintage
blackletter
script
calligraphy
slab-serif
rounded
condensed
```

### Use Case Tags

只做有 SERP / Semrush 证据的：

```text
tattoo
wedding
gaming
logo
poster
coding
editorial
social-media
```

### 原则

```text
Taxonomy 可以扩张
URL family 不变
```

---

# 16. SEO Hub Registry V2

当前 Hub definition 全部硬编码在 `font-routes.ts`。

10 个规模可以接受；30–50 个以后不适合继续硬编码大量 copy。

建议拆：

```text
data/seo/font-hubs.json
        ↓
font-hub-registry.ts
```

每个 Hub：

```json
{
  "id": "tattoo",
  "type": "use-case",
  "primaryKeyword": "tattoo fonts",
  "indexStatus": "READY",
  "minFontCount": 12,
  "fontSlugs": [],
  "localized": {
    "en": {},
    "zh-CN": {},
    "zh-TW": {}
  }
}
```

### 现有 10 个 Hub

先迁移到 registry，但 URL 不改。

### 新 Hub

只能来自：

```text
page-opportunities.csv
```

不得从 UI filter 自动生成。

---

# 17. Phase D：Production Asset Release

## 17.1 R2 对象键

继续使用当前 versioned immutable key 思路：

```text
fonts/{slug}/{releaseVersion}/...
```

不要覆盖老版本。

## 17.2 Cache

版本化对象：

```text
Cache-Control: public, max-age=31536000, immutable
```

HTML 页面不使用 immutable。

## 17.3 Verified Registry

只有远端读回成功后进入：

```text
fontAssetReleases
```

推荐字段：

```text
slug
releaseVersion
sourceCommit
package
license
preview
previewStatus
status=VERIFIED
verifiedAt
```

继续复用当前 schema。

---

# 18. Phase E：三语内容发布策略

## 18.1 Locale 路径继续冻结

```text
EN     → no prefix
zh-CN  → /zh
zh-TW  → /zh-tw
```

不切换到：

```text
/en
/zh-cn
```

因为当前全站已经实现该 locale contract。

## 18.2 Baseline Content 模板

每个语言版本至少提供：

```text
Title
Meta Description
H1
1 段 factual intro
License summary
Source
Style / Weight facts
Coverage facts
Preview text
```

### EN

围绕：

```text
{font} font
{font} download
```

### zh-CN

围绕：

```text
{font} 字体
{font} 字体下载
```

### zh-TW

围绕：

```text
{font} 字體
{font} 字體下載
```

不能机械把简体页直接转繁体后就认为内容完成。

核心 factual facts 可以共享，但：

```text
Title
Description
CTA
license wording
use-case wording
```

必须 locale-aware。

---

# 19. Phase F：下载链路

## EN

```text
Primary → VERIFIED R2
Fallback → Exact Official Source
```

## zh-TW

```text
Primary → VERIFIED R2
Fallback → Exact Official Source
```

## zh-CN

```text
Primary   → Quark（有 verified override 时）
Secondary → Baidu（有 verified override 时）
Fallback  → VERIFIED R2
Final     → Exact Official Source
```

不存在真实网盘 URL 时，不显示假按钮。

### 网盘数据建议

```text
data/font-downloads.json
```

字段：

```text
slug
provider
url
verifiedAt
ctaMode
sponsored
status
```

不要继续手工维护大体量 TypeScript object。

---

# 20. Download Analytics

V1 可加入极轻量事件：

```text
font_download_click
```

参数：

```text
font_slug
locale
provider
page_type
```

目的：

以后判断：

```text
夸克 CTA 转化
百度 CTA 转化
R2 fallback 使用率
不同字体下载率
```

不要做登录、用户画像或复杂漏斗。

---

# 21. Frontend 页面优先级

现有前端不推翻。

下一步按 SEO 收益排序增强：

## P0

```text
Font detail
SEO Hub
Font directory
```

## P1

```text
Related fonts
Related hubs
License/source trust block
Download event
```

## P2

```text
更复杂 preview controls
收藏
推荐算法
```

V1 不做 P2。

---

# 22. Font Detail Page V1.2

保持当前已有结构，增强字段即可。

最终应有：

1. H1 / font name
2. Factual intro
3. Live preview 或合法降级 preview
4. Styles / weights
5. Variable axes
6. License
7. Commercial-use guidance
8. Exact Official Source
9. Character coverage
10. Designer / Foundry（有数据时）
11. Verified Download CTA
12. Related Hub
13. Related Fonts（P1）
14. Updated / verified timestamp

不要强制每页写长文章。

字体页的 Helpful Value 主要来自：

```text
真实字体预览
+ 可验证 License
+ 来源
+ 字重 / axes
+ 字符覆盖
+ 下载
```

---

# 23. Related Fonts

V1.2 不做复杂 embedding / ML recommendation。

规则推荐即可：

```text
同 category
+ taxonomy overlap
+ language overlap
+ popularity / curation rank
```

每页展示：

```text
4–8 related fonts
```

用于：

- 用户发现；
- 内链；
- 降低 orphan 风险。

---

# 24. Sitemap V1.2

当前 sitemap builder 可以继续使用，但 P0 URL 收口后必须验证：

```text
字体详情只出现 /font/{slug}
Hub 只出现 /fonts/{hub}
参数页 0 个进入 sitemap
未 publishable font 0 个进入 sitemap
未 READY Hub 0 个进入 sitemap
```

当 URL 数超过当前规模后可拆 sitemap index，但 V1 500 字体 × 3 locale 仍远低于 50K URL 限制，不是硬需求。

因此：

> 不为了“看起来专业”提前拆一堆 sitemap。

---

# 25. Structured Data

继续保持低风险：

```text
WebSite
WebPage
BreadcrumbList
ItemList（collection page）
```

不为了 rich result 乱使用：

```text
Product
SoftwareApplication
```

字体下载不应伪装成不存在的商品 / SaaS。

FAQ schema 不作为依赖。

---

# 26. CI / QA Gate

## 26.1 TypeScript

继续：

```text
Biome
Vitest
Typecheck
Build
E2E
Playwright
```

## 26.2 Python

必须加入 CI：

```text
test_analyze_and_license_gate.py
test_curate_small_beautiful.py
test_download_curated.py
test_export_site_catalog.py
test_google_fonts_preflight.py
test_package_approved.py
```

后续增加：

```text
test_import_semrush.py
test_rank_expansion.py
test_publish_r2_release.py
test_build_font_content.py
```

## 26.3 SEO Contract Tests

新增：

```text
no duplicate dynamic route shape
font canonical == /font/{slug}
hub canonical == /fonts/{hub}
hreflang reciprocal
noindex filters excluded from sitemap
unverified asset never creates R2 CTA
page eligibility independent from optional preview
```

---

# 27. Launch Gate 重设

因为前端已经存在，`APPROVED >= 300 才开始网站开发` 已失效。

改成三个 Gate。

## Gate 1 — Expansion Pilot

```text
30–50 new fonts full pipeline passed
R2 remote readback implemented
URL conflict fixed
Python CI enabled
```

## Gate 2 — Public Launch

推荐：

```text
>= 300 APPROVED families
>= 300 VERIFIED package releases
>= 300 EN READY pages
>= 300 zh-CN READY pages
>= 300 zh-TW READY pages
100% canonical/hreflang QA
0 known unauthorized assets
0 broken primary download
```

### 为什么不再强制等到 500 才上线

SEO-first 下：

```text
300 个真正可发布页面
```

已经足够让 Google 开始抓取与反馈。

继续等 200 个字体只会延迟真实 GSC 数据。

## Gate 3 — V1 Complete

```text
450–500 APPROVED
450–500 VERIFIED releases
核心 SEO Hub 已上线
Top SEO fonts 完成 editorial enrichment
Quark/Baidu coverage 达到运营目标
```

---

# 28. 上线后的数据优先级

上线后：

```text
GSC first-party data
>
Semrush competitor estimate
>
Google Fonts popularity
>
主观判断
```

固定循环：

```text
GSC Query / Page
→ 找到已获曝光页面
→ Improve Title / Copy / Links
→ Semrush 找新机会
→ Add Hub / Add Font
→ 再观察
```

URL 只在结构性错误时改。

---

# 29. Codex 执行包

不要一次让 Codex“按整份文档做完”。

分包执行。

---

## Work Package 0 — P0 Architecture Cleanup

### 目标

在继续增加字体前，把当前发布路径收口。

### 修改

```text
src/routes/fonts.$slug.tsx
src/lib/font-publishing-registry.ts
src/lib/font-publishing.ts
src/lib/font-routes.ts
src/lib/font-seo.ts
src/i18n/routes.ts
src/routeTree.gen.ts
相关 tests
```

### 输出

```text
只保留 /font/$slug entity route
只保留 /fonts/$hub collection route
preview 不再阻塞合法 font page publication
```

### Gate

```text
pnpm verify
Python tests
git diff --check
```

---

## Work Package 1 — Semrush Evidence Import

### 新增

```text
scripts/seo/import_semrush.py
data/seo/*
tests/test_import_semrush.py
```

### 不做

- 不下载字体；
- 不改 UI；
- 不创建 100 个 Hub。

### 输出

```text
Existing 149 SEO score
Page opportunity pool
Candidate keyword pool
```

---

## Work Package 2 — Expansion Candidate Pool

### 新增

```text
scripts/font-ingest/build_expansion_candidates.py
scripts/font-ingest/rank_expansion.py
```

### 输出

```text
600–900 new candidates
Top 30–50 pilot selection
```

### 不做

不碰已有 149 的 approval facts。

---

## Work Package 3 — 30–50 Font Pilot

### 目标

完整跑通新增 source / gate / package。

### 输出

```text
APPROVED pilot CSV
local release manifest
R2 verified release
content READY
publishable detail pages
```

---

## Work Package 4 — Production R2 Publisher

### 新增

```text
scripts/font-ingest/publish_r2_release.py
```

### Gate

```text
remoteReadback = true
all hash match
all content type match
fontAssetReleases generated
```

---

## Work Package 5 — Editorial Content Generator

### 新增

```text
scripts/font-content/build_font_content.py
data/editorial/*
src/data/font-editorial-content.json
```

### 目标

三语 factual baseline 可规模化生成。

---

## Work Package 6 — SEO Hub V2

在 Semrush `page-opportunities.csv` 出来后再做。

### 目标

优先新增 5–10 个被数据验证的 Hub，而不是一次做 50 个。

例如可能是：

```text
cursive
old-english
tattoo
retro
wedding
```

最终以真实 CSV 为准。

---

## Work Package 7 — Batch Expansion 300

Pilot 通过后扩到：

```text
300 APPROVED + VERIFIED + READY
```

准备 Public Launch。

---

## Work Package 8 — 300 → 500

上线后与 GSC 同时进行。

不要等待 500 才开始获取搜索反馈。

---

# 30. 文件级变更地图

## 保留

```text
scripts/font-ingest/analyze_and_license_gate.py
scripts/font-ingest/download_curated.py
scripts/font-ingest/package_approved.py
scripts/font-ingest/export_site_catalog.py
src/components/font-home.tsx
src/components/font-catalog-page.tsx
src/components/font-detail-page.tsx
src/components/font-hub-page.tsx
src/lib/font-catalog.ts
```

## 修改

```text
src/lib/font-publishing.ts
src/lib/font-routes.ts
src/lib/font-seo.ts
src/lib/font-assets.ts
src/modules/font-editorial-content.ts
src/modules/font-asset-releases.ts
src/i18n/routes.ts
package.json
.github/workflows/verify.yml
```

## 删除 / 收口

```text
src/routes/fonts.$slug.tsx
```

`src/lib/font-publishing-registry.ts`：

```text
若只服务 plural detail route → 删除
若仍有必要 → 改为调用现有 fontPath / font-publication contract
```

## 新增

```text
scripts/seo/import_semrush.py
scripts/font-ingest/build_expansion_candidates.py
scripts/font-ingest/rank_expansion.py
scripts/font-ingest/publish_r2_release.py
scripts/font-content/build_font_content.py

data/seo/
data/taxonomy/
data/editorial/
data/sources/
```

原始 Semrush：

```text
research/semrush/
```

继续 ignore。

---

# 31. V1.2 不做

继续禁止范围膨胀：

```text
用户登录
收藏同步
会员系统
Stripe
订阅
AI 字体识别
AI 字体生成
在线字体设计器
WebFont CDN 产品
用户上传
评论社区
复杂 recommendation ML
字体云同步
```

即使代码底座支持 SaaS，也不在 FontOdyssey V1 做。

---

# 32. SEO-first 验收标准

V1.2 不是用“功能数量”验收。

核心：

### 资源

```text
真实官方来源
License 可追溯
文件可解析
下载可验证
```

### 页面

```text
搜索意图明确
核心内容 SSR/HTML 可见
非薄页
正确 canonical
正确 hreflang
可抓取
```

### 架构

```text
稳定 URL
无重复动态 route
无筛选索引爆炸
无未验证资源猜 URL
```

### 数据

```text
SEO score 有证据
Semrush market/device/date 可追溯
GSC 上线后优先于第三方估算
```

---

# 33. 下一步实际操作顺序

严格按下面执行：

```text
1. 修复 /font vs /fonts detail 双轨
2. 解耦 page eligibility 与 preview eligibility
3. 把 Python tests 接进 CI
4. 导出 FontMirror / FontGet / FontBolt 6 个 Semrush CSV
5. 写 import_semrush.py
6. 给现有 149 补 seo_opportunity_score
7. 生成 page-opportunities.csv
8. 建 600–900 expansion candidates
9. 选 30–50 Pilot
10. 泛化 source adapter
11. Pilot License / Analyze / Package
12. 实现 R2 upload + remote readback
13. 实现 scalable 3-locale factual content
14. Pilot pages 全链路 publish
15. 扩到 300
16. Public Launch
17. GSC 校准
18. 扩到 450–500
19. 根据 GSC + Semrush 增加高价值 Hub
```

---

# 34. 下一审查节点

不要等 500 个字体以后再审。

下一次复审放在：

```text
Work Package 0 完成
+
3 站 Semrush CSV 导入完成
+
现有 149 已计算 SEO score
```

届时重点审：

1. Top 149 的 SEO score 分布；
2. 新候选是否真的来自真实搜索需求；
3. Font detail / Hub URL 是否彻底收口；
4. 30–50 Pilot 选品是否合理；
5. 是否需要新增第一批 Use Case Hub。

---

# 35. 最终冻结原则

FontOdyssey 下一阶段不再是：

> “先造一套 500 字体的新系统。”

而是：

> **把已经完成的 149 字体安全发布底座，与真实 Semrush 搜索需求接起来，然后用同一套门禁扩到 300 / 500。**

最终技术链：

```text
Competitor SEO Evidence
        ↓
SEO Opportunity Score
        ↓
Candidate Selection
        ↓
Official Source
        ↓
License Gate
        ↓
Font Analysis
        ↓
Deterministic Package
        ↓
R2 Remote Verification
        ↓
Locale Factual Content
        ↓
Stable Font / Hub URLs
        ↓
GSC Feedback
```

其中任何一层都不得绕过上一层的证据门禁。

---

**文档状态**：V1.2 可作为当前仓库的下一阶段执行基线。
**第一执行任务**：`Work Package 0 — P0 Architecture Cleanup`。
**第一数据任务**：导入 FontMirror / FontGet / FontBolt 的 6 份 Semrush CSV。
