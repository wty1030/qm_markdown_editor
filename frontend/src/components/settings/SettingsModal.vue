<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettings, type TabMode, type WallpaperArea } from '../../composables/useSettings'
import { useTheme, type ThemeName } from '../../composables/useTheme'

const { tabMode, setTabMode, tabOptions, wallpaper, setWallpaper, wallpaperAreas, setWallpaperAreas, overlayOpacity, setOverlayOpacity, presetWallpapers, autoSaveEnabled, autoSaveInterval, setAutoSaveEnabled, setAutoSaveInterval } = useSettings()
const { theme, setTheme, themeOptions } = useTheme()

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

const handlePresetWallpaperSelect = (preset: typeof presetWallpapers[0]) => {
  setWallpaper(preset.full)
}

const handleCustomWallpaperUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 检查文件大小（限制 2MB）
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    setWallpaper(`url(${result})`)
  }
  reader.readAsDataURL(file)
}

const handleClearWallpaper = () => {
  setWallpaper('')
}

const handleAreaToggle = (area: keyof WallpaperArea) => {
  setWallpaperAreas({
    ...wallpaperAreas.value,
    [area]: !wallpaperAreas.value[area]
  })
}

const handleIntervalChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = parseInt(input.value, 10)
  if (isNaN(value) || value < 1) value = 1
  if (value > 60) value = 60
  input.value = String(value)
  setAutoSaveInterval(value)
}

const handleOpacityChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  setOpacity(Number(input.value))
}

const setOpacity = (value: number) => {
  setOverlayOpacity(value)
}

const isPresetSelected = (preset: typeof presetWallpapers[0]) => {
  return wallpaper.value === preset.full
}

const isCustomWallpaper = computed(() => {
  return wallpaper.value && wallpaper.value.startsWith('url(')
})
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
          <!-- 壁纸设置 -->
          <div class="settings-section">
            <h4 class="section-title">壁纸</h4>

            <!-- 预设壁纸 -->
            <div class="wallpaper-grid">
              <button
                v-for="preset in presetWallpapers"
                :key="preset.id"
                class="wallpaper-option"
                :class="{ active: isPresetSelected(preset) }"
                @click="handlePresetWallpaperSelect(preset)"
              >
                <div
                  class="wallpaper-preview"
                  :style="preset.thumbnail ? { background: preset.thumbnail } : { backgroundColor: 'var(--bg-secondary)' }"
                >
                  <svg v-if="!preset.thumbnail" class="no-wallpaper-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <span class="wallpaper-name">{{ preset.name }}</span>
              </button>

              <!-- 自定义上传 -->
              <label class="wallpaper-option custom-upload">
                <div class="wallpaper-preview upload-preview" :style="isCustomWallpaper ? { backgroundImage: wallpaper } : {}">
                  <svg v-if="!isCustomWallpaper" class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <span class="wallpaper-name">{{ isCustomWallpaper ? '已上传' : '自定义' }}</span>
                <input type="file" accept="image/*" @change="handleCustomWallpaperUpload" hidden />
              </label>
            </div>

            <!-- 清除按钮 -->
            <button v-if="wallpaper" class="clear-wallpaper-btn" @click="handleClearWallpaper">
              清除壁纸
            </button>

            <!-- 蒙层透明度 -->
            <div class="opacity-control">
              <label class="opacity-label">蒙层透明度</label>
              <div class="opacity-slider-wrapper">
                <input
                  type="range"
                  min="50"
                  max="95"
                  :value="overlayOpacity"
                  @input="handleOpacityChange"
                  class="opacity-slider"
                />
                <span class="opacity-value">{{ overlayOpacity }}%</span>
              </div>
            </div>

            <!-- 应用区域 -->
            <div class="area-control">
              <label class="area-label">应用区域</label>
              <div class="area-toggles">
                <button
                  class="area-toggle"
                  :class="{ active: wallpaperAreas.editor }"
                  @click="handleAreaToggle('editor')"
                >
                  编辑器
                </button>
                <button
                  class="area-toggle"
                  :class="{ active: wallpaperAreas.preview }"
                  @click="handleAreaToggle('preview')"
                >
                  预览区
                </button>
                <button
                  class="area-toggle"
                  :class="{ active: wallpaperAreas.toolbar }"
                  @click="handleAreaToggle('toolbar')"
                >
                  顶部栏
                </button>
                <button
                  class="area-toggle"
                  :class="{ active: wallpaperAreas.formatBar }"
                  @click="handleAreaToggle('formatBar')"
                >
                  格式栏
                </button>
                <button
                  class="area-toggle"
                  :class="{ active: wallpaperAreas.sidebar }"
                  @click="handleAreaToggle('sidebar')"
                >
                  侧边栏
                </button>
              </div>
            </div>
          </div>

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

          <!-- 自动保存 -->
          <div class="settings-section">
            <h4 class="section-title">自动保存</h4>
            <div class="autosave-row">
              <button
                class="area-toggle"
                :class="{ active: autoSaveEnabled }"
                @click="setAutoSaveEnabled(!autoSaveEnabled)"
              >
                {{ autoSaveEnabled ? '已开启' : '已关闭' }}
              </button>
              <div class="autosave-input-group">
                <span class="autosave-input-label">间隔</span>
                <input
                  type="number"
                  class="autosave-input"
                  :disabled="!autoSaveEnabled"
                  :value="autoSaveInterval"
                  min="1"
                  max="60"
                  @change="handleIntervalChange"
                />
                <span class="autosave-input-label">秒</span>
              </div>
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

          <!-- 关于信息 -->
          <div class="settings-section about-section">
            <div class="about-content">
              <div class="app-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div class="app-info">
                <span class="app-name">QMMD</span>
                <span class="app-version">v1.2.0</span>
              </div>
            </div>
            <p class="about-desc">轻量级 Markdown 编辑器</p>
            <p class="about-author">作者: Sisyphus</p>
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
  background-color: var(--dropdown-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-toolbar);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  min-width: 520px;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px var(--dropdown-shadow);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background-color: var(--bg-toolbar);
  z-index: 1;
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
  margin-bottom: 1.75rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 0.875rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 壁纸网格 */
