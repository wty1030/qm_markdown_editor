# QMMD - Markdown 编辑器

一个现代化的 Markdown 编辑器，基于 Wails + Vue 3 构建，支持多主题、壁纸自定义和实时预览。

## 功能特性

### 编辑器
- **Tab 键支持**：可配置 Tab 缩进方式（制表符 / 2空格 / 4空格 / 8空格）
- **实时预览**：支持编辑、预览、分栏三种视图模式
- **语法高亮**：代码块支持多种语言高亮显示
- **快捷工具栏**：常用格式化操作一键完成

### 主题系统
内置 10 种 VS Code 风格主题：
- VS Code Dark (默认)
- VS Code Light
- One Dark
- One Light
- Monokai
- Dracula
- GitHub Dark
- Solarized Dark
- Nord
- Gruvbox Dark

### 壁纸功能
- 预设渐变壁纸（蓝色、日落、海洋、森林、夜空、极光）
- 支持自定义图片上传（限 2MB）
- 可调节蒙层透明度（50%-95%）
- 区域独立控制：编辑器、预览区、顶部栏、格式栏、侧边栏

### 文件管理
- 文件树浏览
- 目录切换
- 新建/保存文件

## 技术栈

- **后端**：Go + Wails v2
- **前端**：Vue 3 + Vite + TypeScript
- **样式**：CSS 自定义属性（主题变量）
- **状态管理**：Vue Composition API + localStorage 持久化

## 开发

### 环境要求
- Go 1.18+
- Node.js 16+
- Wails v2

### 运行开发模式
```bash
wails dev
```

### 构建生产版本
```bash
wails build
```

生成的可执行文件位于 `build/bin/qmmd.exe`。

## 项目结构

```
qmmd/
├── build/                 # 构建配置和输出
│   ├── bin/               # 生成的可执行文件
│   └── windows/           # Windows 构建资源（图标等）
├── frontend/              # Vue 前端
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── composables/   # Vue 组合式函数
│   │   ├── styles/        # CSS 样式和主题变量
│   │   └── assets/        # 静态资源
│   └── dist/              # 前端构建输出
├── main.go                # Wails 入口
├── app.go                 # 应用逻辑
└── wails.json             # Wails 配置
```

## 配置

编辑 `wails.json` 可修改应用名称、作者信息等。

用户设置（主题、Tab 模式、壁纸等）自动保存到 localStorage。

## 作者

Sisyphus (2537820086@qq.com)

## 许可证

MIT License