<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import FileTree from './FileTree.vue'
import Outline from '../outline/Outline.vue'

interface FileInfo {
  name: string
  path: string
  isDir: boolean
  modTime: string
}

interface Props {
  files: FileInfo[]
  currentDirectory: string
  currentFile: string
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectFile: [path: string]
  close: []
  scrollToLine: [lineNumber: number]
}>()

const isCollapsed = ref(false)
const activeTab = ref<'files' | 'outline'>(props.currentDirectory ? 'files' : 'outline')
const sidebarWidth = ref(220)
const isResizing = ref(false)
const sidebarRef = ref<HTMLElement | null>(null)

const MIN_WIDTH = 160
const MAX_WIDTH = 500

watch(() => props.currentDirectory, (newDir) => {
  if (newDir) activeTab.value = 'files'
})

const directoryName = computed(() => {
  if (!props.currentDirectory) return ''
  return props.currentDirectory.split('/').pop() || props.currentDirectory.split('\\').pop() || props.currentDirectory
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleScrollToLine = (lineNumber: number) => {
  emit('scrollToLine', lineNumber)
}

const startResize = (e: MouseEvent) => {
  e.preventDefault()
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const doResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
  sidebarWidth.value = newWidth
}

const stopResize = () => {
  if (!isResizing.value) return
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<template>
  <div
    ref="sidebarRef"
    class="sidebar"
    :class="{ collapsed: isCollapsed, resizing: isResizing }"
    :style="{ width: isCollapsed ? '40px' : sidebarWidth + 'px' }"
  >
    <div class="sidebar-header">
      <span v-if="!isCollapsed" class="directory-name">{{ directoryName || '文件浏览器' }}</span>
      <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开' : '折叠'">
        {{ isCollapsed ? '▶' : '◀' }}
      </button>
    </div>

    <!-- Tab 切换 -->
    <div v-if="!isCollapsed" class="sidebar-tabs">
      <div class="tab-track">
        <div class="tab-indicator" :class="activeTab" />
        <button
          :class="['tab-btn', { active: activeTab === 'files' }]"
          @click="activeTab = 'files'"
        >
          文件
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'outline' }]"
          @click="activeTab = 'outline'"
        >
          大纲
        </button>
      </div>
    </div>

    <div v-if="!isCollapsed" class="sidebar-content">
      <FileTree
        v-show="activeTab === 'files'"
        :files="files"
        :current-path="currentFile"
        @select-file="emit('selectFile', $event)"
      />

      <Outline
        v-show="activeTab === 'outline'"
        :content="content"
        @scroll-to-line="handleScrollToLine"
      />
    </div>

    <!-- 拖拽调整宽度的把手 -->
    <div
      v-if="!isCollapsed"
      class="resize-handle"
      @mousedown="startResize"
    />
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  min-width: 40px;
  flex-shrink: 0;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  position: relative;
  transition: width 0.2s ease;
}

.sidebar.resizing {
  transition: none;
}

.sidebar.collapsed {
  transition: width 0.2s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
}

.directory-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 10px;
  transition: background-color 0.15s ease;
}

.collapse-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* Tab 切换 - 胶囊风格 */
.sidebar-tabs {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.tab-track {
  display: flex;
  position: relative;
  background-color: var(--bg-hover);
  border-radius: 6px;
  padding: 2px;
}

.tab-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background-color: var(--bg-primary);
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-indicator.outline {
  transform: translateX(100%);
}

.tab-btn {
  flex: 1;
  padding: 0.35rem 0;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  position: relative;
  z-index: 1;
  border-radius: 5px;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--text-primary);
  font-weight: 600;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

/* 拖拽调整宽度的把手 */
.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle:hover,
.sidebar.resizing .resize-handle {
  background-color: var(--accent-color);
  opacity: 0.4;
}
</style>
