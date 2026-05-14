# styles/

全局 CSS 变量和主题系统。所有颜色、间距、动画 token 都定义在这里。

## variables.css

按功能分组的 CSS 自定义属性：

| 分组 | 变量前缀 | 用途 |
|------|----------|------|
| 背景色 | `--bg-*` | primary, secondary, toolbar, hover |
| 文字色 | `--text-*` | primary, secondary, muted |
| 强调色 | `--accent-color` | 交互高亮、选中状态 |
| 边框 | `--border-color` | 分割线、边框 |
| 编辑器 | `--editor-*` | 光标、选区、行号 |
| 语法高亮 | `--syntax-*` | keyword, string, comment, function, variable |
| 预览区 | `--preview-*` | 引用块边框/背景 |
| 按钮 | `--btn-*` | active 文字色 |
| 壁纸 | `--wallpaper-*` | 背景、蒙层透明度 |
| 状态色 | `--success/warning/error-color` | Toast、文件状态指示器 |
| 光标 | `--cursor-*` | 指针、默认 |

## 主题切换

通过 `[data-theme="xxx"]` 选择器覆盖变量。每个主题定义完整变量集。组件不硬编码颜色，全部引用 CSS 变量。
