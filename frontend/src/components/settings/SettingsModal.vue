<script setup lang="ts">
import { useSettings, type TabMode, type ViewMode } from '../../composables/useSettings'
import { useTheme, type ThemeName } from '../../composables/useTheme'

const { tabMode, setTabMode, tabOptions } = useSettings()
const { theme, setTheme, themeOptions, currentThemeOption } = useTheme()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const handleTabSelect = (mode: TabMode) => {
  setTabMode(mode)
}

const handleThemeSelect = (themeName: ThemeName) => {
  setTheme(themeName)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">设置</h3>
          <button class="modal-close" @click="emit('close')" aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Tab 缩进设置 -->
          <div class="settings-section">
            <h4 class="section-title">Tab 缩进</h4>
            <div class="tab-options">
              <button
                v-for="option in tabOptions"
                :key="option.value"
                class="tab-option"
                :class="{ active: tabMode === option.value }"
                @click="handleTabSelect(option.value)"
              >
                <span class="option-label">{{ option.label }}</span>
                <span class="option-desc">{{ option.description }}</span>
              </button>
            </div>
          </div>

          <!-- 主题设置 -->
          <div class="settings-section">
            <h4 class="section-title">主题</h4>
            <div class="theme-grid">
              <button
                v-for="option in themeOptions"
                :key="option.name"
                class="theme-option"
                :class="{ active: theme === option.name }"
                @click="handleThemeSelect(option.name)"
              >
                <span class="theme-icon">{{ option.icon }}</span>
                <span class="theme-name">{{ option.label }}</span>
                <svg v-if="theme === option.name" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-toolbar);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.modal-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 1.25rem;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tab-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.tab-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.tab-option:hover {
  border-color: var(--accent-color);
}

.tab-option.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.tab-option.active .option-label,
.tab-option.active .option-desc {
  color: var(--btn-active-text);
}

.option-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.option-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.theme-option:hover {
  border-color: var(--accent-color);
}

.theme-option.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.theme-option.active .theme-icon,
.theme-option.active .theme-name {
  color: var(--btn-active-text);
}

.theme-icon {
  font-size: 1rem;
  line-height: 1;
}

.theme-name {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.check-icon {
  width: 14px;
  height: 14px;
  color: var(--btn-active-text);
}
</style>
