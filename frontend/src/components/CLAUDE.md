# components/

UI 组件层，按功能模块组织。

## App.vue（顶层调度）

App.vue 是唯一的顶层状态容器，持有 `markdownContent` ref 并协调所有子组件：
- **状态管理**：无 Vuex/Pinia，所有状态通过 ref + props/events 管理
- **Composable 注入**：初始化 useFileOperations（注入 contentRef）、useUndoRedo、useScrollSync、useFormat、useSettings
- **视图模式**：根据 `viewMode`（editor/preview/split）切换布局
- **快捷键**：全局监听 Ctrl+N/O/S/Z/Y（新建、打开、保存、撤销/重做）
- **自动保存**：可配置间隔的自动保存定时器
- **Toast 通知**：`showToast(message, type)` 支持 `TOAST_SUCCESS`（绿色）和 `TOAST_ERROR`（红色）两种类型
- **启动文件**：`onMounted` 时调用 Go 后端 `GetStartupFile()` 获取命令行参数（拖拽文件到 exe），自动加载 `.md` 文件

## 目录结构

| 目录 | 职责 | 关键文件 |
|------|------|----------|
| `toolbar/` | 顶部工具栏（文件操作、导出下拉菜单[HTML/Markdown]、视图切换、窗口控制）和格式栏（Markdown 格式化按钮、数学公式按钮） | `Toolbar.vue`, `FormatBar.vue` |
| `editor/` | Markdown 编辑器（textarea + 语法高亮叠层），Enter 键自动续行，Ctrl+F 搜索（区分大小写、全部高亮、上下导航） | `Editor.vue` |
| `preview/` | HTML 预览（marked 渲染 + highlight.js + mermaid + katex），图片/Mermaid 图表点击放大预览 | `Preview.vue`, `Lightbox.vue` |
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

### 代码块语法高亮（processCodeLine）

代码块（\`\`\` 围栏内）使用独立的 `processCodeLine` 单 pass tokenizer，不走 `processLine`：

- **注释**：`//`、`/* */`、`#`（排除 shebang 和预处理指令）
- **字符串**：`"..."`、`'...'`、`` `...` ``，支持转义
- **数字**：整数和浮点数
- **关键字**：`CODE_KEYWORDS` Set（function、return、if、const、class 等，覆盖 JS/TS/Python/Go/Java）
- **函数调用**：标识符后紧跟 `(`
- **类型**：大写字母开头的标识符
- CSS 类：`syntax-comment`、`syntax-string`、`syntax-number`、`syntax-keyword`、`syntax-function`、`syntax-type`

## 编辑器 Enter 键续行（Editor.vue）

Enter 键按下时自动识别当前行类型并续行：
- **有序列表**：自动递增编号，后续行重新编号
- **无序列表**：延续 `- ` / `* ` / `+ ` 前缀
- **任务列表**：延续 `- [ ] ` 前缀
- **引用块**：延续 `> ` 前缀
- 空行（只有前缀无内容）清除前缀

## 编辑器搜索（Editor.vue）

Ctrl+F 打开搜索栏：
- 支持完全匹配和忽略大小写（Aa 按钮切换）
- 所有匹配项黄色高亮，当前项橙色高亮
- Enter 向下搜索，Shift+Enter 向上搜索，Esc 关闭
- 从光标位置开始搜索，跳转时自动滚动到匹配位置
- 搜索高亮通过 `applySearchHighlights` 在语法高亮 HTML 上叠加，正确处理 HTML 标签和实体

## 预览区 Lightbox（Preview.vue + Lightbox.vue）

点击预览区图片或 Mermaid 图表打开全屏遮罩层预览：
- **Lightbox.vue** 独立组件，通过 `<Teleport>` 渲染到 body
- 图片使用 `<img>` 显示原始分辨率，Mermaid 图表重新渲染 SVG
- 滚轮以鼠标位置为中心缩放，放大后可拖拽移动
- 点击空白区域或 Esc 关闭，点击内容本身不关闭
- 顶部提示条 2.5 秒后自动淡出

## 文件树（FileTree.vue）

递归组件，懒加载子目录。点击文件夹时才调用 `ListDirectory()` 加载内容。通过白名单 `EDITABLE_EXTENSIONS` 过滤非文本文件。
