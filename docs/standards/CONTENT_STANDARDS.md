# PetPilot — 跨阶段内容规范

**版本**：1.0  
**日期**：2026-07-01  
**适用范围**：所有阶段（Phase 0+）

---

## 1. 内容理念（长期有效）

1. **权威**：基于 ASPCA、Pet Poison Helpline、兽医教科书、同行评审来源。
2. **一致**：每种内容条目遵循相同结构。
3. **可操作**：用户知道下一步做什么。
4. **诚实**：证据不足时使用 "unknown"。
5. **谨慎**：不确定时建议咨询兽医。

---

## 2. 安全状态定义（通用）

适用于食物、植物、药物等所有安全判断场景。

| 状态 | 颜色 | 含义 |
|------|------|------|
| `safe` | 绿色 | 对大多数健康宠物适量安全 |
| `limited` | 黄色 | 仅在特定条件下安全 |
| `toxic` | 红色 | 不安全，避免 |
| `unknown` | 灰色 | 信息不足，建议避免 |

### 严重度

| 严重度 | 含义 |
|--------|------|
| `low` | 轻微、可能自愈 |
| `moderate` | 可能需要兽医 |
| `high` | 可导致严重伤害或死亡 |
| `critical` | 即使少量也危及生命 |

---

## 3. 内容 Schema 通用字段

所有安全/健康相关内容条目（食物、植物、药物等）必须包含：

```yaml
id: string
name: string
slug: string
aliases: string[]
categories: string[]
safety:
  dogs: SafetyInfo
  cats: SafetyInfo
symptoms: string[]
what_to_do: string
alternatives: string[]
sources: Source[]
vet_reviewed: boolean
last_reviewed: date
```

特定类型可扩展字段（如植物的 `scientific_name`、药物的 `active_ingredient`），但不得删除通用字段。

---

## 4. 来源优先级

1. **第一层级**：ASPCA APCC、Pet Poison Helpline、Veterinary Partner、同行评审期刊
2. **第二层级**：AVMA、AKC、大学兽医院、兽医教科书
3. **第三层级**（谨慎）：PetMD、The Spruce Pets、兽医诊所博客

所有医疗/安全声明必须引用至少一个第一或第二层级来源。

---

## 5. 禁止声明

绝不说：
- "这是兽医建议"
- "你的宠物会没事"
- "少量总是安全的"
- "这能治愈/预防/治疗任何疾病"
- "家庭疗法能解决这个问题"

---

## 6. 推荐措辞

- "May cause..."
- "Can be toxic..."
- "Contact your veterinarian..."
- "Monitor for symptoms..."
- "If you are unsure..."

---

## 7. 语气与风格

- **共情**：理解主人担忧
- **清晰**：简单英语，避免术语
- **谨慎**：不过度承诺
- **有帮助**：始终提供下一步

格式规则：
- 标题句首大写
- 段落简短（2–3 句）
- 症状和步骤用项目符号
- 英制为主，公制括号标注

---

## 8. 内容审核流程

1. 研究权威来源
2. 创建条目
3. 交叉核对
4. 运行 `pnpm content:validate`
5. 提交

### 审核清单

- [ ] 必填字段完整
- [ ] 安全状态与权威来源一致
- [ ] 急救指导不淡化风险
- [ ] 来源列出且 URL 有效
- [ ] 无绝对保证
- [ ] 更新 `last_reviewed`
- [ ] 无诊断语言

---

## 9. 阶段扩展规则

新增内容类型（如植物、药物）时：

1. 复用本规范的安全状态定义
2. 在通用字段基础上扩展类型特定字段
3. 在 `content/[type]/` 下创建目录
4. 更新 `categories.json` 加入相关分类
5. 更新验证脚本
6. 在阶段文档中说明新增字段和示例

---

## 10. 变更控制

内容规范变更需记录于 `/docs/decisions/`，并更新本文件版本号。
