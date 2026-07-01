# Architecture Decision Record 001: Static-First Content Architecture

**状态**：已批准  
**日期**：2026-07-01  
**决策人**：Solo Founder + AI Assistant

---

## 上下文

PetPilot 是一个内容驱动的宠物安全信息平台。在 MVP 阶段，内容主要是结构化的人类食物安全数据，未来会扩展到植物、药物、营养计划等。

需要决定如何存储和提供内容：数据库、CMS、还是静态文件。

## 考虑的选项

| 选项 | 优点 | 缺点 |
|------|------|------|
| 数据库 (PostgreSQL) | 动态查询、适合用户数据 | 增加复杂度、需要运维、MVP 不需要 |
| 无头 CMS (Sanity/Contentful) | 编辑体验好、适合协作 | 额外成本、Vendor lock-in、MVP 过度设计 |
| Markdown + YAML 静态文件 | 简单、版本控制友好、快速、免费、SEO 友好 | 大规模内容管理效率低 |
| JSON 文件 | 简单、易解析 | 不如 Markdown 适合长文本 |

## 决策

采用 **Markdown + YAML frontmatter** 作为内容源，构建时静态生成页面。

## 理由

1. MVP 内容量可控（50–200 条目），静态文件足够。
2. 静态生成对 SEO 和性能最优。
3. Git 版本控制天然支持内容审核和回滚。
4. 无额外成本，适合 solo founder。
5. 结构便携，未来可迁移到 CMS 或数据库。

## 影响

- 所有食物、植物、药物内容以 Markdown 文件存储在 `content/`。
- 页面在构建时生成，内容更新需要重新部署。
- 搜索使用构建时生成的静态索引。

## 后续阶段

当内容量达到数千条或需要多用户协作编辑时，再评估迁移到无头 CMS 或数据库。

## 相关文档

- [代码规范](../standards/CODE_STANDARDS.md)
- [内容规范](../standards/CONTENT_STANDARDS.md)
- [Phase 0 计划](../phases/phase-0-mvp-food-database.md)
