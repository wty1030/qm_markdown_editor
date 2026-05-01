<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Toolbar from './components/toolbar/Toolbar.vue'
import FormatBar from './components/toolbar/FormatBar.vue'
import SplitPaneLayout from './components/layout/SplitPaneLayout.vue'
import Editor from './components/editor/Editor.vue'
import Preview from './components/preview/Preview.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import SettingsModal from './components/settings/SettingsModal.vue'
import { useScrollSync } from './composables/useScrollSync'
import { useFileOperations, type ExportFormat } from './composables/useFileOperations'
import { useFormat, type FormatType, type LinkData, type ImageData, type CodeBlockData, type ColorData, type TableData } from './composables/useFormat'
import { useUndoRedo } from './composables/useUndoRedo'
import { useSettings, type ViewMode } from './composables/useSettings'

const markdownContent = ref('')
const showSidebar = ref(false)
const showSettings = ref(false)

const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const previewRef = ref<InstanceType<typeof Preview> | null>(null)

const textareaRef = computed(() => editorRef.value?.textareaRef || null)

const {
  currentFile,
  isModified,
  fileTree,
  currentDirectory,
  openNewWindow,
  openFile,
  openFileByPath,
  saveFile,
  saveFileAs,
  openDirectory,
  markModified
} = useFileOperations()

const { handleEditorScroll, handlePreviewScroll } = useScrollSync()
const { format, insertLink, insertImage, insertCodeBlock, insertColor, insertTable } = useFormat(textareaRef)
const { canUndo, canRedo, pushHistory, pushHistoryImmediate, undo, redo, reset } = useUndoRedo(markdownContent)
const { viewMode, hasWallpaper } = useSettings()

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

const handleNewWindow = async () => {
  await openNewWindow()
}

const handleOpenFile = async () => {
  const result = await openFile()
  if (result.success && result.content !== undefined) {
    markdownContent.value = result.content
    reset(result.content)
  }
}

const handleSave = async () => {
  await saveFile(markdownContent.value)
}

const handleExportAs = async (format: ExportFormat) => {
  await saveFileAs(markdownContent.value, format)
}

const handleOpenFolder = async () => {
  const result = await openDirectory()
  if (result.success) {
    showSidebar.value = true
  }
}

const handleSelectFile = async (path: string) => {
  const result = await openFileByPath(path)
  if (result.success && result.content !== undefined) {
    markdownContent.value = result.content
    reset(result.content)
  }
}

const handleFormat = (type: FormatType) => {
  const newText = format(type, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
    pushHistoryImmediate(newText)
  }
}

const handleInsertLink = (data: LinkData) => {
  const newText = insertLink(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
    pushHistoryImmediate(newText)
  }
}

const handleInsertImage = (data: ImageData) => {
  const newText = insertImage(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
    pushHistoryImmediate(newText)
  }
}

const handleInsertCodeBlock = (data: CodeBlockData) => {
  const newText = insertCodeBlock(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
    pushHistoryImmediate(newText)
  }
}

const handleInsertColor = (data: ColorData) => {
  const newText = insertColor(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
    pushHistoryImmediate(newText)
  }
}

const handleInsertTable = (data: TableData) => {
  const newText = insertTable(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
    pushHistoryImmediate(newText)
  }
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault()
        handleNewWindow()
        break
      case 'o':
        e.preventDefault()
        if (e.shiftKey) {
          handleOpenFolder()
        } else {
          handleOpenFile()
        }
        break
      case 's':
        e.preventDefault()
        if (e.shiftKey) {
          handleExportAs('md')
        } else {
          handleSave()
        }
        break
      case 'z':
        e.preventDefault()
        if (e.shiftKey) {
          // Ctrl+Shift+Z = Redo
          const next = redo()
          if (next !== null) markdownContent.value = next
        } else {
          // Ctrl+Z = Undo
          const prev = undo()
          if (prev !== null) markdownContent.value = prev
        }
        break
      case 'y':
        e.preventDefault()
        // Ctrl+Y = Redo
        const next = redo()
        if (next !== null) markdownContent.value = next
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Track modifications and history
watch(markdownContent, (newContent) => {
  markModified()
  pushHistory(newContent)
})
</script>

<template>
  <!-- 壁纸背景层 - 放在最外层 -->
  <div v-if="hasWallpaper" class="wallpaper-bg"></div>
  <div v-if="hasWallpaper" class="wallpaper-overlay"></div>

  <div class="app-container">
    <Toolbar
      @new-window="handleNewWindow"
      @open-file="handleOpenFile"
      @open-folder="handleOpenFolder"
      @save="handleSave"
      @export-as="handleExportAs"
      @open-settings="showSettings = true"
    />
    <FormatBar
      @format="handleFormat"
      @insert-link="handleInsertLink"
      @insert-image="handleInsertImage"
      @insert-code-block="handleInsertCodeBlock"
      @insert-color="handleInsertColor"
      @insert-table="handleInsertTable"
    />
    <main class="main-content">
      <div class="content-wrapper">
        <Sidebar
          v-if="showSidebar"
          :files="fileTree"
          :current-directory="currentDirectory"
          :current-file="currentFile"
          @select-file="handleSelectFile"
          @close="showSidebar = false"
        />

        <!-- 编辑模式 -->
        <template v-if="viewMode === 'editor'">
          <Editor
            ref="editorRef"
            :content="markdownContent"
            @update="markdownContent = $event"
            @scroll="handleEditorScrollEvent"
            class="full-pane"
          />
        </template>

        <!-- 预览模式 -->
        <template v-else-if="viewMode === 'preview'">
          <Preview
            ref="previewRef"
            :content="markdownContent"
            @scroll="handlePreviewScrollEvent"
            class="full-pane"
          />
        </template>

        <!-- 分栏模式 -->
        <template v-else>
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
        </template>
      </div>
    </main>

    <SettingsModal
      :visible="showSettings"
      @close="showSettings = false"
    />
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
  background-color: var(--bg-primary);
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: transparent;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  overflow: hidden;
  background-color: transparent;
}

.content-wrapper {
  display: flex;
  height: 100%;
  background-color: transparent;
}

.full-pane {
  flex: 1;
  width: 100%;
  height: 100%;
}

/* 壁纸背景层 */
.wallpaper-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--wallpaper-bg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  pointer-events: none;
}

.wallpaper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-primary);
  opacity: var(--wallpaper-overlay-opacity);
  z-index: 1;
  pointer-events: none;
}
</style>