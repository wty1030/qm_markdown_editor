# QMMD

Markdown 编辑器，Wails v2 (Go) + Vue 3 + TypeScript 桌面应用。

## 构建 & 运行

```bash
wails build          # 生产构建 → build/bin/qmmd.exe
wails dev            # 开发模式（热重载）
```

## 架构

```
qmmd/
├── main.go           # Wails 启动入口
├── app.go            # Go 后端：文件 I/O、对话框、导出、窗口控制
├── frontend/         # Vue 3 SPA
│   └── src/
│       ├── components/   # UI 组件
│       ├── composables/  # Vue 组合式函数（状态、业务逻辑）
│       ├── utils/        # 工具函数（Markdown 解析器、KaTeX 数学公式）
│       └── styles/       # CSS 变量（主题、壁纸、全局 token）
├── build/            # 构建输出和资源
└── release/          # 发布包
```

Go 后端通过 Wails 绑定暴露为 JS 函数（自动生成在 `frontend/wailsjs/`，已加入 `.gitignore` 不纳入版本管理）。前端通过调用这些函数完成文件读写、对话框、窗口控制等操作。

## 详细文档

- [frontend/src/components/](frontend/src/components/CLAUDE.md) — UI 组件结构
- [frontend/src/composables/](frontend/src/composables/CLAUDE.md) — 业务逻辑层
- [frontend/src/styles/](frontend/src/styles/CLAUDE.md) — 主题和样式系统
- [frontend/src/utils/](frontend/src/utils/CLAUDE.md) — Markdown 渲染和数学公式

## 关键约定

- **构建验证**：改动后必须 `wails build` 通过再提交 git
- **构建即验证**：build 通过即可提交，无需询问用户
- **文件名提取**：用 `path.replace(/.*[/\\]/, '')` 而非 `split('/').pop() || split('\\').pop()`（后者在 Windows 上有逻辑 bug）
- **编辑器高亮层**：textarea 和 highlight div 必须同宽同折行（无滚动条占宽 + `word-break: break-all`）
- **文件树过滤**：只展示白名单内的可编辑文件后缀，过滤掉二进制文件
- **预览区图片/图表点击**：点击图片或 Mermaid 图表打开 Lightbox 全屏预览，支持滚轮缩放和拖拽移动
