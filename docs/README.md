# PetPilot 文档导航

欢迎来到 PetPilot 文档中心。

## 文档分层

本项目文档按以下三层组织，确保基础规范长期稳定，阶段计划清晰独立：

### 1. `standards/` — 跨阶段规范（长期有效）

这些文档定义了所有阶段都必须遵守的底层规则。进入 Phase 1/2/3 时，不需要重写这些规范，只需引用它们。

| 文档 | 内容 |
|------|------|
| [DESIGN_STANDARDS.md](./standards/DESIGN_STANDARDS.md) | 品牌、色彩、字体、通用组件、无障碍 |
| [CODE_STANDARDS.md](./standards/CODE_STANDARDS.md) | 技术栈、项目结构、代码风格、Git、测试 |
| [CONTENT_STANDARDS.md](./standards/CONTENT_STANDARDS.md) | 安全状态定义、内容 schema、来源要求、审核流程 |
| [SEO_STANDARDS.md](./standards/SEO_STANDARDS.md) | URL 结构、标题、元描述、结构化数据、内链 |
| [COMPLIANCE_STANDARDS.md](./standards/COMPLIANCE_STANDARDS.md) | 免责声明、紧急联系、联盟披露、隐私合规 |

### 2. `phases/` — 阶段计划（按阶段更新）

每个阶段一份文档，只描述该阶段的目标、范围、新增模型、验收标准和进入门槛。

| 文档 | 状态 |
|------|------|
| [phase-0-mvp-food-database.md](./phases/phase-0-mvp-food-database.md) | 准备实施 |
| [phase-0-content-operations.md](./phases/phase-0-content-operations.md) | 已创建 |
| [phase-1-content-expansion.md](./phases/phase-1-content-expansion.md) | 规划中 |
| [phase-2-user-accounts.md](./phases/phase-2-user-accounts.md) | 规划中 |
| [phase-3-plant-scanner.md](./phases/phase-3-plant-scanner.md) | 规划中 |

后续阶段（Phase 4+）文档将在前一阶段达成后创建。

### 3. `decisions/` — 架构决策记录（ADRs）

记录重要的技术或产品决策及其理由，便于未来回顾和变更时参考。

| 文档 | 内容 |
|------|------|
| [001-static-first-content-architecture.md](./decisions/001-static-first-content-architecture.md) | 为什么选择 Markdown + YAML 静态内容架构 |
| [002-no-user-accounts-in-mvp.md](./decisions/002-no-user-accounts-in-mvp.md) | 为什么 MVP 不包含用户账号 |

## 根目录详细文档

`docs/` 根目录下还保留了 Phase 0 的详细实现文档，供开发时直接参考：

| 文档 | 用途 |
|------|------|
| [PRD.md](./PRD.md) | 产品需求文档 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 技术架构详细说明 |
| [CONTENT_MODEL.md](./CONTENT_MODEL.md) | 食物内容模型与数据规范 |
| [SEO_STRATEGY.md](./SEO_STRATEGY.md) | SEO 与内容增长策略 |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | 视觉设计与组件规范 |
| [DEV_WORKFLOW.md](./DEV_WORKFLOW.md) | 开发流程与 Git 规范 |
| [COMPLIANCE.md](./COMPLIANCE.md) | 合规与免责声明详细说明 |
| [ROADMAP.md](./ROADMAP.md) | 完整产品路线图 |

## 语言版本

- `docs/` 根目录：英文（面向北美市场和开发）
- `docs/en/`：英文副本
- `docs/zh/`：中文翻译（便于内部阅读和管理）

## 如何使用本文档

### 开发 Phase 0 时

1. 先阅读 `phases/phase-0-mvp-food-database.md`
2. 参考 `standards/` 中的跨阶段规范
3. 详细实现细节查阅根目录下的 `PRD.md`、`ARCHITECTURE.md` 等

### 规划 Phase 1 时

1. 不需要重写 `standards/` 中的规范
2. 创建 `phases/phase-1-content-expansion.md`
3. 如果需要扩展内容 schema，更新 `standards/CONTENT_STANDARDS.md` 并记录 ADR
4. 如果新增技术方案，记录 ADR

### 修改基础规范时

1. 更新 `standards/` 中对应文件
2. 递增版本号
3. 在 `decisions/` 中记录变更原因
4. 通知所有相关阶段文档引用新版本

## 变更日志

| 日期 | 变更 |
|------|------|
| 2026-07-01 | 创建 Phase 0 内容运营与维护手册 |
| 2026-07-01 | 创建跨阶段规范体系（standards/、phases/、decisions/） |
| 2026-07-01 | 创建 Phase 0–3 阶段计划 |
| 2026-07-01 | 添加 ADR 001、002 |
