<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme, type ThemeName } from '../../composables/useTheme'
import type { ExportFormat } from '../../composables/useFileOperations'

const emit = defineEmits<{
  newWindow: []
  openFile: []
  openFolder: []
  save: []
  exportAs: [format: ExportFormat]
}>()

const { theme, setTheme, currentThemeOption, themeOptions } = useTheme()
const showThemeDropdown = ref(false)
const showExportDropdown = ref(false)
const themeDropdownRef = ref<HTMLDivElement | null>(null)
const exportDropdownRef = ref<HTMLDivElement | null>(null)

const handleThemeSelect = (themeName: ThemeName) => {
  setTheme(themeName)
  showThemeDropdown.value = false
}

const handleExport = (format: ExportFormat) => {
  emit('exportAs', format)
  showExportDropdown.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (themeDropdownRef.value && !themeDropdownRef.value.contains(event.target as Node)) {
    showThemeDropdown.value = false
  }
  if (exportDropdownRef.value && !exportDropdownRef.value.contains(event.target as Node)) {
    showExportDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <button
        class="toolbar-btn primary"
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
        class="toolbar-btn primary"
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

      <div class="dropdown" ref="exportDropdownRef">
        <button
          class="toolbar-btn"
          :class="{ active: showExportDropdown }"
          title="导出"
          @click.stop="showExportDropdown = !showExportDropdown"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span class="btn-text">导出</span>
          <svg class="chevron" :class="{ open: showExportDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>

        <div v-if="showExportDropdown" class="dropdown-menu">
          <button class="dropdown-item" @click="handleExport('md')">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <span>另存为 Markdown</span>
          </button>
          <button class="dropdown-item" @click="handleExport('html')">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
            <span>导出为 HTML</span>
          </button>
          <button class="dropdown-item" @click="handleExport('pdf')">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span>导出为 PDF</span>
          </button>
        </div>
      </div>
    </div>

    <div class="toolbar-right">
      <div class="theme-selector" ref="themeDropdownRef">
        <button
          class="toolbar-btn theme-toggle"
          :title="`当前主题: ${currentThemeOption.label}`"
          @click.stop="showThemeDropdown = !showThemeDropdown"
        >
          <span class="theme-icon">{{ currentThemeOption.icon }}</span>
          <span class="theme-label">{{ currentThemeOption.label }}</span>
          <svg class="chevron" :class="{ open: showThemeDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>

        <div v-if="showThemeDropdown" class="dropdown-menu theme-menu">
          <button
            v-for="option in themeOptions"
            :key="option.name"
            class="dropdown-item"
            :class="{ active: option.name === theme }"
            @click="handleThemeSelect(option.name)"
          >
            <span class="dropdown-icon-text">{{ option.icon }}</span>
            <span class="dropdown-label">{{ option.label }}</span>
            <svg v-if="option.name === theme" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </button>
        </div>
      </div>
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

.toolbar-btn:active,
.toolbar-btn.active {
  background-color: var(--accent-color);
  color: var(--btn-active-text);
}

.toolbar-btn.primary {
  border-color: var(--accent-color);
}

.toolbar-btn.primary:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-hover);
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
}

.chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.chevron.open {
  transform: rotate(180deg);
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background-color: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--dropdown-shadow);
  padding: 0.25rem;
  z-index: 1000;
  animation: dropdown-enter 0.15s ease;
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s ease;
}

.dropdown-item:hover {
  background-color: var(--dropdown-hover);
}

.dropdown-item.active {
  background-color: var(--dropdown-hover);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dropdown-icon-text {
  font-size: 1rem;
  line-height: 1;
  width: 1.25rem;
  text-align: center;
}

.dropdown-label {
  flex: 1;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: var(--accent-color);
}

.theme-selector {
  position: relative;
}

.theme-toggle {
  padding: 0.375rem 0.5rem;
  min-width: 120px;
}

.theme-icon {
  font-size: 1rem;
  line-height: 1;
}

.theme-label {
  flex: 1;
  text-align: left;
  font-size: 0.8125rem;
}

.theme-menu {
  right: 0;
  left: auto;
  min-width: 200px;
}

/* Responsive: hide button text on narrow screens */
@media (max-width: 600px) {
  .btn-text {
    display: none;
  }

  .toolbar-btn {
    padding: 0.5rem;
  }

  .theme-toggle {
    min-width: auto;
  }

  .theme-label {
    display: none;
  }
}
</style>
