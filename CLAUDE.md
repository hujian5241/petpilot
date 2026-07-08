# PetPilot — Claude Code 项目笔记

本文件记录项目特定的知识、反复踩过的坑以及标准操作流程，避免以后每次都要重新摸索。

## 项目概览

- **技术栈**：Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 + next-intl v4 + Turbopack
- **部署平台**：Vercel，生产域名 `https://petpilot.top`
- **工作目录**：`/Users/hj/trae_project/web/PetPilot`
- **主要语言**：`en`（`defaultLocale`），另有 `de`、`fr`、`ja`
- **语言路由**：`localePrefix: "always"`（见 `i18n/routing.ts`）

## 会话与输出约定

- **所有对用户的回复、解释和总结均使用中文。** 代码本身（变量名、类型名、文件路径、提交信息等）保持项目原有英文约定；代码注释和文档字符串可视上下文使用中文。

## 关键架构规则

### 1. 不要给 `next-intl` 的 `<Link>` 传带 locale 前缀的路径

`@/i18n/routing` 里的 `Link` 会自动给 `href` 加上当前 locale。如果手动传 `/${locale}/path`，就会生成 `/en/en/news` 这种双 locale URL → 404。

**正确写法**：

```tsx
import { Link } from "@/i18n/routing";
<Link href="/news">News</Link>
```

**错误写法**：

```tsx
<Link href={`/${locale}/news`}>News</Link>
```

涉及文件：
- `components/news/MonthFilter.tsx`
- `components/news/SourceFilter.tsx`
- `components/news/FilterGroup.tsx`
- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`
- `components/layout/Breadcrumb.tsx`

### 2. 客户端导航必须用 `@/i18n/routing` 的 `useRouter`

`next/navigation` 的 `useRouter` 不会自动加 locale 前缀。

**正确写法**：

```tsx
import { useRouter } from "@/i18n/routing";
```

### 3. RSC prefetch 报 `DYNAMIC_SERVER_USAGE` 错误

Next.js 15/16 对静态生成的嵌套路由发起 RSC prefetch（`?_rsc=...`）时，会回退到一次动态渲染。如果嵌套 `[slug]` 页面没有显式声明，里面的 `await params` 可能触发 `DYNAMIC_SERVER_USAGE` 并返回 500。

**修复方法**：在每个使用 `generateStaticParams` 的 SSG 详情页/列表页加上：

```tsx
export const dynamic = "force-static";
```

典型模式：

```tsx
export const dynamic = "force-static";

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const slugs = await getXSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}
```

已应用的页面：
- `app/[locale]/foods/[slug]/page.tsx`
- `app/[locale]/plants/[slug]/page.tsx`
- `app/[locale]/medications/[slug]/page.tsx`
- `app/[locale]/household-chemicals/[slug]/page.tsx`
- `app/[locale]/pesticides/[slug]/page.tsx`
- `app/[locale]/categories/[slug]/page.tsx`
- `app/[locale]/news/[slug]/page.tsx`

## 环境变量

| 名称 | 用途 | 设置位置 |
|------|------|----------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID | Vercel 环境变量（生产环境） |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console 验证令牌 | `layout.tsx` 里有硬编码 fallback |
| `INDEXNOW_KEY` | Bing IndexNow API 密钥 | Vercel 环境变量 |

当前 GA4 ID：`G-L4S625Y2DJ`。如果要换，用 `vercel env add NEXT_PUBLIC_GA_ID` 更新后重新部署。

## 本地复现 / 验证方法

### RSC prefetch 测试

```bash
npm run build
npm run start
# 另开一个终端（如果系统没有 curl，可用 scripts/rsc-smoke.mjs）
for path in /en/foods/grapes /en/plants/pothos /en/medications/ibuprofen /en/household-chemicals/bleach /en/pesticides/permethrin /en/categories/fruits /en/news /en/about /en/emergency /en/guides; do
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${path}?_rsc=ry-B8umWgNEV4JR9"
  echo " $path"
