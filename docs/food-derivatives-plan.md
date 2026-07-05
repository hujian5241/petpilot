# 食物衍生词 SEO 使用方案

## 已生成的资源

1. **content/en/food-derivatives.json**
   - 300 种食物 → 11,936 个衍生词
   - 覆盖全部模式：疑问句、动物对象、数量/幼宠、烹饪/状态、部位/形态
   - 每个衍生词都映射到最相关的现有食物 slug

2. **content/en/food-derivatives-high-value.json**
   - 5,636 个高价值衍生词
   - 聚焦于高搜索意图的疑问句式、动物对象短语、数量/准备问题，以及有毒/高优先级食物的部位变体
   - 信噪比更高，适合直接用于 SEO

## 推荐用法（不新建页面）

### 1. 搜索索引扩展
- 在搜索索引构建器中加载 `food-derivatives-high-value.json`。
- 每个衍生词指向其 `target_slug` 对应的食物页面。
- 例如用户搜索 "can dogs eat apple skin" 或 "apple for puppies"，会跳转到 `apple-slices` 页面。
- 实现方式：扩展现有搜索索引构建器（如 `lib/search.ts`），将衍生词以 `type: "derivative"` 加入索引。

### 2. 内容自动内链
- 渲染食物页面、新闻文章、指南时，扫描内容中首次出现的衍生词并链接到对应食物页面。
- 例如在一篇关于 xylitol 的新闻中，"birch sugar" 自动链接到 `/foods/xylitol`。
- 避免重复链接，尊重已有链接。

### 3. 搜索自动补全
- 将衍生词输入搜索自动补全数据集。
- 优先展示疑问形式（如 "can dogs eat grapes"），因为更匹配自然搜索查询。

### 4. 站点地图与 Meta 丰富
- 将衍生词加入食物页面的 `<meta name="description">` 和 JSON-LD `keywords`。
- 例如 apple-slices 的描述可以包含 "apple skin, apple core, apple for dogs, can dogs eat apple"。
- 不要堆砌，保持描述可读。

### 5. FAQ 结构化数据
- 使用衍生疑问句式为食物页面添加 FAQ 结构化数据：
  - "Can dogs eat apple skin?"
  - "Is apple safe for puppies?"
- 答案从现有安全摘要和状态推导。

### 6. 相关搜索模块
- 在每个食物页面展示 "People also ask" 或 "Related searches" 模块：
  - can dogs eat [food]
  - is [food] safe for cats
  - [food] for puppies
- 点击后仍停留在同一页面（带锚点），SEO 价值集中在 canonical 页面。

### 7. 重定向与 Canonical 处理
- 如果后续创建独立长尾页面，先用 301 重定向或 canonical 标签指回主食物页面，直到内容足够独特。
- 目前将所有 SEO 价值保留在现有食物页面。

## 下一步实施计划

1. 添加搜索索引构建器，加载 `food-derivatives-high-value.json`。
2. 添加食物页面辅助函数，提取顶部衍生疑问用于 FAQ 结构化数据。
3. 在食物详情页添加相关搜索组件。
4.（可选）建立小型管理/校验脚本，每月审查衍生词质量。

## 注意事项

- 部分生成词使用的别名可能较生僻（如 xylitol 的 "birch sugar"）。可保留在全量文件中，但需定期审查。
- 部位类词如 "blueberry rind" 价值较低，保留在全量文件中，优先对用户可见功能使用高价值子集。
- 目前没有统一的 `chicken`、`beef`、`pork` 页面，衍生词会路由到最具体的现有条目。如果搜索需求足够大，可考虑为这些高流量类别添加汇总页。
