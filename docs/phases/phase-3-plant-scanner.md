# Phase 3：植物扫描

**版本**：0.1（草案）  
**日期**：2026-07-01  
**状态**：规划中，Phase 2 达成后启动

---

## 1. 目标

将安全覆盖从食物扩展到家庭和户外植物，捕获新的搜索需求。

---

## 2. 范围

### 2.1 包含

- 200+ 常见植物条目
- 植物详情页
- 植物识别 MVP（图像上传或第三方 API）
- "我的宠物吃了植物" 急救流程

### 2.2 不包含

- 完美识别准确率
- 离线识别
- 药物检查器

---

## 3. 遵循的跨阶段规范

- [设计规范](../standards/DESIGN_STANDARDS.md)
- [代码规范](../standards/CODE_STANDARDS.md)
- [内容规范](../standards/CONTENT_STANDARDS.md)
- [SEO 规范](../standards/SEO_STANDARDS.md)
- [合规规范](../standards/COMPLIANCE_STANDARDS.md)

---

## 4. 本阶段新增内容模型

### 4.1 Plant Entry

路径：`content/plants/{slug}.md`

在 [内容规范](../standards/CONTENT_STANDARDS.md) 通用字段基础上扩展：

```yaml
id: string
name: string
slug: string
aliases: string[]
scientific_name: string
categories: string[]
safety:
  dogs: { status, severity, summary }
  cats: { status, severity, summary }
symptoms: string[]
what_to_do: string
alternatives: string[]   # 安全室内植物
sources: { name, url }[]
vet_reviewed: boolean
last_reviewed: date
images:
  - src: /images/plants/{slug}.jpg
    alt: string
```

### 4.2 新增分类

在 `content/categories.json` 中加入植物相关分类：
- houseplants
- garden-plants
- outdoor-plants
- toxic-houseplants

---

## 5. 页面清单

| 页面 | 路径 | 说明 |
|------|------|------|
| 植物详情 | `/plants/{slug}` | 新页面类型 |
| 植物分类 | `/categories/{slug}` | 复用现有分类页 |
| 植物识别 | `/plant-scanner` | 新工具页面 |

---

## 6. SEO 重点

- 关键词："is [plant] toxic to dogs"
- 为常见室内植物创建详情页
- 春夏季加大推广

---

## 7. 成功标准

| 指标 | 目标 |
|------|------|
| 索引植物页面 | 100+ |
| 植物页面月度会话 | 1,000+ |
| 识别工具使用 | 测试阶段 |

---

## 8. 进入 Phase 4 门槛

- 植物页面月度会话 ≥ 1,000

---

## 9. 风险

| 风险 | 缓解 |
|------|------|
| 植物种类繁多 | 优先常见室内/户外植物 |
| 识别不准确 | 明确提示用户确认 |
| 与食物内容重复 | 植物使用独立分类和页面 |

---

## 10. 决策依赖

- 植物识别方案（Google Lens / 第三方 API / 自建模型）
- 图片存储方案
- 植物内容生产流程

相关决策将记录于 `/docs/decisions/`。
