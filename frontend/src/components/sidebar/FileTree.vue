<script setup lang="ts">
import { ref, computed } from 'vue'
import { ListDirectory } from '../../../wailsjs/go/main/App'

interface FileInfo {
  name: string
  path: string
  isDir: boolean
  modTime: string
}

interface Props {
  files: FileInfo[]
  currentPath: string
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})

const emit = defineEmits<{
  selectFile: [path: string]
}>()

const expandedPaths = ref<Set<string>>(new Set())
const childrenMap = ref<Map<string, FileInfo[]>>(new Map())
const loadingPaths = ref<Set<string>>(new Set())

const EDITABLE_EXTENSIONS = new Set(['md', 'markdown'])

const sortedFiles = computed(() => {
  return [...props.files]
    .filter(f => f.isDir || EDITABLE_EXTENSIONS.has(f.name.split('.').pop()?.toLowerCase() || ''))
    .sort((a, b) => {
      if (a.isDir && !b.isDir) return -1
      if (!a.isDir && b.isDir) return 1
      return a.name.localeCompare(b.name)
    })
})

const toggleExpand = async (file: FileInfo) => {
  if (expandedPaths.value.has(file.path)) {
    expandedPaths.value.delete(file.path)
  } else {
    if (!childrenMap.value.has(file.path)) {
      loadingPaths.value.add(file.path)
      try {
        const children = await ListDirectory(file.path) as FileInfo[]
        childrenMap.value.set(file.path, children)
      } catch {
        // failed to load
      }
      loadingPaths.value.delete(file.path)
    }
    expandedPaths.value.add(file.path)
  }
}

const handleClick = (file: FileInfo) => {
  if (file.isDir) {
    toggleExpand(file)
  } else {
    emit('selectFile', file.path)
  }
}

const getChildren = (path: string): FileInfo[] => {
  return childrenMap.value.get(path) || []
}

const isActive = (file: FileInfo): boolean => {
  return file.path === props.currentPath
}

const getFileIcon = (file: FileInfo): string => {
  if (file.isDir) return '📁'
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
</script>

<template>
  <div class="file-tree">
    <div
      v-for="file in sortedFiles"
      :key="file.path"
      class="file-item-group"
    >
      <div
        class="file-item"
        :class="{ active: isActive(file), directory: file.isDir }"
        :style="{ paddingLeft: (depth * 16 + 8) + 'px' }"
        @click="handleClick(file)"
      >
        <span v-if="file.isDir" class="dir-arrow">
          {{ expandedPaths.has(file.path) ? '▼' : '▶' }}
        </span>
        <span class="file-icon">{{ getFileIcon(file) }}</span>
        <span class="file-name">{{ file.name }}</span>
        <span v-if="loadingPaths.has(file.path)" class="loading-hint">···</span>
      </div>
      <div v-if="file.isDir && expandedPaths.has(file.path)">
        <FileTree
          :files="getChildren(file.path)"
          :current-path="currentPath"
          :depth="depth + 1"
          @select-file="emit('selectFile', $event)"
        />
      </div>
    </div>
    <div v-if="files.length === 0" class="empty-message">
      空文件夹
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  font-size: 13px;
}

.file-item-group {
  /* no extra spacing */
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
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

.dir-arrow {
  width: 12px;
  font-size: 9px;
  flex-shrink: 0;
  text-align: center;
  color: var(--text-secondary);
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

.loading-hint {
  color: var(--text-secondary);
  font-size: 10px;
  flex-shrink: 0;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
