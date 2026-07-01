# PetPilot — 跨阶段代码规范

**版本**：1.0  
**日期**：2026-07-01  
**适用范围**：所有阶段（Phase 0+）

---

## 1. 技术栈（长期锁定）

| 层级 | 技术 |
|------|------|
| 框架 | Next.js (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 组件 | shadcn/ui |
| 图标 | Lucide React |
| 部署 | Vercel |
| 版本控制 | Git + GitHub |

后续阶段如需引入数据库、认证、搜索服务等，必须在本规范框架内扩展，不能替换核心栈。

---

## 2. 项目结构（稳定）

```
PetPilot/
├── app/                 # Next.js 路由和页面
├── components/          # React 组件
│   ├── ui/             # shadcn/ui 组件
│   ├── layout/         # Header, Footer
│   ├── search/         # 搜索相关
│   ├── food/           # 食物组件
│   ├── plant/          # 植物组件（未来）
│   └── [feature]/      # 其他功能组件
├── content/            # 内容源（Markdown/JSON）
├── lib/                # 工具函数
├── public/             # 静态资源
├── tests/              # 测试
└── docs/               # 文档
```

每个新功能必须在 `components/` 和 `content/` 下有独立、清晰的目录。

---

## 3. 代码风格

### 3.1 文件命名

- 组件：`PascalCase.tsx`
- 工具/hook：`camelCase.ts`
- 内容文件：`kebab-case.md`
- 测试：`ComponentName.test.ts`

### 3.2 TypeScript

- `strict: true`
- 优先 `interface`，联合类型用 `type`
- 禁止 `any`，不确定用 `unknown`

### 3.3 导入顺序

```typescript
// 1. React/Next
// 2. 外部库
// 3. 内部组件
// 4. 内部工具
// 5. 类型
```

### 3.4 Tailwind

- 优先工具类，少用 `@apply`
- 条件类用 `cn()`
- 颜色必须使用设计系统 token

---

## 4. Git 规范

### 4.1 分支

- `main`：可投产
- `feature/[name]`：功能
- `fix/[name]`：修复

### 4.2 提交信息

使用约定式提交：

```
<type>(<scope>): <描述>
```

常用类型：
- `feat`：新功能
- `fix`：修复
- `content`：内容更新
- `docs`：文档
- `style`：UI
- `refactor`：重构
- `test`：测试
- `chore`：配置

跨阶段提交范围：
- `food`：食物相关
- `plant`：植物相关
- `search`：搜索
- `auth`：认证（未来）
- `subscription`：订阅（未来）

---

## 5. 测试策略

### 5.1 必须测试的

- 纯工具函数（搜索、排序、验证、元数据生成）
- 内容 schema 验证
- 构建脚本

### 5.2 手动 QA

每次部署前检查：
- 首页和核心页面加载
- 移动端布局
- 控制台无错误
- 分析事件触发

### 5.3 内容验证

```bash
pnpm content:validate
```

每个阶段新增内容类型都必须加入此验证脚本。

---

## 6. 性能基线

- TTFB < 200ms
- LCP < 2.5s（移动端）
- 内容页 < 500KB
- 优先静态生成

---

## 7. 安全基线

- HTTPS only
- CSP 头
- 依赖项定期扫描
- 用户数据最小化收集

---

## 8. 阶段扩展规则

当新增功能阶段时：

1. 在 `components/` 下创建功能目录
2. 在 `content/` 下创建对应内容目录（如 `content/plants/`）
3. 在 `lib/types.ts` 中扩展共享类型
4. 更新 `content:validate` 脚本支持新内容类型
5. 在 `phases/phase-N-xxx.md` 中说明新增内容模型
6. 不得复制现有组件改名使用，优先抽象复用

---

## 9. 变更控制

代码规范变更需记录于 `/docs/decisions/`，并更新本文件版本号。