done
# 无 curl 时的替代方案
node scripts/rsc-smoke.mjs
```

预期结果：全部返回 `200`。

`scripts/rsc-smoke.mjs` 会测试同样的路径，环境里没有 `curl` 时可直接用 `node` 跑。

### 检查双 locale 链接

```bash
curl -s https://petpilot.top/en/news | grep -o 'href="[^"]*"' | grep '/en/en/' | head
```

预期结果：没有输出。

## next-intl 配置

- `next.config.ts` 通过 `createNextIntlPlugin("./i18n/request.ts")` 启用插件。
- 服务端翻译用 `getTranslations({ locale, namespace: "..." })`（一定要传 `locale`）。
- 客户端翻译在 `components/IntlProvider.tsx` 的 `NextIntlClientProvider` 包装里使用 `useTranslations()`。
- `app/[locale]/layout.tsx` 里静态导入所有语言文件；运行时不要依赖 `getMessages()`。

## Google Analytics 4 配置

- gtag 内联脚本放在 `app/[locale]/layout.tsx` 的 `<body>` 里（不是 `<head>`），避免 hydration 错误 #418。
- 页面加载时发送 `page_title` 和 `page_location`。
- GA4 数据通常有 10–30 分钟延迟；最快验证方式是用“实时”报告。

## Search Console / SEO

- 验证令牌通过 `app/[locale]/layout.tsx` 里的 `Metadata.verification` 设置：
  - Google Search Console：`verification.google`
  - Bing Webmaster Tools：`verification.other["msvalidate.01"]`
- 站点地图：
  - `/sitemap.xml`：核心页面 + 列表页 + 分类/物品详情页（**不含新闻详情页**）。
  - `/news-sitemap.xml`：仅新闻详情页，使用文章的真实 `updatedAt`（frontmatter 或文件 mtime）。
- `robots.txt` 已指向两个站点地图；RSS `/feed.xml` 已生成。
- **重要**：Next.js 的 `MetadataRoute.Sitemap` 约定只支持根目录下的 `app/sitemap.ts`。第二个/额外的站点地图必须写成 App Router Route Handler（`app/news-sitemap.xml/route.ts` 导出 `GET`），不能用 `app/news-sitemap.ts` 默认导出 `sitemap`。

## IndexNow / Bing

- 密钥文件：`public/<INDEXNOW_KEY>.txt`
- 提交脚本：`scripts/submit-indexnow.ts`（会同时读取 `/sitemap.xml` 和 `/news-sitemap.xml` 去重后提交）
- 发布新内容后运行：

```bash
npx tsx scripts/submit-indexnow.ts
```

- **前提**：Bing Webmaster Tools 必须先完成站点验证。如果返回 `SiteVerificationNotCompleted`，需要先在 Bing 后台添加并验证 `petpilot.top`。

## 常见坑（踩过才懂的）

1. **不要把 Next.js 降级到有漏洞的版本** —— Vercel 会拒绝部署。始终使用最新稳定版 `next` 和匹配的 `eslint-config-next`。
2. **JSON-LD / GA 的 `script` 标签不要放在 `<head>` 里**，放在 `<body>` 里，避免 hydration 错误 #418。
3. **嵌套动态页面里不要同步使用 `params`** —— 必须 `await params`，类型写成 `Promise<{ locale: Locale; slug: string }>`。
4. **任何 layout/page 改动后都要本地测试 `?_rsc=` prefetch URL**，这类错误只在生产构建中出现，`next dev` 不会报。
5. **恢复简化/最小化页面时**，记得重新加上 `export const dynamic = "force-static"` 再部署。
6. **FAQPage / ItemList / NewsArticle 等 JSON-LD 通过内联 `<script type="application/ld+json">` 渲染**，放在 `<body>` 里（和 GA 一样，避免 hydration 错误）。
7. **额外的站点地图不能走 `app/<name>-sitemap.ts` 的默认导出模式** —— 这不会被 Next.js 识别为路由。要写成 Route Handler（`app/<name>.xml/route.ts` 导出 `GET`）。
8. **Bing IndexNow 返回 403 `SiteVerificationNotCompleted` 是正常的**，说明 Bing Webmaster Tools 还没验证站点；必须先验证再提交。
9. **`npm run start` 前务必确认 3000 端口没有旧进程**。如果之前启动的 `next start` 没退出，浏览器或 curl 会访问到旧构建，表现为新页面 404。可用 `lsof -ti:3000 | xargs kill -9` 清理后再启动。
10. **需要在服务端用 `searchParams` 做筛选的列表页不要设为 `force-static`**。静态页面在构建时 `searchParams` 为空，且运行时不会按查询参数重新渲染，导致筛选器点击后页面内容不变。`/news` 和 `/search` 因此使用 `export const dynamic = "force-dynamic"`（详情页仍保持 `force-static`）。
11. **不要同时存在 `app/layout.tsx` 和 `app/[locale]/layout.tsx` 都渲染 `<html><body>`**。这会导致嵌套 body 和 hydration mismatch；如果所有页面都在 `[locale]` 下，直接删除 `app/layout.tsx`，让 `[locale]/layout.tsx` 作为实际根 layout。
12. **客户端组件用 `usePathname()` 计算 active 状态要防 hydration mismatch**。SSR 阶段 `pathname` 可能与客户端首屏不同，导致 `aria-current` / `className` 不匹配。可用 `mounted` 状态（`useEffect` 后置为 true）保护 active 计算，或把当前路径作为服务端 prop 传入。
13. **日期/时间格式化用 `suppressHydrationWarning` 处理 SSR/客户端差异**。Node.js 与浏览器 ICU 数据、时区、本地化格式可能不同；给 `<time>` 或日期文本加 `suppressHydrationWarning` 是 React 官方允许的安全做法。
14. **移除 `next-intl` 的 `now={new Date()}` prop 除非确实需要相对时间**。每次渲染值都不同，容易引发 hydration 差异。
15. **聚合簇标题由 LLM 在 `scripts/generate-news-clusters.ts` 中生成**。prompt 现在会要求 `clusterTitle`，卡片列表页直接读取 `cluster.title`。如果标题仍显冗长，重新运行 `npx tsx scripts/generate-news-clusters.ts` 即可更新。
16. **清理死代码前先用 grep 确认无引用**。本次已删除：`components/analytics/GoogleAnalytics.tsx`（GA 已内联到 `app/[locale]/layout.tsx`）、`lib/news-linkify.ts`（项目里无引用）。不要留着“以后可能用”的文件，除非确实在 backlog 里排期。
17. **不要把同一个工具函数复制到多个页面**。之前 `buildAlternates` 在 10+ 个页面里各自实现了一遍；现已集中到 `lib/metadata.ts` 统一导出，页面直接 `import { buildAlternates } from "@/lib/metadata";`，避免逻辑分叉。
18. **不要重复定义 props 接口**。`app/[locale]/search/page.tsx` 之前声明了两个完全相同的 `SearchPageProps`，只保留一个即可。
19. **`middleware.ts` 文件约定已被 Next.js 16.2.10 标为 deprecated**，构建时会提示改用 `proxy`。当前项目仍使用 `next-intl/middleware` 的 `middleware.ts`，功能正常，但未来升级时应迁移到新的 proxy 约定。

## 部署标准流程

```bash
npm run build
# 本地验证
npm run start
# RSC prefetch smoke test（任何 layout/page 改动后必须跑）
for path in /en /en/foods /en/plants /en/medications /en/household-chemicals /en/pesticides /en/categories/fruits /en/news /en/about /en/emergency /en/guides; do
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${path}?_rsc=ry-B8umWgNEV4JR9"
  echo " $path"
