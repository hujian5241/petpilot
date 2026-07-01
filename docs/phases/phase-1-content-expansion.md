# Phase 1：内容扩展与信任建设

**版本**：0.1（草案）  
**日期**：2026-07-01  
**状态**：规划中，Phase 0 达成后启动

---

## 1. 目标

在 Phase 0 验证需求后，扩大内容覆盖范围，建立主题权威，并启动邮件列表。

---

## 2. 范围

### 2.1 包含

- 将食物条目从 50 扩展到 150–200
- 添加制作方式/数量变体（如 cooked chicken、grapeseed oil）
- 添加 5–10 篇支柱指南（guides）
- 邮件订阅收集
- 社交分享卡片
- 反向链接拓展
- 兽医审核标识强化

### 2.2 不包含

- 用户账号
- 宠物档案
- 植物数据库
- 计算器和工具
- 订阅付费

---

## 3. 遵循的跨阶段规范

- [设计规范](../standards/DESIGN_STANDARDS.md)
- [代码规范](../standards/CODE_STANDARDS.md)
- [内容规范](../standards/CONTENT_STANDARDS.md)
- [SEO 规范](../standards/SEO_STANDARDS.md)
- [合规规范](../standards/COMPLIANCE_STANDARDS.md)

---

## 4. 本阶段新增内容模型

### 4.1 Guide（指南）

新内容类型：长篇指南文章。

路径：`content/guides/{slug}.md`

Schema：

```yaml
id: string
name: string
slug: string
categories: string[]
author: string
vet_reviewed: boolean
last_reviewed: date
related_foods: string[]
related_plants: string[]   # 预留，未来使用
meta_title: string
meta_description: string
---
# 标题

正文内容...
```

### 4.2 扩展现有 Food Entry

- 增加 `preparation_variants` 字段（可选）
- 增加 `quantity_notes` 字段（可选）
- 增加 `condition_notes` 字段（如幼犬、老年犬、糖尿病）

字段扩展必须在 [内容规范](../standards/CONTENT_STANDARDS.md) 更新后实施。

---

## 5. 页面清单

| 页面 | 路径 | 说明 |
|------|------|------|
| 指南详情 | `/guides/{slug}` | 新页面类型 |
| 指南列表 | `/guides` | 可选 |
| 食物详情 | `/foods/{slug}` | 扩展字段 |
| 邮件订阅落地页 | `/newsletter` | 可选 |

---

## 6. SEO 重点

- 围绕 "foods toxic to dogs"、"safe fruits for dogs" 等主题词创建支柱指南
- 指南与食物详情页互相内链
- 针对 Search Console 数据优化高排名页面

---

## 7. 成功标准

| 指标 | 目标 |
|------|------|
| 月度有机会话 | 5,000+ |
| 索引页面 | 200+ |
| 精选摘要 | 5+ |
| 反向链接 | 10+ |
| 邮件订阅 | 100+ |

---

## 8. 进入 Phase 2 门槛

- 月度有机会话 ≥ 5,000
- 或邮件订阅 ≥ 200

---

## 9. 风险

| 风险 | 缓解 |
|------|------|
| 内容生产速度慢 | AI 辅助 + 人工核查 |
| 指南质量不足 | 严格遵循内容规范 |
| 邮件列表增长慢 | 提供高价值 lead magnet |

---

## 10. 决策依赖

本阶段需要以下决策：
- 是否使用邮件服务商（Mailchimp / ConvertKit / Buttondown）
- 指南内容的优先级排序
- 是否引入外部兽医审核

相关决策将记录于 `/docs/decisions/`。
