# QMMD

轻量级 Markdown 桌面编辑器。

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Wails v2 |
| 后端 | Go |
| 前端 | Vue 3 + TypeScript + Vite |
| Markdown 渲染 | marked |
| 数学公式 | KaTeX |
| 图表 | Mermaid |
| 代码高亮 | highlight.js |

## 已实现功能

### 编辑器
- Markdown 语法高亮（标题、粗体、斜体、代码、链接、列表等）
- 编辑器 / 预览 / 分栏三种视图模式
- Ctrl+F 搜索（区分大小写、全部高亮、上下导航）
- Enter 键自动续行（列表、引用块自动延续前缀）
- 撤销 / 重做（Ctrl+Z / Ctrl+Y）
- 拖拽 .md 文件到 exe 直接打开

### 预览
- 实时渲染，编辑器与预览区滚动同步
- 数学公式（行内 `$...$`、块级 `$$...$$`）
- Mermaid 图表（流程图、时序图、甘特图等）
- 代码块语法高亮
- 图片和 Mermaid 图表点击放大预览（支持滚轮缩放和拖拽）

### 侧边栏
- 文件树浏览，懒加载子目录
- 大纲面板，点击标题跳转到对应位置

### 其他
- 多主题切换（含深色 / 浅色主题）
- 壁纸背景
- 可配置的自动保存
- 格式化工具栏（加粗、斜体、链接、表格、代码块、颜色、数学公式等）
- Tab 键可配置（制表符 / 2 / 4 / 8 空格）

## 本地运行

```powershell
wails dev
```

未全局安装 `wails` 时：

```powershell
go run github.com/wailsapp/wails/v2/cmd/wails@v2.12.0 dev
```

## 构建

便携版 exe：

```powershell
wails build
```

生成文件：`build\bin\qmmd.exe`，单文件即可运行。

如需 Windows 安装包：

```powershell
wails build -nsis
```

## 测试

```powershell
cd frontend
npx vitest run
```

## 作者

QQ: 2537820086