.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.wallpaper-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 0;
}

.wallpaper-option:hover {
  border-color: var(--accent-color);
}

.wallpaper-option.active {
  border-color: var(--accent-color);
  background-color: var(--accent-color);
}

.wallpaper-option.active .wallpaper-name {
  color: var(--btn-active-text);
}

.wallpaper-preview {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 4px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.upload-preview {
  background-color: var(--bg-primary);
}

.upload-icon,
.no-wallpaper-icon {
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
}

.wallpaper-name {
  font-size: 0.6875rem;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.custom-upload {
  cursor: pointer;
}

/* 清除壁纸按钮 */
.clear-wallpaper-btn {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 1rem;
}

.clear-wallpaper-btn:hover {
  border-color: var(--error-color);
  color: var(--error-color);
}

/* 蒙层透明度 */
.opacity-control {
  margin-bottom: 1rem;
}

.opacity-label,
.area-label {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.opacity-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.opacity-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-secondary);
  border-radius: 3px;
  outline: none;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.opacity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.opacity-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.opacity-value {
  min-width: 40px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-align: right;
}

/* 应用区域 */
.area-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.area-toggle {
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.area-toggle:hover {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.area-toggle.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: var(--btn-active-text);
}

/* 自动保存 */
.autosave-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.autosave-input-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.autosave-input-label {
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.autosave-input {
  width: 52px;
  padding: 0.25rem 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.8125rem;
  text-align: center;
  outline: none;
  transition: border-color 0.15s ease;
}

.autosave-input:focus {
  border-color: var(--accent-color);
}

.autosave-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.area-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Tab 选项 */
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

/* 主题网格 */
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

/* 关于信息 */
.about-section {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.about-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.app-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 8px;
}

.app-logo svg {
  width: 24px;
  height: 24px;
  color: var(--btn-active-text);
}

.app-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
}

.app-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.app-version {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.about-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.about-author {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
}

/* 响应式 */
@media (max-width: 600px) {
  .modal-content {
    min-width: 90vw;
    max-width: 95vw;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>