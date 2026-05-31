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
import { useFormat, type FormatType, type LinkData, type ImageData, type CodeBlockData, type ColorData, type TableData, type MathData } from './composables/useFormat'
import { useUndoRedo } from './composables/useUndoRedo'
import { useSettings, type ViewMode } from './composables/useSettings'
import { GetStartupFile } from '../wailsjs/go/main/App'

type ToastType = 'success' | 'error'
const TOAST_SUCCESS: ToastType = 'success'
const TOAST_ERROR: ToastType = 'error'

const markdownContent = ref('')
const showSidebar = ref(true)
const showSettings = ref(false)
const toastMessage = ref('')
const toastType = ref<ToastType>(TOAST_SUCCESS)
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

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
  setContentRef,
  getWindowTitle
} = useFileOperations()

setContentRef(markdownContent)

const { handleEditorScroll, handlePreviewScroll } = useScrollSync()
const { format, insertLink, insertImage, insertCodeBlock, insertColor, insertTable, insertMath } = useFormat(textareaRef)
const { canUndo, canRedo, pushHistory, pushHistoryImmediate, undo, redo, reset } = useUndoRedo(markdownContent)
const { viewMode, hasWallpaper, autoSaveEnabled, autoSaveInterval } = useSettings()

// 自动保存计时器
const autoSaveRemaining = ref(0)
let autoSaveTimerId: ReturnType<typeof setInterval> | null = null

const canAutoSave = computed(() => autoSaveEnabled.value && !!currentFile.value)

const resetAutoSaveTimer = () => {
  autoSaveRemaining.value = autoSaveInterval.value
}

const startAutoSaveTimer = () => {
  stopAutoSaveTimer()
  if (!canAutoSave.value) return
  resetAutoSaveTimer()
  autoSaveTimerId = setInterval(() => {
    autoSaveRemaining.value--
    if (autoSaveRemaining.value <= 0) {
      doAutoSave()
      resetAutoSaveTimer()
    }
  }, 1000)
}

const stopAutoSaveTimer = () => {
  if (autoSaveTimerId) {
    clearInterval(autoSaveTimerId)
    autoSaveTimerId = null
  }
}

const doAutoSave = async () => {
  if (!isModified.value || !currentFile.value) return
  const result = await saveFile(markdownContent.value)
  if (result.success) {
    showToast('已自动保存')
  }
}

watch([autoSaveEnabled, autoSaveInterval, currentFile], () => {
  startAutoSaveTimer()
})

watch(isModified, (modified) => {
  if (modified && canAutoSave.value) resetAutoSaveTimer()
})

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
    showSidebar.value = true
  }
}

const showToast = (message: string, type: ToastType = TOAST_SUCCESS) => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

const handleSave = async () => {
  const result = await saveFile(markdownContent.value)
  if (result.success) {
    showToast('保存成功')
    resetAutoSaveTimer()
  } else if (result.error) {
    showToast(result.error, TOAST_ERROR)
  }
}

const handleExportAs = async (format: ExportFormat) => {
  const result = await saveFileAs(markdownContent.value, format)
  if (result.success) {
    const labels: Record<string, string> = { html: 'HTML', md: 'Markdown', pdf: 'PDF' }
    showToast(`${labels[format] || format} 导出成功`)
  } else if (result.error) {
    showToast(result.error, TOAST_ERROR)
  }
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

// 大纲跳转：滚动编辑器到指定行
const handleScrollToLine = (lineNumber: number) => {
  editorRef.value?.scrollToLine(lineNumber)
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

const handleInsertMath = (data: MathData) => {
  const newText = insertMath(data, markdownContent)
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

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  startAutoSaveTimer()

  // 检查启动参数（拖拽文件到 exe）
  const startupFile = await GetStartupFile()
  if (startupFile) {
    const result = await openFileByPath(startupFile)
    if (result.success && result.content !== undefined) {
      markdownContent.value = result.content
      reset(result.content)
    } else if (result.error) {
      showToast(result.error, TOAST_ERROR)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopAutoSaveTimer()
})

// Track history
watch(markdownContent, (newContent) => {
  pushHistory(newContent)
})
</script>

<template>
  <!-- 壁纸背景层 - 放在最外层 -->
  <div v-if="hasWallpaper" class="wallpaper-bg"></div>
  <div v-if="hasWallpaper" class="wallpaper-overlay"></div>

  <div class="app-container">
    <Toolbar
      :is-modified="isModified"
      :current-file="currentFile"
      :auto-save-active="canAutoSave"
      :auto-save-remaining="autoSaveRemaining"
      :auto-save-interval="autoSaveInterval"
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
      @insert-math="handleInsertMath"
    />
    <main class="main-content">
      <div class="content-wrapper">
        <Sidebar
          v-if="showSidebar"
          :files="fileTree"
          :current-directory="currentDirectory"
          :current-file="currentFile"
          :content="markdownContent"
          @select-file="handleSelectFile"
          @scroll-to-line="handleScrollToLine"
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

    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toastVisible" class="toast" :class="`toast-${toastType}`">{{ toastMessage }}</div>
      </Transition>
    </Teleport>
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

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 13px;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-success {
  background-color: var(--success-color);
  color: #fff;
}

.toast-error {
  background-color: var(--error-color);
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>