<script setup lang="ts">
import { useTheme } from '../../composables/useTheme'

const emit = defineEmits<{
  newFile: []
  openFile: []
  openFolder: []
  save: []
  saveAs: []
}>()

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <button
        class="toolbar-btn"
        title="新建文件 (Ctrl+N)"
        @click="emit('newFile')"
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
        title="打开文件夹"
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

      <button
        class="toolbar-btn"
        title="另存为 (Ctrl+Shift+S)"
        @click="emit('saveAs')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2z"/>
          <path d="M21 15v4a2 2 0 0 1-2 2h-2"/>
          <path d="M14 3l5 5h-4a1 1 0 0 1-1-1V3z"/>
        </svg>
        <span class="btn-text">另存为</span>
      </button>
    </div>

    <div class="toolbar-right">
      <button
        class="toolbar-btn theme-toggle"
        :title="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
        @click="toggleTheme"
      >
        <svg v-if="theme === 'dark'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
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
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
}

.theme-toggle {
  padding: 0.375rem;
}

/* Responsive: hide button text on narrow screens */
@media (max-width: 600px) {
  .btn-text {
    display: none;
  }

  .toolbar-btn {
    padding: 0.5rem;
  }
}
</style>