done
# 无 curl 时
node scripts/rsc-smoke.mjs
# 部署
vercel --prod --yes
```

GA、站点地图、验证令牌这类值是在构建时写入的，修改后必须重新部署。

## 静态生成策略

优先把页面设为 `force-static`，能大幅提升客户端导航速度。当前静态页面：

- `/[locale]` 首页
- `/[locale]/foods`、`/plants`、`/medications`、`/household-chemicals`、`/pesticides`
- `/[locale]/foods/[slug]`、`/plants/[slug]`、`/medications/[slug]`、`/household-chemicals/[slug]`、`/pesticides/[slug]`
- `/[locale]/categories/[slug]`
- `/[locale]/guides`、`/guides/[slug]`
- `/[locale]/about`、`/privacy`、`/terms`
- `/[locale]/emergency`、`/emergency/wizard`
- `/news-sitemap.xml`、`/sitemap.xml`、`/robots.txt`

保持 dynamic 的页面：

- `/[locale]/news`：使用 `force-dynamic`，因为依赖 `searchParams` 做服务端筛选。
- `/[locale]/search`：使用 `force-dynamic`，因为依赖 `searchParams` 的 `q`。
- `/feed.xml`、 `/api/cron/news`：Route Handler，天然 dynamic。

### 决策原则

1. **不依赖 `searchParams`/`cookies`/`headers` 的页面** → 用 `force-static`。
2. **详情页带 `[slug]` 且用 `generateStaticParams`** → 必须同时加 `force-static`，否则 RSC prefetch 可能触发 `DYNAMIC_SERVER_USAGE` 500。
3. **服务端筛选页** → 明确用 `force-dynamic`，不能用 static。
4. **页面加载后如果感觉切换慢**，先用 `npm run build` 看路由表，把不必要的 `ƒ (Dynamic)` 改成 `○ (Static)`。

## 性能基准（本地 `npm run start`）

静态页面 RSC prefetch 通常在 2–15ms；dynamic 页面如 `/news` 约 40ms，`/search` 约 250ms（因需构建搜索索引）。若线上静态页明显慢于该基准，优先检查是否误设为 dynamic 或是否有未缓存的数据库/文件读取。

## Recalls 聚合页

- ~~独立页面：`/recalls`，展示新闻 frontmatter 中 `type === "recall"` 的条目。~~ 已移除：该页面在 2026-07 被删除，召回信息统一在 `/news` 中通过聚类簇和筛选器展示。
- `NewsEntry` 仍保留可选字段 `type?: "recall" | "incident" | "alert"`，由 `scripts/fetch-news.ts` 根据标题/正文关键词自动推断。
- `NewsCluster` 同样新增 `type` 字段，取成员新闻中的最高优先级：`recall` > `alert` > `incident`。
- `/news` 页面右侧提供 Type 筛选（recall / alert / incident），与 severity、source、species、substance 并列。
- 新闻卡片（`NewsCard`、`NewsClusterCard`）和详情页标题下方均显示 type 标签。
- 旧新闻可以通过 `npx tsx scripts/backfill-news-type.ts` 批量回填 `type`；已有聚合簇可通过 `npx tsx scripts/backfill-cluster-type.ts` 补 type，无需重新跑 LLM。
- 原用于 `/recalls` 的 `MonthFilter.pathname` 能力保留，仍可用于其他需要复用月份筛选的非 `/news` 路由。
- 已同步从 `app/sitemap.ts` 和 `Header.tsx` 中移除 `/recalls` 入口。

## 首页 "Critical Pet Safety Alerts" 规则

首页顶部的 "Critical Pet Safety Alerts" 区域现在由以下两类数据合并后取前 5 条：

1. **原有逻辑**：近一年内 `severity === "critical"` 的新闻条目。
2. **新增逻辑**：最近 3 个月内、被聚合为召回事件簇（recall cluster）且媒体报道来源数超过 1 家的前 2 个簇，按 `cluster.sources.length` 降序排列。

实现细节：
- `lib/news-content.ts` 新增 `getTopRecallClustersByCoverage(clusters, { months, limit })`。
- `app/[locale]/page.tsx` 在 `getServerSide` 流程中并行读取 `loadClustersRaw(locale)` 和 `getAllNewsFrontmatterCached(locale)`。
- 召回簇会被映射成一条伪新闻项：slug 使用 `cluster.canonicalSlug`，标题/摘要/日期/严重程度/物种/物质均使用簇级合成字段（`cluster.title`、`cluster.summary`、`cluster.dateRange.end` 等）。
- 两类数据先合并，再按 slug 去重，最后按日期降序取前 5 条。
- 只有被聚类的新闻簇才会参与排序；单篇独立 recall 新闻不会通过该逻辑进入首页，仍按原有 critical severity 逻辑处理。

卡片样式规则（首页 alerts 区域）：
- 使用 `auto-rows-fr` + `h-full` 让所有卡片等高。
- 卡片内部从上到下固定为：第一行是「新闻类型标签 + 日期」，二者在同一行，type 标签在日期之前；第二块是标题。
- 标题固定占 2 行，使用 `line-clamp-2` + `min-h-[2.5rem]`，超出部分显示省略号。
- 日期用本地化的 `toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })` 渲染，并加 `suppressHydrationWarning`。
- type 标签复用 `components/news/NewsTypeBadge.tsx`，缺失 type 时回退为 `incident`。`NewsTypeBadge` 本身默认 `shrink-0`，避免被日期挤压缩小。

## 新闻内容流水线

```bash
# 抓取新文章
NEWS_PUBLISH=true npm run news:fetch
# 生成聚合簇 + 富化正文
npm run news:clusters
# 构建并部署
npm run build
vercel --prod --yes
```

- `scripts/generate-news-clusters.ts` 现在把聚合页的合成正文以 `bodyHtml` 形式写入 `clusters.json`，而成员文件保留原始摘要 + 来源链接。因此：
  - 聚合规范页（canonical slug）展示 `cluster.title`、`cluster.summary`、`cluster.bodyHtml` 和 `RelatedCoverageSection`。
  - 成员详情页展示原始 `entry.title`、`entry.summary`、结构化字段与 `Original Source` 外链，并在摘要下方显示一个指向 canonical 聚合摘要的 `ClusterSummaryCard`。
  - 单篇无簇文章按 canonical 方式渲染，直接展示自身完整内容，不显示来源区与聚合卡片。
- 聚类相似度计算针对 fallback 文章做了保护：
  - fallback 文章（summary 含 "Pet owners should be aware..."）在相似度计算中只使用标题，避免通用摘要产生虚假高相似度。
  - 提取标题中的大写短语时，同时把短语拆成单个单词加入候选。贪婪正则会把 "Some Pedigree" 整体匹配，导致单次的 "pedigree" 被吞掉；补充单字候选后，品牌/产品名才能成为有效的频繁项加成。
  - `NON_BRAND_TERMS` 需要持续维护，把媒体/来源词（`processing`、`journal`、`today` 等）和通用产品词（`product`、`popular`）过滤掉，防止同一来源的多篇文章被错误地聚成簇。
- `canonicalSlug` 由聚合标题通过 `slugify()` + `uniqueSlug()` 生成，作为该事件簇的规范 URL。站点地图（`/news-sitemap.xml`）对已被聚合的条目统一输出 `canonicalSlug`；未被聚合的单独新闻仍使用原始 `slug`。
- 聚合规范 slug 没有对应的 Markdown 文件，因此 `app/[locale]/news/[slug]/page.tsx` 做了两层解析：
  1. `generateStaticParams` 同时输出所有成员 slug 和所有 `canonicalSlug`。
  2. `generateMetadata` 与页面组件在 `getNewsBySlug(slug)` 为空时，通过 `clusters.find((c) => c.canonicalSlug === slug)` 找到簇，并用 `sources[0].slug` 加载成员内容来渲染。
- 聚合页的 metadata / OG / Twitter / JSON-LD 使用簇级合成字段（`cluster.title`、`cluster.summary`、`cluster.species`、`cluster.severity`、`cluster.dateRange.end`），而不是成员原始字段；`canonicalUrl` 始终指向 `/${locale}/news/${canonicalSlug}`。
- 新闻详情页的标题通过 `buildTitle()` 生成，**不**带站点后缀，由父级 layout 的 `title.template: "%s | ${config.name}"` 统一追加 `| PetPilot`，避免重复后缀（如 `... | PetPilot News | PetPilot`）。
- 发布新闻后重跑 `npx tsx scripts/generate-news-clusters.ts`，否则新增文章不会进入聚合簇。
- **Google News RSS 文章链接需要解码才能拿到原始出版商 URL**。`scripts/fetch-news.ts` 已实现：
  1. Base64 解码文章 ID，剥离 protobuf 包装；旧格式直接得到原始 URL。
  2. 新格式（中间值以 `AU_yqL` 开头）需要访问 Google News wrapper 页面提取 `data-n-a-sg`（signature）和 `data-n-a-ts`（timestamp），再调用内部 `batchexecute?rpcids=Fbv4je` RPC 解析出原始 URL。
  3. 如果解析失败，文章会回退到 RSS 摘要生成，质量较差。
- **部分出版商会拦截 curl/机器人请求**（如 MassLive、PetfoodIndustry 的 Cloudflare 挑战、JS 渲染页面）。遇到这种情况，当前脚本无法自动抓取正文，需要：
  - 在 RSS 里寻找同一事件的其他可访问来源；
  - 或手动用 `scripts/fix-specific-news.ts` 这类定向脚本替换 sourceUrl 并重新提取。
- **旧 fallback 文章可以重新富化**。`scripts/re-enrich-news.ts` 会扫描所有 `data/news/en/` 下缺少结构化详情（Brand/Product/Reason 等）的文章，尝试解析原始 URL、抓取正文并调用 LLM 重新提取字段。
- 新抓取到的文章若质量仍差，优先检查 `sourceUrl` 是否成功解析为原始出版商 URL，以及该出版商是否允许 curl 访问。

## 急救工具

- `/emergency/wizard`：交互式多步急救评估向导，根据物种、体重、物质、摄入量、症状给出风险等级和致电 CTA。
- 详情页（Food/Medication）内嵌 `ToxicityCalculator`，基于 `toxicity_profiles` 计算近似毒性剂量。
- `toxicity_profiles` 数据结构：
  - `species: "dogs" | "cats"`
  - `toxic_dose_mg_per_kg?`、`lethal_dose_mg_per_kg?`
  - `toxic_dose_g_per_kg?`（用于整食物克重，如洋葱、葡萄）
  - `concentration_mg_per_g?`（用于巧克力、木糖醇等按浓度换算）
  - `tablet_mg?`（用于药物片剂）
  - `note?`
- 计算核心在 `lib/toxicity.ts`，结果等级：`safe` / `caution` / `toxic` / `critical` / `unknown`。
- 首批已补充毒性数据的内容：chocolate、xylitol、grapes、onions、garlic、ibuprofen、acetaminophen。
- `scripts/validate-content.ts` 会校验 `toxicity_profiles` 的格式。

## 通用项目约定

### 文件组织

- 服务端组件直接放在 `app/[locale]/...` 下。
- 客户端组件加 `"use client"`，放在 `components/` 下。
- 内容数据放在 `content/<locale>/`（Markdown + JSON）。
- 工具脚本放在 `scripts/`，用 `npx tsx scripts/<name>.ts` 运行。
- 生成的产物（站点地图、RSS、IndexNow 密钥文件）放在 `app/` 或 `public/`。

### TypeScript 约定

- 组件 props 和数据模型优先用 `interface`，而不是 `type`。
- `Locale` 总是从 `@/lib/i18n`（或 `@/lib/locales`）导入，不要自己重新定义。
- Next.js 15/16 的服务端组件里必须 `await params` 和 `await searchParams`。
- 使用 `@/` 路径别名；避免超过 `../` 的相对路径。

### 样式

- Tailwind CSS v4，使用自定义主题 token（`primary`、`muted`、`border` 等）。
- 组件变体通过 `class-variance-authority` + `tailwind-merge` 的 `cn()` 组合。
- 自定义文章样式使用 `prose-pet` 类。

### 内容 / 国际化

- UI 文案放在 `messages/<locale>.json`。新增 key 时要同步加到四个语言文件；英文是 source of truth，也是 fallback。
- 内容 slug 在所有语言中保持一致；本地化的显示名称放在 frontmatter / JSON 里。
> AI 批量生成的 Markdown 偶尔会出现 YAML 语法错误（如 `sources` 列表里遗漏 `-` 导致重复 key、单引号字符串内未转义撇号）。这些错误不会在平时开发暴露，只会在全量静态生成（`next build` 或访问 `/emergency/wizard` 等加载全部内容的页面）时由 `gray-matter` 抛错。`npm run build` 是发现这类问题的最可靠方式。
- Markdown 内容通过 `gray-matter` 解析，并经过 `rehype-sanitize` 消毒。

### 图片

- 使用 `next/image`，`next.config.ts` 里设置 `unoptimized: true`（适合 Vercel 免费档 / 静态导出）。
- 占位 SVG 放在 `public/images/<type>/<slug>.svg`。

### 表单与交互

- 不需要服务端往返的表单用客户端 state 处理。
- 所有导航必须通过 `@/i18n/routing`（`Link` 或 `useRouter`）。
- 读取 `useSearchParams` 的客户端组件外必须包 Suspense 边界。

### SEO / Metadata

- 每个页面导出 `generateMetadata`，包含本地化的 title/description。
- Open Graph、Twitter 卡片、语言替代链接（`hreflang` + `x-default`）统一在 `lib/metadata.ts` 中构建。
- JSON-LD 通过 `<script type="application/ld+json">` 内联渲染，放在 `<body>` 里。

### 性能

- 优先静态生成；动态页面要显式声明。
- SSG 详情页使用 `force-static`，保证 RSC prefetch 稳定。
- middleware 保持轻量，它会在每个请求上运行。

## 常用命令

```bash
# 查看 Vercel 环境变量
vercel env ls

