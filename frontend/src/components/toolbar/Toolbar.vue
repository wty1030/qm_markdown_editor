<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettings, type ViewMode } from '../../composables/useSettings'
import type { ExportFormat } from '../../composables/useFileOperations'

interface Props {
  isModified?: boolean
  currentFile?: string
  autoSaveActive?: boolean
  autoSaveRemaining?: number
  autoSaveInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  isModified: false,
  currentFile: '',
  autoSaveActive: false,
  autoSaveRemaining: 0,
  autoSaveInterval: 30
})

const emit = defineEmits<{
  newWindow: []
  openFile: []
  openFolder: []
  save: []
  exportAs: [format: ExportFormat]
  viewModeChange: [mode: ViewMode]
  openSettings: []
}>()

const { viewMode, setViewMode, viewModeOptions, currentViewModeOption } = useSettings()

const fileName = computed(() => {
  if (!props.currentFile) return '未命名'
  return props.currentFile.split('/').pop() || props.currentFile.split('\\').pop() || props.currentFile
})

const timerProgress = computed(() => {
  if (!props.autoSaveActive || props.autoSaveInterval <= 0) return 0
  return props.autoSaveRemaining / props.autoSaveInterval
})

const handleViewModeChange = (mode: ViewMode) => {
  setViewMode(mode)
  emit('viewModeChange', mode)
}
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <button
        class="toolbar-btn"
        title="新建窗口 (Ctrl+N)"
        @click="emit('newWindow')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <span class="btn-text">新建</span>
      </button>

      <button
        class="toolbar-btn"
        title="打开文件 (Ctrl+O)"
        @click="emit('openFile')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="btn-text">打开</span>
      </button>

      <button
        class="toolbar-btn"
        title="打开文件夹 (Ctrl+Shift+O)"
        @click="emit('openFolder')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
        <span class="btn-text">文件夹</span>
      </button>

      <button
        class="toolbar-btn"
        title="保存 (Ctrl+S)"
        @click="emit('save')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17,21 17,13 7,13 7,21"/>
          <polyline points="7,3 7,8 15,8"/>
        </svg>
        <span class="btn-text">保存</span>
      </button>
    </div>

    <div class="toolbar-center">
      <span class="file-status-dot" :class="props.isModified ? 'unsaved' : 'saved'" />
      <span class="file-name">{{ fileName }}</span>

      <div v-if="props.autoSaveActive" class="autosave-bar">
        <div class="autosave-track">
          <div class="autosave-fill" :style="{ width: timerProgress * 100 + '%' }" />
        </div>
        <span class="autosave-label">{{ props.autoSaveRemaining }}s</span>
      </div>
    </div>

    <div class="toolbar-center view-mode-center">
      <div class="view-mode-group">
        <button
          v-for="option in viewModeOptions"
          :key="option.value"
          class="view-mode-btn"
          :class="{ active: viewMode === option.value }"
          :title="option.label"
          @click="handleViewModeChange(option.value)"
        >
          <!-- 编辑图标 -->
          <svg v-if="option.icon === 'edit'" class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <!-- 预览图标 -->
          <svg v-else-if="option.icon === 'preview'" class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <!-- 分栏图标 -->
          <svg v-else-if="option.icon === 'split'" class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="12" y1="3" x2="12" y2="21"/>
          </svg>
          <span class="mode-label">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <div class="toolbar-right">
      <button
        class="toolbar-btn settings-btn"
        title="设置"
        @click="emit('openSettings')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span class="btn-text">设置</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--bg-toolbar);
  border-bottom: 1px solid var(--border-color);
  min-height: 48px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
}

.view-mode-center {
  flex: 1;
  justify-content: center;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.toolbar-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
}

.toolbar-btn:active {
  background-color: var(--accent-color);
  color: var(--btn-active-text);
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
}

/* View Mode Group Button */
.view-mode-group {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.25rem;
}

.view-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-mode-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.view-mode-btn.active {
  background-color: var(--accent-color);
  color: var(--btn-active-text);
}

.mode-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.mode-label {
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 600px) {
  .btn-text {
    display: none;
  }

  .toolbar-btn {
    padding: 0.5rem;
  }

  .mode-label {
    display: none;
  }

  .view-mode-btn {
    padding: 0.5rem;
  }

  .file-name {
    display: none;
  }
}

.file-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

.file-status-dot.saved {
  background-color: var(--success-color);
}

.file-status-dot.unsaved {
  background-color: var(--warning-color);
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Auto-save progress bar */
.autosave-bar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid var(--border-color);
}

.autosave-track {
  width: 48px;
  height: 3px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.autosave-fill {
  height: 100%;
  background-color: var(--accent-color);
  border-radius: 2px;
  transition: width 0.9s linear;
}

.autosave-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--btn-active-text);
  background-color: var(--accent-color);
  padding: 0.0625rem 0.375rem;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  white-space: nowrap;
}
</style>