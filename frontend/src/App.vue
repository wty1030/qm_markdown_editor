<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from './components/toolbar/Toolbar.vue'
import FormatBar from './components/toolbar/FormatBar.vue'
import SplitPaneLayout from './components/layout/SplitPaneLayout.vue'

const markdownContent = ref('# 欢迎使用 QMMD 编辑器\n\n开始编写你的 Markdown 文档...\n\n## 功能特性\n\n- 实时预览\n- 同步滚动\n- 多种格式支持\n\n```javascript\nconsole.log("Hello, QMMD!")\n```')

const handleNewFile = () => {
  markdownContent.value = ''
}

const handleOpenFile = () => {
  // TODO: Implement file open dialog via Wails
  console.log('Open file')
}

const handleSave = () => {
  // TODO: Implement file save via Wails
  console.log('Save file')
}

const handleSaveAs = () => {
  // TODO: Implement save as dialog via Wails
  console.log('Save as')
}

const handleFormat = (type: string) => {
  // TODO: Implement format actions
  console.log('Format:', type)
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
          <div class="editor-pane">
            <textarea
              v-model="markdownContent"
              class="markdown-editor"
              placeholder="在此输入 Markdown..."
            />
          </div>
        </template>
        <template #right>
          <div class="preview-pane">
            <div class="markdown-preview" v-html="markdownContent" />
          </div>
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

.editor-pane,
.preview-pane {
  height: 100%;
  overflow: auto;
}

.markdown-editor {
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-preview {
  padding: 1rem;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-preview :is(h1, h2, h3, h4, h5, h6) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.markdown-preview h1 { font-size: 2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
.markdown-preview h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
.markdown-preview h3 { font-size: 1.25em; }
.markdown-preview h4 { font-size: 1em; }

.markdown-preview p {
  margin-bottom: 1rem;
}

.markdown-preview code {
  background-color: var(--bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.markdown-preview pre {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-preview pre code {
  background: none;
  padding: 0;
}

.markdown-preview blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
}

.markdown-preview ul, .markdown-preview ol {
  padding-left: 2rem;
  margin-bottom: 1rem;
}
</style>