# v1.1 复核补充

普通 `pnpm build` 现在先执行无网络的 `pnpm check:previews`；字符索引缺失、过期或不合法会中止构建。`pnpm verify` 也包含新增 Node 门禁测试。首次安装后仍须按下文读取真实生产资源、生成索引，不能伪造初始化数据。字体加载重试只替换失败缓存；加载中和已成功的资源继续共享。

---

# FontOdyssey 第一轮 + 第二轮开发补丁

基线：`ai-ashao/Font-Odyssey` 的 `main@66c86d0f1d33ae358a66bf9b61577d07dd04393d`。
交付日期：2026-09-11。

**这是实际源码增量包，不是静态原型，也不是整个仓库。尚未提交 GitHub 或部署 Cloudflare。**

## 已实现

- R2 CORS 配置加入正式来源 `https://fontodyssey.com`，保留原有 workers.dev 来源。
- 首页、卡片、详情页共享预览逻辑：进入视口后加载、同一资源去重、失败提示、12 秒超时、详情页手动重试。
- 预览与网页界面语言分离。英文字体不再默认填中文；首页简中/繁中样张分别使用已有的 Noto Serif SC / TC，英文使用 Inter。首批 12 张精选卡片及其 curationRank 顺序不变。
- 从真实 WOFF2 的 cmap 生成字符索引，绑定 URL、SHA-256、字节数。输入中的缺字单独标记为系统字体，明确区分“小型预览子集”和“完整下载字库”。
- RFN/无资源版本不再用系统字体冒充预览；没有匹配字符证据时先隐藏样张，而不是猜测。
- 首页压缩标题与留白，保留原有白底蓝色视觉；首页样张编辑折叠为轻量操作，不把工具栏铺满首屏。
- 目录补齐中英/简繁筛选文案、清除筛选、空结果恢复、全目录自定义预览文字。搜索保留空格、支持输入法组合输入，延迟同步 URL；沿用原筛选和排序函数。
- 详情页在标题附近提供下载锚点，预览之后就是实际下载区；显示 ZIP 和来自发布清单的真实体积，保留原文件、许可证及来源入口。
- 提供正式资源只读核验脚本、Python/Vitest 测试，以及追加到原 Playwright 文件中的 4 个应用回归场景。

## 保持不变

149 个字体、全部源资源和不可变发布 URL、APPROVED/RFN 门禁、curationRank、三语言路由、canonical/hreflang/sitemap、SEO 标题策略、网盘下载优先级、临时 noindex。

本包不新增 npm 或 Python 依赖，使用项目原有的 React、fontTools、测试和构建工具。

## 必须先知道的限制

1. GitHub 写入接口返回 403，本轮没有创建分支或修改远程仓库。
2. R2 账户配置没有被修改。更改仓库里的 JSON **不等于**更改线上桶的 CORS。
3. 当前执行环境不能获取生产字体文件或安装完整项目依赖，因此**没有运行完整 `pnpm verify`，没有完成真实 R2 全量读取/下载抽查，也没有完成正式站或完整 React 应用的视觉验收**。
4. `src/data/font-preview-coverage.json` 特意交付为空的初始化索引。**这不是已经核验的生产字形数据。必须先生成真实索引再部署。** 否则新界面会显示“预览字形范围待核验”而不显示样张。这是为了避免再次生成虚假的字体预览。

已经运行的测试及边界见 交付包中的 `verification/TEST-RESULTS.md`。不得将它解释为整个项目已通过验收。

## 应用方法

解压本包。以下命令的路径需要替换为你的本地路径。

```bash
# 先预检，不写入任何文件。
python3 "/解压路径/FontOdyssey-Rounds-1-2/apply.py" \
  --repo "/本地项目路径/Font-Odyssey"

# 预检通过后，应用源码。
python3 "/解压路径/FontOdyssey-Rounds-1-2/apply.py" \
  --repo "/本地项目路径/Font-Odyssey" --apply
```

安装器逐个校验被修改文件的 Git blob SHA，并核对核心只读数据与临时索引状态。所有检查完成之后才写文件；遇到新版本、文件冲突或异常锚点会停止，不提供强制覆盖模式。

旧文件备份和前后哈希写入仓库的 Git 目录 `fontodyssey-rounds-1-2/`，不会混进要提交的源码。重复执行不会清空已生成的字符索引。应用后已编辑的源码不会被二次覆盖。

## R2 配置与真实资源核验

在 Cloudflare 中找到绑定 `assets.fontodyssey.com` 的实际 R2 桶。不要猜桶名，也不要清空已有的其他允许来源。

```bash
cd "/本地项目路径/Font-Odyssey"
BUCKET="实际的R2桶名"

pnpm exec wrangler r2 bucket cors list "$BUCKET"

# 先把线上已有、仍有用途的来源合并到 config/r2-cors.json，再执行：
pnpm exec wrangler r2 bucket cors set "$BUCKET" --file config/r2-cors.json
```

本包 JSON 是 Wrangler 的 `rules/allowed` 结构。不要把它不加转换地粘贴进要求 `AllowedOrigins/AllowedMethods` 格式的 Dashboard 编辑器。

修改后，按 Cloudflare 的缓存配置清理资源域名相关的旧 WOFF2 缓存。字体跨域测试必须携带正式页面的 `Origin`；直接在地址栏打开资源，不足以验证字体跨域加载。

接下来运行：

```bash
# 沿用项目已有 Python 环境；首次还没有时先创建：
python3 -m venv .venv
.venv/bin/pip install -r requirements-font-ingest.txt

# 这一条命令包含：真实资源核验 → 生成字形索引 → 格式化本次文件 → 完整 pnpm verify。
bash scripts/verify-font-usability.sh
```

已经存在可用的 `.venv` 时，不必重复创建。脚本只读取远端资源、修改本地生成数据并运行测试，不上传字体、不操作 Cloudflare 配置、不部署、不打开收录。

`verify-font-usability.sh` 会对所有**已有预览资源**的发布版本核验字节数、SHA-256、Content-Type 和正式 Origin 的 CORS 响应，并从这些字节提取实际 cmap。同时抽查 Inter、Fira Sans、Noto Serif SC、Noto Serif TC、Raleway 的下载包与许可证，检查 ZIP 内容、CRC、许可证和来源文件。

只有这一步全部成功后，才会原子写入新的字形索引。失败报告写到已忽略的 `reports/font-preview-audit.json`，不会覆盖已有的正确索引。不要为了通过检查而修改发布清单中的哈希。

## 最后再部署

检查 `git diff`，确认没有意外内容，尤其是 `indexingEnabled` 仍为 `false`。正式站保持临时发布，**不提交 GSC、不打开收录**。

全量验证通过后再走项目原来的部署流程。部署后在正式域名复查首页、目录、简中 Inter、繁中 Noto Serif TC，以及 Raleway 的无预览状态。不要把本地使用测试字体拦截的 Playwright 用例当作生产 R2 校验。

## 给 Codex 的执行要求

读取本文件与 交付包中的 `verification/TEST-RESULTS.md`，先运行安装器预检和应用。然后检查 R2 正式来源配置，执行 `bash scripts/verify-font-usability.sh`，修正实际出现的类型、lint 或应用集成问题，再复核线上表现。若原文件与基线不一致，逐项合并，不绕过哈希保护。不要扩大字体库，不改 SEO 关键词或 noindex，不重做整套 UI，不把待核验索引伪造为已完成。
