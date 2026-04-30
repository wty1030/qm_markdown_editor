<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from './components/toolbar/Toolbar.vue'
import FormatBar from './components/toolbar/FormatBar.vue'
import SplitPaneLayout from './components/layout/SplitPaneLayout.vue'
import Editor from './components/editor/Editor.vue'
import Preview from './components/preview/Preview.vue'
import { useScrollSync } from './composables/useScrollSync'

const markdownContent = ref('# 欢迎使用 QMMD 编辑器\n\n开始编写你的 Markdown 文档...\n\n## 功能特性\n\n- 实时预览\n- 同步滚动\n- 多种格式支持\n\n```javascript\nconsole.log("Hello, QMMD!")\n```\n\n### 代码高亮\n\n支持多种语言的代码高亮显示。\n\n> 引用块示例\n\n| 功能 | 状态 |\n|------|------|\n| 编辑 | ✅ |\n| 预览 | ✅ |\n| 同步滚动 | ✅ |')

const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const previewRef = ref<InstanceType<typeof Preview> | null>(null)

const { handleEditorScroll, handlePreviewScroll } = useScrollSync()

const handleEditorScrollEvent = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
  if (previewRef.value?.previewRef) {
    handleEditorScroll(scrollTop, scrollHeight, clientHeight, previewRef.value.previewRef)
  }
}

const handlePreviewScrollEvent = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
  if (editorRef.value?.textareaRef) {
    handlePreviewScroll(scrollTop, scrollHeight, clientHeight, editorRef.value.textareaRef)
  }
}

const handleNewFile = () => {
  markdownContent.value = ''
}

const handleOpenFile = () => {
  // TODO: Implement file open dialog via Wails
}

const handleSave = () => {
  // TODO: Implement file save via Wails
}

const handleSaveAs = () => {
  // TODO: Implement save as dialog via Wails
}

const handleFormat = (type: string) => {
  // TODO: Implement format actions
}
</script>

<template>
  <div class="app-container">
    <Toolbar
      @new-file="handleNewFile"
      @open-file="handleOpenFile"
      @save="handleSave"
      @save-as="handleSaveAs"
    />
    <FormatBar @format="handleFormat" />
    <main class="main-content">
      <SplitPaneLayout>
        <template #left>
          <Editor
            ref="editorRef"
            :content="markdownContent"
            @update="markdownContent = $event"
            @scroll="handleEditorScrollEvent"
          />
        </template>
        <template #right>
          <Preview
            ref="previewRef"
            :content="markdownContent"
            @scroll="handlePreviewScrollEvent"
          />
        </template>
      </SplitPaneLayout>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  overflow: hidden;
}
</style>