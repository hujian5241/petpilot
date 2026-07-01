# Phase 0：MVP — 食物安全数据库

**版本**：1.0  
**日期**：2026-07-01  
**状态**：准备实施

---

## 1. 目标

上线一个快速、可信赖、SEO 友好的食物安全数据库，验证北美宠物主人的搜索需求。

---

## 2. 范围

### 2.1 包含

- 50 个核心人类食物条目
- 首页搜索 + 热门食物
- 食物详情页
- 分类浏览页
- 搜索结果页
- 急救页面
- 关于页面
- SEO 基础与联盟链接框架

### 2.2 不包含

- 用户账号
- 宠物档案
- 植物、药物、计算器、AI 等所有后续功能

详细范围见 [PRD](../PRD.md)。

---

## 3. 遵循的跨阶段规范

本阶段所有实现必须遵守：

- [设计规范](../standards/DESIGN_STANDARDS.md)
- [代码规范](../standards/CODE_STANDARDS.md)
- [内容规范](../standards/CONTENT_STANDARDS.md)
- [SEO 规范](../standards/SEO_STANDARDS.md)
- [合规规范](../standards/COMPLIANCE_STANDARDS.md)

---

## 4. 本阶段新增内容模型

### 4.1 食物条目

路径：`content/foods/{slug}.md`

完整 schema 见 [内容模型](../CONTENT_MODEL.md)。

核心字段：

```yaml
id: string
name: string
slug: string
aliases: string[]
categories: string[]
safety:
  dogs: { status, severity, summary }
  cats: { status, severity, summary }
symptoms: string[]
what_to_do: string
alternatives: string[]
sources: { name, url }[]
vet_reviewed: boolean
last_reviewed: date
```

### 4.2 分类

路径：`content/categories.json`

### 4.3 站点元数据

路径：`content/site.json`

### 4.4 急救信息

路径：`content/emergency.json`

---

## 5. 页面清单

| 页面 | 路径 | 生成方式 |
|------|------|----------|
| 首页 | `/` | SSG |
| 食物详情 | `/foods/{slug}` | SSG |
| 分类页 | `/categories/{slug}` | SSG |
| 搜索 | `/search` | 客户端 |
| 急救 | `/emergency` | SSG |
| 关于 | `/about` | SSG |
| 重定向 | `/can-dogs-eat/{slug}` | 301 到食物页 |
| 重定向 | `/can-cats-eat/{slug}` | 301 到食物页 |

---

## 6. 初始内容清单（50 种）

见 [内容模型](../CONTENT_MODEL.md) 中 "Initial Content Priority List"。

---

## 7. 技术要点

- Next.js 15 App Router
- 静态生成所有食物/分类页面
- 客户端搜索（Fuse.js）
- 内容存储为 Markdown + YAML
- Vercel 部署

完整技术细节见 [架构文档](../ARCHITECTURE.md)。

---

## 8. 成功标准

| 指标 | 目标 |
|------|------|
| 索引食物页面 | 50+ |
| 月度自然流量 | 500+ 会话 |
| 首页 LCP | < 2.5s |
| 内容验证 | 0 错误 |
| 联盟链接框架 | 上线并追踪 |

---

## 9. 进入 Phase 1 门槛

满足以下任一条件：
- 月度有机会话 ≥ 500
- 或 30+ 食物页面排名进入前 50

---

## 10. 风险

| 风险 | 缓解 |
|------|------|
| 内容不准确 | 权威来源 + 免责声明 + 保守声明 |
| 上线后无流量 | 长尾 SEO + 耐心等待 3 个月 |
| 范围蔓延 | 严格禁止 Phase 1+ 功能 |

---

## 11. 参考文档

- [PRD](../PRD.md)
- [架构](../ARCHITECTURE.md)
- [内容模型](../CONTENT_MODEL.md)
- [SEO 策略](../SEO_STRATEGY.md)
- [设计系统](../DESIGN_SYSTEM.md)
- [开发流程](../DEV_WORKFLOW.md)
- [合规](../COMPLIANCE.md)
- [路线图](../ROADMAP.md)
