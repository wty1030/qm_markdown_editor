<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import Toolbar from './components/toolbar/Toolbar.vue'
import FormatBar from './components/toolbar/FormatBar.vue'
import SplitPaneLayout from './components/layout/SplitPaneLayout.vue'
import Editor from './components/editor/Editor.vue'
import Preview from './components/preview/Preview.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import { useScrollSync } from './composables/useScrollSync'
import { useFileOperations } from './composables/useFileOperations'
import { useFormat, type FormatType, type LinkData, type ImageData } from './composables/useFormat'

const markdownContent = ref('')
const showSidebar = ref(false)

const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const previewRef = ref<InstanceType<typeof Preview> | null>(null)

const textareaRef = computed(() => editorRef.value?.textareaRef || null)

const {
  currentFile,
  isModified,
  fileTree,
  currentDirectory,
  newFile,
  openFile,
  openFileByPath,
  saveFile,
  saveFileAs,
  openDirectory,
  markModified
} = useFileOperations()

const { handleEditorScroll, handlePreviewScroll } = useScrollSync()
const { format, insertLink, insertImage } = useFormat(textareaRef)

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

const handleNewFile = async () => {
  if (isModified.value) {
    // TODO: Show confirmation dialog
  }
  await newFile()
  markdownContent.value = ''
}

const handleOpenFile = async () => {
  const result = await openFile()
  if (result.success && result.content !== undefined) {
    markdownContent.value = result.content
  }
}

const handleSave = async () => {
  await saveFile(markdownContent.value)
}

const handleSaveAs = async () => {
  await saveFileAs(markdownContent.value)
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
  }
}

const handleFormat = (type: FormatType) => {
  const newText = format(type, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
  }
}

const handleInsertLink = (data: LinkData) => {
  const newText = insertLink(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
  }
}

const handleInsertImage = (data: ImageData) => {
  const newText = insertImage(data, markdownContent)
  if (newText !== undefined) {
    markdownContent.value = newText
  }
}

// Track modifications
watch(markdownContent, () => {
  markModified()
})
</script>

<template>
  <div class="app-container">
    <Toolbar
      @new-file="handleNewFile"
      @open-file="handleOpenFile"
      @open-folder="handleOpenFolder"
      @save="handleSave"
      @save-as="handleSaveAs"
    />
    <FormatBar
      @format="handleFormat"
      @insert-link="handleInsertLink"
      @insert-image="handleInsertImage"
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
      </div>
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

.content-wrapper {
  display: flex;
  height: 100%;
}
</style>