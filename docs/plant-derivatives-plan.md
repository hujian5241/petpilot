# 植物衍生词 SEO 使用方案

## 已生成的资源

1. **content/en/plant-derivatives.json**
   - 128 种植物 → 5,631 个衍生词
   - 覆盖疑问句、动物对象短语、状态/场景、植物部位变体
   - 每个衍生词都映射到最相关的现有植物 slug

2. **content/en/plant-derivatives-high-value.json**
   - 3,604 个高价值衍生词
   - 聚焦于高搜索意图的疑问句式、动物对象短语、叶片/部位毒性问题，以及有毒/高优先级植物的部位变体

## 推荐用法（不新建页面）

### 1. 搜索索引扩展
- 将 `plant-derivatives-high-value.json` 与 `food-derivatives-high-value.json` 一起加载到搜索索引中。
- 每个衍生词指向其 `target_slug` 对应的植物页面。
- 例如 "are tulip leaves toxic to cats" → `/plants/tulips`。

### 2. 内容自动内链
- 渲染植物页面、新闻文章和危害指南时，将首次出现的衍生词链接到对应植物页面。
- 例如 "lily pollen" 链接到 `/plants/lily`，"sago palm seeds" 链接到 `/plants/sago-palm`。

### 3. 搜索自动补全
- 将植物衍生词输入自动补全，优先展示疑问句式。
- "Are lily leaves toxic to dogs" 和 "aloe for cats" 是高价值的自动补全候选。

### 4. 站点地图与 Meta 丰富
- 在植物页面的 meta 描述和 JSON-LD keywords 中加入衍生词。
- 确保目标页面提及常见部位变体（leaves, pollen, bulbs, berries），因为这些是常见的毒性接触途径。

### 5. FAQ 结构化数据
- 使用衍生疑问句式为植物页面添加 FAQ 结构化数据：
  - "Are [plant] leaves toxic to dogs?"
  - "Is [plant] safe for cats?"
  - "Can dogs eat [plant] berries?"
- 答案从现有安全摘要推导。

### 6. 相关搜索模块
- 在每个植物页面展示 "People also ask" 模块，包含衍生问题。
- SEO 价值保留在 canonical 植物页面。

## 下一步实施计划

1. 将植物衍生词合并到搜索索引构建器中。
2. 在植物详情页的 FAQ 结构化数据中添加植物衍生问题。
3. 在植物详情页添加相关搜索组件。

## 注意事项

- 植物别名包含学名，部分生成词可能使用拉丁名（如 sago palm 的 "Cycad"）。保留在全量文件中，但可考虑从高价值子集中剔除非英文术语。
- 部位衍生词如 "asparagus fern berries" 搜索量可能较低，优先对有毒植物生成部位变体。