# 拉取环境变量到本地（生成 .env.local）
vercel env pull

# 查看已部署域名 / DNS 别名
vercel domains ls

# 本地构建并启动生产服务器
npm run build && npm run start

# 只类型检查，不生成文件
npm run type-check

# 运行测试
npm run test
```

## Stripe Redesign 约定

全局 redesign 已于 2026-07-07 完成，设计系统见 `design.md`，关键变更：

- 颜色/阴影/圆角 token 全部迁移到 Stripe 风格（`--primary: #533afd`、navy ink、`shadow-card`、`rounded-xl` 等），单一定义在 `app/globals.css`。
- 新增共享原语：`components/ui/Button.tsx`（pill 按钮，支持 `asChild`）、`components/ui/Card.tsx`（cva 卡片变体）。新增 CTA/电话链接优先用 `Button`。
- 展示标题统一用 `font-light tracking-tight`，正文保持 `font-normal` 可读性。
- 首页使用 `components/home/HeroMesh.tsx` 静态 SVG gradient mesh 背景。
- 安全状态语义颜色保留，但色值已校准为 Stripe 调性（见 `globals.css` status colors）。
- 列表页、详情页、搜索/新闻交互、页级布局均已同步更新。

验证命令：

```bash
npm run type-check
npm run build
npm run start
# RSC prefetch smoke test
for path in /en/foods/grapes /en/plants/pothos /en/medications/ibuprofen /en/household-chemicals/bleach /en/pesticides/permethrin /en/categories/fruits /en/news /en/about /en/emergency /en/guides; do
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${path}?_rsc=ry-B8umWgNEV4JR9"
  echo " $path"
done
# 无 curl 时
node scripts/rsc-smoke.mjs
```

