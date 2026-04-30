<script setup lang="ts">
import { ref, computed } from 'vue'
import FileTree from './FileTree.vue'

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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectFile: [path: string]
  selectDirectory: [path: string]
  close: []
}>()

const isCollapsed = ref(false)

const directoryName = computed(() => {
  if (!props.currentDirectory) return ''
  return props.currentDirectory.split('/').pop() || props.currentDirectory.split('\\').pop() || props.currentDirectory
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
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

    <div v-if="!isCollapsed" class="sidebar-content">
      <FileTree
        :files="files"
        :current-path="currentFile"
        @select-file="emit('selectFile', $event)"
        @select-directory="emit('selectDirectory', $event)"
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

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}
</style>