# composables/

Vue 组合式函数，封装业务逻辑和状态管理。App.vue 持有 ref 并注入到各 composable。

## 文件说明

| 文件 | 职责 |
|------|------|
| `useFileOperations.ts` | 文件打开/保存/导出、目录浏览、文件树状态。调用 Wails Go 后端函数 |
| `useFormat.ts` | Markdown 格式化操作（加粗、斜体、链接、代码块、表格、颜色等） |
| `useUndoRedo.ts` | 撤销/重做栈（历史记录管理） |
| `useScrollSync.ts` | 编辑器 ↔ 预览区滚动同步（按比例映射 scrollTop） |
| `useSettings.ts` | 用户设置（主题、视图模式、Tab 配置、壁纸），持久化到 localStorage |
| `useTheme.ts` | 主题应用（设置 data-theme 属性，CSS 变量自动切换） |
| `useLayoutState.ts` | 布局状态（侧边栏可见性等） |

## 数据流

```
App.vue (markdownContent ref)
  → setContentRef() 注入到 useFileOperations
  → 传递给 useUndoRedo 做历史记录
  → 传递给 Editor/Preview 组件渲染
```

`useFileOperations` 是核心 composable，管理 `currentFile`、`fileTree`、`currentDirectory` 三个关键响应式状态。

## 外部依赖

- 文件操作通过 `frontend/wailsjs/go/main/App.js`（Wails 自动生成）调用 Go 后端
- Markdown 渲染用 `marked` 库
- 无 Vuex/Pinia，状态全靠 composable + props/events