## 会话/维护规则

1. **每次项目完成后**：如果过程中学到了新的项目约定、踩到了新坑、或者修复了重复出现的问题，必须把对应内容更新到本 `CLAUDE.md` 文件里。
2. **每天工作结束后**：自动检查代码库，识别并删除重复代码（重复的组件、工具函数、类型定义、常量等），保持项目简洁。

## 备注

- `package.json` 中 `next` 固定为最新稳定版（上次更新为 `^16.2.10`）。
- `middleware.ts` 使用 `next-intl/middleware` 做语言重写；matcher 排除了 `api`、`_next`、`_vercel` 以及带扩展名的文件。
- Vercel 构建输出里会显示 `ƒ Middleware` 和 `ƒ Proxy (Middleware)`。
- 当前构建有两个非阻塞警告，可忽略：
  1. `The "middleware" file convention is deprecated. Please use "proxy" instead.` —— `next-intl` 的 `middleware.ts` 仍可正常工作，未来随 next-intl 升级再迁移。
  2. `Encountered unexpected file in NFT list`（trace 到 `lib/news-content.ts` → `app/feed.xml/route.ts`）—— 因为文件系统读取用了 `process.cwd()`。`newsDir()` 已加 `/*turbopackIgnore: true*/`，该警告不影响构建和运行。
