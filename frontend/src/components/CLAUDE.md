# components/

UI 组件层，按功能模块组织。

## 目录结构

| 目录 | 职责 | 关键文件 |
|------|------|----------|
| `toolbar/` | 顶部工具栏（文件操作、视图切换、窗口控制） | `Toolbar.vue`, `FormatBar.vue` |
| `editor/` | Markdown 编辑器（textarea + 语法高亮叠层） | `Editor.vue` |
| `preview/` | HTML 预览（marked 渲染 + highlight.js + mermaid） | `Preview.vue` |
| `sidebar/` | 侧边栏（文件树 + 大纲切换标签） | `Sidebar.vue`, `FileTree.vue` |
| `outline/` | 大纲面板（提取标题列表，点击跳转行号） | `Outline.vue` |
| `settings/` | 设置弹窗（主题、壁纸、自动保存等配置） | `SettingsModal.vue` |
| `layout/` | 布局组件（分栏容器） | `SplitPaneLayout.vue` |
| `common/` | 通用组件 | `Modal.vue` |

## 组件通信

- **App.vue** 是唯一的顶层状态容器，持有 `markdownContent` 和所有状态
- 子组件通过 props down / events up 与 App 通信
- 复杂逻辑抽到 `composables/`，组件只负责 UI 和事件转发

## 编辑器高亮机制（Editor.vue）

两层叠加架构：
1. **textarea**：透明文字，用户实际输入区域，隐藏原生滚动条
2. **highlight div**：绝对定位在 textarea 下方，用 `<span>` 标注语法颜色，通过 `transform: translate()` 同步滚动

两者必须保持同宽同折行，否则会错位。关键 CSS：`word-break: break-all` + `scrollbar-width: none`。

## 文件树（FileTree.vue）

递归组件，懒加载子目录。点击文件夹时才调用 `ListDirectory()` 加载内容。通过白名单 `EDITABLE_EXTENSIONS` 过滤非文本文件。
