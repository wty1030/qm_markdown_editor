<script setup lang="ts">
import { ref, computed } from 'vue'

interface FileInfo {
  name: string
  path: string
  isDir: boolean
  modTime: string
}

interface Props {
  files: FileInfo[]
  currentPath: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectFile: [path: string]
  selectDirectory: [path: string]
}>()

const expandedPaths = ref<Set<string>>(new Set())

const sortedFiles = computed(() => {
  return [...props.files].sort((a, b) => {
    // Directories first
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
    // Then alphabetically
    return a.name.localeCompare(b.name)
  })
})

const toggleExpand = (path: string) => {
  if (expandedPaths.value.has(path)) {
    expandedPaths.value.delete(path)
  } else {
    expandedPaths.value.add(path)
  }
}

const handleClick = (file: FileInfo) => {
  if (file.isDir) {
    toggleExpand(file.path)
    emit('selectDirectory', file.path)
  } else {
    emit('selectFile', file.path)
  }
}

const getFileIcon = (file: FileInfo): string => {
  if (file.isDir) {
    return expandedPaths.value.has(file.path) ? '📂' : '📁'
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'md':
    case 'markdown':
      return '📝'
    case 'js':
    case 'ts':
      return '📜'
    case 'json':
      return '📋'
    case 'html':
    case 'css':
      return '🎨'
    default:
      return '📄'
  }
}

const isActive = (file: FileInfo): boolean => {
  return file.path === props.currentPath
}
</script>

<template>
  <div class="file-tree">
    <div
      v-for="file in sortedFiles"
      :key="file.path"
      class="file-item"
      :class="{ active: isActive(file), directory: file.isDir }"
      @click="handleClick(file)"
    >
      <span class="file-icon">{{ getFileIcon(file) }}</span>
      <span class="file-name">{{ file.name }}</span>
    </div>
    <div v-if="files.length === 0" class="empty-message">
      空文件夹
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  padding: 0.5rem;
  font-size: 13px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.file-item:hover {
  background-color: var(--bg-hover);
}

.file-item.active {
  background-color: var(--accent-color);
  color: var(--btn-active-text);
}

.file-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}
</style>