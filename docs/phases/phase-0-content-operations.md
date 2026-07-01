# Phase 0 — 内容运营与维护手册

**版本**：1.0  
**日期**：2026-07-01  
**适用范围**：Phase 0 上线后，以及进入 Phase 1/2/3 前的日常内容维护  
**前置文档**：[CONTENT_STANDARDS.md](../standards/CONTENT_STANDARDS.md)

---

## 1. 本文档目的

MVP 上线后，你需要持续：
- 修正现有条目的文字和数据
- 新增食物条目
- 为 Phase 3 植物扫描器预补充植物内容
- 补充真实图片
- 更新分类、急救信息、站点配置

本手册告诉你每种修改该改哪个文件、如何改、改完怎么验证、怎么重新部署。

---

## 2. 内容目录结构总览

```
content/
├── foods/                  # 食物条目（Markdown + YAML）
│   ├── grapes.md
│   ├── chocolate.md
│   └── ...
├── categories.json         # 分类定义
├── emergency.json          # 急救页面数据
└── site.json               # 站点全局配置

public/
└── images/                 # 图片资源
    ├── foods/              # 食物图片
    ├── plants/             # 植物图片（Phase 3 使用）
    └── og-default.jpg      # 默认 OG 图片

scripts/
├── generate-foods.ts       # 批量生成食物模板（可选）
├── patch-content.ts        # 批量修复内容字段（谨慎使用）
└── validate-content.ts     # 内容校验脚本

lib/
├── types.ts                # TypeScript 类型定义
├── content.ts              # 内容读取工具
├── metadata.ts             # SEO 元数据生成
└── jsonld.ts               # 结构化数据生成
```

---

## 3. 更新现有文字或数据

### 3.1 更新食物条目

编辑 `content/foods/{slug}.md`：

```markdown
---
name: "Grapes"
safety:
  dogs:
    summary: "Highly toxic. Can cause acute kidney failure."
---

# Grapes

这里是正文，用 Markdown 编写。
```

**可修改的字段**：
- `name`、`aliases`、`tags`
- `safety.dogs` / `safety.cats` 下的 `status`、`severity`、`summary`
- `preparation_notes`、`safe_amount`、`frequency`
- `symptoms`、`what_to_do`
- `alternatives`、`related_foods`
- `sources`
- `vet_reviewed`、`last_reviewed`

**改完必须**：
1. 更新 `last_reviewed` 为当天日期
2. 运行 `npm run content:validate`
3. 运行 `npm run build`

### 3.2 更新分类

编辑 `content/categories.json`：

```json
{
  "id": "fruits",
  "name": "Fruits",
  "slug": "fruits",
  "description": "...",
  "sort_order": 1
}
```

**注意**：
- 新增分类后，必须更新已有食物条目的 `categories` 字段
- `sort_order` 决定首页分类展示顺序
- 不要删除已有食物正在使用的分类 slug

### 3.3 更新急救信息

编辑 `content/emergency.json`：

```json
{
  "title": "Pet Emergency Guide",
  "hotlines": [...],
  "when_to_call": [...],
  "common_toxins": ["grapes", "chocolate", ...],
  "steps": [...]
}
```

**注意**：
- `common_toxins` 中的 slug 必须对应 `content/foods/` 下真实存在的文件
- 电话号码保持北美格式，便于 `tel:` 链接解析

### 3.4 更新站点全局配置

编辑 `content/site.json`：

```json
{
  "name": "PetPilot",
  "tagline": "...",
  "description": "...",
  "base_url": "https://petpilot.io",
  "contact_email": "hello@petpilot.io",
  "default_og_image": "/images/og-default.jpg"
}
```

**注意**：
- `base_url` 影响 sitemap、robots 和 OG 图片 URL
- 上线前务必将 `base_url` 改为真实域名

---

## 4. 添加新食物

### 4.1 推荐方式：从模板复制

1. 找一个类似食物，复制其 Markdown 文件
2. 重命名为新的 slug（例如 `kiwi.md`）
3. 修改所有字段

### 4.2 必填字段

```yaml
id: kiwi
name: Kiwi
slug: kiwi
aliases: ["kiwifruit", "kiwi fruit"]
categories: ["fruits"]
tags: ["safe-treat", "vitamin-c"]
safety:
  dogs:
    status: safe
    severity: low
    summary: "Safe without skin in small amounts."
  cats:
    status: safe
    severity: low
    summary: "Safe in tiny amounts, but most cats dislike it."
symptoms: ["upset stomach", "diarrhea (in large amounts)"]
what_to_do: "Monitor for stomach upset. Contact your vet if symptoms persist."
alternatives: ["blueberries", "apple-slices"]
sources:
  - name: "American Kennel Club"
    url: "https://www.akc.org/"
vet_reviewed: true
last_reviewed: "2026-07-01"
```

### 4.3 关键规则

- `slug` 使用小写，单词之间用连字符（kebab-case）
- `categories` 必须使用 `content/categories.json` 中已定义的 slug
- `alternatives` 必须指向 `content/foods/` 下已存在的 slug
- `status` 只能是 `safe`、`limited`、`toxic`、`unknown`
- `severity` 只能是 `low`、`moderate`、`high`、`critical`，或不填

### 4.4 验证

```bash
npm run content:validate
```

