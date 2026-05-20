# utils/

工具函数，纯逻辑无 UI 依赖。

## markdown.ts

Markdown 渲染核心，基于 `marked` + `katex` + `mermaid`。

### 导出

| 函数 | 用途 |
|------|------|
| `createMarkdownParser(options?)` | 创建配置好的 Marked 实例（含数学扩展），Preview.vue 使用 |
| `renderMarkdown(content, options?)` | 一次性渲染，返回 HTML 字符串 |

### 数学公式扩展（mathExtension）

自定义 Marked 扩展，支持 KaTeX 数学公式：
- **块级公式**：`$$...$$` 或 `$...$` 独占一行，`displayMode` 渲染
- **行内公式**：`$...$` 或 `$$...$$` 嵌入文本中
- 转义处理：`\$` 不触发公式解析
- 边界防护：`$1`、`$ ` 等不合法的定界符不触发解析

### Marked 配置

- `breaks: true` — 单换行符渲染为 `<br>`
- `gfm: true` — GitHub Flavored Markdown
- 代码高亮由 Preview.vue 中的 highlight.js 处理（非 markdown.ts）

### 依赖

- `marked` — Markdown 解析器
- `katex` — 数学公式渲染（`throwOnError: false`）
