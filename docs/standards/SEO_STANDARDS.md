# PetPilot — 跨阶段 SEO 规范

**版本**：1.0  
**日期**：2026-07-01  
**适用范围**：所有阶段（Phase 0+）

---

## 1. SEO 目标（长期）

成为北美宠物安全/营养查询的首选自然搜索结果。

---

## 2. URL 结构（稳定）

| 内容类型 | URL 模式 | 示例 |
|----------|----------|------|
| 首页 | `/` | `/` |
| 食物 | `/foods/{slug}` | `/foods/grapes` |
| 植物 | `/plants/{slug}` | `/plants/oleander` |
| 药物 | `/medicines/{slug}` | `/medicines/ibuprofen` |
| 分类 | `/categories/{slug}` | `/categories/fruits` |
| 搜索 | `/search?q={query}` | `/search?q=grapes` |
| 急救 | `/emergency` | `/emergency` |
| 指南 | `/guides/{slug}` | `/guides/foods-toxic-to-dogs` |

搜索模式重定向：
- `/can-dogs-eat/{slug}` → `/foods/{slug}`
- `/can-cats-eat/{slug}` → `/foods/{slug}`
- `/is-{plant}-toxic-to-dogs` → `/plants/{slug}`

---

## 3. 标题公式

**安全类详情页**：
```
Can Dogs Eat {Name}? Safety, Risks & Alternatives | PetPilot
```

**植物类详情页**：
```
Is {Name} Toxic to Dogs and Cats? | PetPilot
```

**分类页**：
```
{Category} Dogs & Cats Can {Eat/Use}: Safe & Toxic List | PetPilot
```

---

## 4. 元描述公式

```
{Name} is {status} for dogs and {status} for cats. Learn why, what symptoms to watch for, and find safe alternatives. Vet-reviewed guide from PetPilot.
```

---

## 5. 结构化数据（必需）

| 页面 | Schema |
|------|--------|
| 首页 | WebSite, Organization |
| 详情页 | FAQPage, BreadcrumbList |
| 分类页 | ItemList, BreadcrumbList |
| 指南 | Article, BreadcrumbList |
| 所有页面 | BreadcrumbList |

---

## 6. 内链规则

每个详情页必须包含：
1. 3–5 个安全替代品链接
2. 所属分类链接
3. 链接到 `/emergency`（有毒/适量/危险内容）
4. 关于页/来源说明链接

中心页面：
- `/emergency`
- `/categories/{slug}`
- `/guides/{slug}`

---

## 7. 技术 SEO 基线

- HTTPS
- 移动端友好
- LCP < 2.5s
- XML 站点地图自动生成
- robots.txt 配置正确
- 规范 URL
- 语义化 HTML
- 唯一标题/元描述
- 图片 alt 文本

---

## 8. 阶段扩展规则

新增内容类型时：

1. 复用本规范的 URL 模式
2. 复用标题/元描述公式
3. 在 FAQ schema 中包含该类型相关问题
4. 在站点地图中包含新类型页面
5. 添加对应搜索模式重定向
6. 在分类系统中注册新类型

---

## 9. 禁止行为

- 购买反向链接
- 重复或机器生成内容
- 隐藏联盟链接
- 标题党
- 无资质声称专业（YMYL / E-E-A-T 风险）

---

## 10. 变更控制

SEO 规范变更需记录于 `/docs/decisions/`，并更新本文件版本号。