---

## 5. 添加新植物（为 Phase 3 准备）

### 5.1 当前阶段建议

Phase 0 专注食物，但你可以提前把植物数据以相同格式沉淀在 `content/plants/`，避免 Phase 3 时从头整理。

### 5.2 目录规划

```
content/
├── foods/           # 现有
└── plants/          # 新增
    ├── pothos.md
    ├── tulips.md
    └── ...
```

### 5.3 植物 Schema 示例

```yaml
id: pothos
name: Pothos
scientific_name: Epipremnum aureum
slug: pothos
aliases: ["devil's ivy", "golden pothos"]
categories: ["houseplants"]
tags: ["calcium-oxalate", "common-houseplant"]
safety:
  dogs:
    status: toxic
    severity: moderate
    summary: "Can cause oral irritation, vomiting, and difficulty swallowing."
  cats:
    status: toxic
    severity: moderate
    summary: "Can cause oral irritation, vomiting, and difficulty swallowing."
symptoms: ["drooling", "pawing at mouth", "vomiting", "decreased appetite"]
what_to_do: "Rinse mouth with water. Contact your vet or poison control if symptoms persist."
alternatives: ["spider-plant", "boston-fern"]
sources:
  - name: "ASPCA"
    url: "https://www.aspca.org/pet-care/animal-poison-control"
vet_reviewed: true
last_reviewed: "2026-07-01"
```

### 5.4 接入前端（Phase 3 再做）

当前只需沉淀数据。Phase 3 时：
1. 在 `lib/content.ts` 添加 `getPlantBySlug`、`getAllPlants` 函数
2. 在 `lib/types.ts` 添加 `PlantEntry` 类型
3. 创建 `app/plants/[slug]/page.tsx`
4. 更新分类、搜索索引、sitemap

---

## 6. 补充图片

### 6.1 图片目录

```
public/images/
├── foods/              # 食物图片
│   ├── grapes.jpg
│   ├── chocolate.jpg
│   └── ...
├── plants/             # 植物图片（Phase 3）
├── og-default.jpg      # 默认社交分享图
└── logo.png
```

### 6.2 命名规则

- 与对应条目的 `slug` 完全一致
- 使用 `.jpg` 或 `.webp` 格式
- 建议尺寸：
  - 卡片图：800×600 px
  - 详情页首图：1200×800 px
  - OG 图：1200×630 px

### 6.3 在条目中引用图片

```yaml
images:
  - src: "/images/foods/grapes.jpg"
    alt: "A bunch of fresh purple grapes"
    caption: "Grapes are highly toxic to dogs and cats."
```

### 6.4 注意事项

- 图片必须放在 `public/` 下，Next.js 会自动映射到根路径
- 优先使用自己拍摄或获得授权的图片
- 动物食物图片建议明亮、清晰、背景干净
- 有毒食物图片可以加警示角标或红色边框（由前端组件处理）

---

## 7. 改完后的标准检查流程

每次内容更新后，按顺序执行：

```bash
# 1. 校验内容
npm run content:validate

# 2. TypeScript 类型检查
npm run type-check

# 3. ESLint 检查
npm run lint

# 4. 本地预览
npm run dev

# 5. 构建生产版本
npm run build
```

只有 1–5 全部通过，才应该部署。

---

## 8. 重新部署

### 8.1 Vercel（推荐）

1. 将代码推送到 GitHub
2. Vercel 自动触发构建和部署
3. 构建成功后会收到新的 Production URL

### 8.2 手动

```bash
npm run build
npm run start
```

---

## 9. 常见错误排查

| 错误 | 原因 | 解决 |
|------|------|------|
| `Unknown category: xxx` | 分类未在 `categories.json` 定义 | 添加分类，或修正食物 `categories` |
| `Unknown alternative slug: xxx` | 替代食物不存在 | 创建对应食物，或更换已有 slug |
| `Invalid safety status` | `status` 拼写错误 | 使用 `safe`/`limited`/`toxic`/`unknown` |
| `Invalid last_reviewed date` | 日期格式错误 | 使用 `YYYY-MM-DD` |
| 构建报错 `useSearchParams()` | Suspense 边界缺失 | 已在 `app/search/page.tsx` 处理，勿在布局层使用 |

---

## 10. 内容扩展检查清单

新增食物时逐项确认：

- [ ] 文件名使用正确 slug
- [ ] 所有必填字段完整
- [ ] 分类存在于 `categories.json`
- [ ] 替代食物 slug 存在
- [ ] 来源 URL 可访问
- [ ] `last_reviewed` 已更新
- [ ] 已运行 `npm run content:validate`
- [ ] 已运行 `npm run build`
- [ ] 本地预览页面正常

---

## 11. 与后续阶段的关系

| 阶段 | 内容工作 |
|------|----------|
| Phase 1 | 扩充食物数量到 200+，补充图片 |
| Phase 2 | 用户可收藏/举报内容（数据层变化，内容格式不变） |
| Phase 3 | 启用 `content/plants/`，接入植物识别结果页 |
| Phase 4+ | 药物、症状、营养规划等内容复用同一套 schema 规范 |

---

## 12. 变更日志

| 日期 | 变更 |
|------|------|
| 2026-07-01 | 创建 Phase 0 内容运营与维护手册 |
