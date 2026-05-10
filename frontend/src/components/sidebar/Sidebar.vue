<script setup lang="ts">
import { ref, computed } from 'vue'
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
  selectDirectory: [path: string]
  close: []
  scrollToLine: [lineNumber: number]
}>()

const isCollapsed = ref(false)
const activeTab = ref<'files' | 'outline'>('files')

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
</script>

<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <span v-if="!isCollapsed" class="directory-name">{{ directoryName || '文件浏览器' }}</span>
      <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开' : '折叠'">
        {{ isCollapsed ? '▶' : '◀' }}
      </button>
    </div>

    <!-- Tab 切换 -->
    <div v-if="!isCollapsed" class="sidebar-tabs">
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

    <div v-if="!isCollapsed" class="sidebar-content">
      <!-- 文件树 -->
      <FileTree
        v-show="activeTab === 'files'"
        :files="files"
        :current-path="currentFile"
        @select-file="emit('selectFile', $event)"
        @select-directory="emit('selectDirectory', $event)"
      />

      <!-- 大纲 -->
      <Outline
        v-show="activeTab === 'outline'"
        :content="content"
        @scroll-to-line="handleScrollToLine"
      />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  min-width: 40px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: 40px;
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

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
  background-color: var(--bg-primary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}
</style>