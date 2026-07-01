# Phase 2：用户账号与宠物档案

**版本**：0.1（草案）  
**日期**：2026-07-01  
**状态**：规划中，Phase 1 达成后启动

---

## 1. 目标

引入用户账号和宠物档案，为个性化推荐和订阅变现做准备。

---

## 2. 范围

### 2.1 包含

- 用户注册/登录（邮箱/密码或社交登录）
- 宠物档案（物种、品种、年龄、体重、健康状况）
- 基于宠物档案的个性化安全警告
- 收藏/保存的食物
- 用户仪表盘
- 数据库迁移

### 2.2 不包含

- 付费订阅
- 植物扫描
- 计算器
- AI 助手

---

## 3. 遵循的跨阶段规范

- [设计规范](../standards/DESIGN_STANDARDS.md)
- [代码规范](../standards/CODE_STANDARDS.md)
- [内容规范](../standards/CONTENT_STANDARDS.md)
- [SEO 规范](../standards/SEO_STANDARDS.md)
- [合规规范](../standards/COMPLIANCE_STANDARDS.md)

---

## 4. 本阶段新增数据模型

### 4.1 User

```typescript
interface User {
  id: string
  email: string
  created_at: Date
  updated_at: Date
  subscription_tier: 'free' | 'basic' | 'premium'
  pets: Pet[]
  saved_foods: string[]
  saved_plants: string[]
}
```

### 4.2 Pet

```typescript
interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed?: string
  birth_date?: Date
  weight?: number          // kg or lb, consistent
  activity_level?: 'low' | 'moderate' | 'high'
  health_conditions?: string[]
  is_neutered?: boolean
}
```

### 4.3 SavedItem

```typescript
interface SavedItem {
  user_id: string
  item_type: 'food' | 'plant' | 'medicine' | 'guide'
  item_slug: string
  saved_at: Date
}
```

---

## 5. 技术要点

- 引入数据库：Supabase 或 Vercel Postgres
- 认证：Auth.js 或 Clerk
- API Routes 处理用户数据
- 静态页面保持无账号依赖
- 个性化功能仅对登录用户显示

---

## 6. 合规要点

- 隐私政策必须更新，说明收集的数据
- 用户数据最小化
- 提供账号删除功能
- Cookie 同意横幅

---

## 7. 成功标准

| 指标 | 目标 |
|------|------|
| 注册用户 | 500+ |
| 创建宠物档案比例 | 20%+ |
| 邮件打开率 | 25%+ |

---

## 8. 进入 Phase 3 门槛

- 注册用户 ≥ 500
- 基础设施稳定

---

## 9. 风险

| 风险 | 缓解 |
|------|------|
| 数据库引入增加复杂度 | 选择托管服务 |
| 隐私合规 | 详细隐私政策 + 用户控制 |
| 登录降低转化率 | 保持公开内容免费 |

---

## 10. 决策依赖

- 数据库选择（Supabase vs Vercel Postgres）
- 认证方案（Auth.js vs Clerk）
- 是否提前引入付费墙测试

相关决策将记录于 `/docs/decisions/`。
