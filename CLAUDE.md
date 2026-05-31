# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

QMMD — Markdown 桌面编辑器，Wails v2 (Go) + Vue 3 + TypeScript。

## 构建 & 运行

```bash
wails build          # 生产构建 → build/bin/qmmd.exe
wails dev            # 开发模式（热重载，Go 和前端同时监听）
```

## 测试

```bash
cd frontend
npx vitest run                   # 运行全部测试
npx vitest run markdown.test     # 运行单个测试文件
npx vitest                       # watch 模式
```

测试文件位于 `__tests__/` 目录或 `*.test.ts`，使用 Vitest + jsdom + @vue/test-utils。

## 架构

```
qmmd/
├── main.go           # Wails 启动入口，窗口配置（无边框、1280x800）
├── app.go            # Go 后端：文件 I/O、对话框、导出、窗口控制
├── frontend/         # Vue 3 SPA（Vite 构建）
│   └── src/
│       ├── components/   # UI 组件
│       ├── composables/  # Vue 组合式函数（状态、业务逻辑）
│       ├── utils/        # 工具函数（Markdown 解析器、KaTeX 数学公式）
│       ├── styles/       # CSS 变量（主题、壁纸、全局 token）
│       └── env.d.ts      # TypeScript 全局类型声明（__APP_VERSION__）
└── build/            # 构建输出和资源
```

Go 后端通过 Wails 绑定暴露为 JS 函数（自动生成在 `frontend/wailsjs/`，已 `.gitignore`）。前端通过调用这些函数完成文件读写、对话框、窗口控制。

### Go 后端 API（app.go）

`App` struct 暴露的方法即为前端可调用的 API：

| 方法 | 功能 |
|------|------|
| `ReadFile(path)` / `WriteFile(path, content)` / `SaveFile(content)` | 文件读写 |
| `ListDirectory(path)` / `FileExists(path)` / `CreateFile(path)` | 文件系统操作 |
| `OpenFileDialog()` / `SaveFileDialog(default, filter)` / `OpenDirectoryDialog()` | 系统对话框 |
| `ExportToHTML(path, content, title)` | 导出 HTML（字符串拼接，非 fmt.Sprintf） |
| `ExportToPDF(path, content, title)` | 导出 PDF（Edge/Chrome headless --print-to-pdf） |
| `GetCurrentFile()` / `IsMarkdownFile(path)` / `NewFile()` | 文件状态查询 |
| `OpenInBrowser(url)` / `OpenNewWindow()` | 外部操作 |
| `GetStartupFile()` | 获取启动参数文件路径（拖拽到 exe），只消费一次 |
| `MinimiseWindow()` / `ToggleMaximiseWindow()` / `CloseWindow()` | 窗口控制 |

所有文件操作返回 `FileResult { Success, Content, Error }`。

### 前端数据流

```
App.vue (markdownContent ref)
  → setContentRef() 注入到 useFileOperations
  → 传递给 useUndoRedo 做历史记录
  → 传递给 Editor/Preview 组件渲染
```

App.vue 是唯一的顶层状态容器，无 Vuex/Pinia，所有状态通过 ref + props/events 管理。

### 编辑器两层叠加架构（Editor.vue）

1. **textarea**：透明文字，用户实际输入区域，隐藏原生滚动条
2. **highlight div**：绝对定位在 textarea 下方，用 `<span>` 标注语法颜色，通过 `transform: translate()` 同步滚动

两者必须保持同宽同折行，否则会错位。关键 CSS：`word-break: break-all` + `scrollbar-width: none`。

### 编辑器语法高亮（processLine 函数）

正则匹配顺序重要，**粗体必须在斜体之前**（`**` 优先于 `*`，`__` 优先于 `_`）。下划线版本的粗体/斜体正则需要边界检查，使用 `(^|[\s])` 捕获组方式匹配行首和空格后的位置，避免 `my_variable_name` 中的 `_variable_` 误匹配。

裸 URL 自动高亮排除全角标点（`）`、`，`、`。` 等），防止中文标点后的文字被当作 URL 一部分。

代码块（\`\`\` 围栏内）使用独立的 `processCodeLine` 单 pass tokenizer，高亮注释、字符串、数字、关键字、函数调用和类型名。`highlightedContent` computed 通过 `inCodeBlock` 状态切换两个 processor。

### 预览区自定义 renderer（Preview.vue）

`renderer.link` 自动截断 href 中的全角标点。对于 autolink（`token.text === token.href`），链接文本也截断，多余文字作为普通文本显示在链接后面。

## 关键约定

- **构建验证**：改动后必须 `wails build` 通过再提交 git
- **构建即验证**：build 通过即可提交，无需询问用户
- **文件名提取**：用 `path.replace(/.*[/\\]/, '')` 而非 `split('/').pop() || split('\\').pop()`（后者在 Windows 上有逻辑 bug）
- **编辑器高亮层**：textarea 和 highlight div 必须同宽同折行（无滚动条占宽 + `word-break: break-all`）
- **文件树过滤**：只展示白名单内的可编辑文件后缀，过滤掉二进制文件
- **预览区图片/图表点击**：点击图片或 Mermaid 图表打开 Lightbox 全屏预览，支持滚轮缩放和拖拽移动
- **导出下拉菜单**：Toolbar 的导出按钮提供 HTML 和 Markdown 两种格式。导出结果通过 toast 通知（成功绿色、失败红色）

## 版本号管理

升级版本时需要同时修改以下位置：

| 文件 | 字段 |
|------|------|
| `wails.json` | `"version": "x.y.z"` |
| `frontend/package.json` | `"version": "x.y.z"` |

`SettingsModal.vue` 的版本号通过 Vite `define` 从 `package.json` 自动注入（`__APP_VERSION__`），无需手动修改。

## 详细文档

- [frontend/src/components/](frontend/src/components/CLAUDE.md) — UI 组件结构和编辑器机制
- [frontend/src/composables/](frontend/src/composables/CLAUDE.md) — 业务逻辑层和数据流
- [frontend/src/styles/](frontend/src/styles/CLAUDE.md) — 主题和 CSS 变量系统
- [frontend/src/utils/](frontend/src/utils/CLAUDE.md) — Markdown 渲染和数学公式
