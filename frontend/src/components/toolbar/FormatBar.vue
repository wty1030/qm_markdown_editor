<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../common/Modal.vue'
import { colorPresets, type FormatType, type LinkData, type ImageData, type CodeBlockData, type ColorData, type TableData } from '../../composables/useFormat'

export type { FormatType, LinkData, ImageData, CodeBlockData, ColorData, TableData }

const emit = defineEmits<{
  format: [type: FormatType]
  insertLink: [data: LinkData]
  insertImage: [data: ImageData]
  insertCodeBlock: [data: CodeBlockData]
  insertColor: [data: ColorData]
  insertTable: [data: TableData]
}>()

const showHeadingMenu = ref(false)
const showCodeMenu = ref(false)
const showColorMenu = ref(false)
const showLinkModal = ref(false)
const showImageModal = ref(false)
const showTableModal = ref(false)
const tableRows = ref(3)
const tableCols = ref(3)

const handleFormat = (type: FormatType) => {
  emit('format', type)
  showHeadingMenu.value = false
  showCodeMenu.value = false
  showColorMenu.value = false
}

const toggleHeadingMenu = () => {
  showHeadingMenu.value = !showHeadingMenu.value
  showCodeMenu.value = false
  showColorMenu.value = false
}

const toggleCodeMenu = () => {
  showCodeMenu.value = !showCodeMenu.value
  showHeadingMenu.value = false
  showColorMenu.value = false
}

const toggleColorMenu = () => {
  showColorMenu.value = !showColorMenu.value
  showHeadingMenu.value = false
  showCodeMenu.value = false
}

const closeMenu = () => {
  showHeadingMenu.value = false
  showCodeMenu.value = false
  showColorMenu.value = false
}

const handleCodeSelect = (language: string) => {
  emit('insertCodeBlock', { language })
  showCodeMenu.value = false
}

const handleColorSelect = (color: string) => {
  emit('insertColor', { color })
  showColorMenu.value = false
}

const openLinkModal = () => {
  showLinkModal.value = true
}

const openImageModal = () => {
  showImageModal.value = true
}

const handleLinkConfirm = (values: Record<string, string>) => {
  emit('insertLink', { text: values.text, url: values.url })
}

const handleImageConfirm = (values: Record<string, string>) => {
  emit('insertImage', { alt: values.alt, url: values.url })
}

const openTableModal = () => {
  tableRows.value = 3
  tableCols.value = 3
  showTableModal.value = true
}

const handleTableConfirm = () => {
  emit('insertTable', { rows: tableRows.value, cols: tableCols.value })
  showTableModal.value = false
}

// 常用编程语言列表
const codeLanguages = [
  { key: '', label: '自动识别' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'typescript', label: 'TypeScript' },
  { key: 'python', label: 'Python' },
  { key: 'java', label: 'Java' },
  { key: 'c', label: 'C' },
  { key: 'cpp', label: 'C++' },
  { key: 'csharp', label: 'C#' },
  { key: 'go', label: 'Go' },
  { key: 'rust', label: 'Rust' },
  { key: 'php', label: 'PHP' },
  { key: 'ruby', label: 'Ruby' },
  { key: 'swift', label: 'Swift' },
  { key: 'kotlin', label: 'Kotlin' },
  { key: 'sql', label: 'SQL' },
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'json', label: 'JSON' },
  { key: 'yaml', label: 'YAML' },
  { key: 'markdown', label: 'Markdown' },
  { key: 'bash', label: 'Bash' },
  { key: 'shell', label: 'Shell' },
]
</script>

<template>
  <div class="format-bar" @mouseleave="closeMenu">
    <button
      class="format-btn"
      title="加粗 (Ctrl+B)"
      @click="handleFormat('bold')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
      </svg>
      <span class="btn-label">加粗</span>
    </button>

    <button
      class="format-btn"
      title="斜体 (Ctrl+I)"
      @click="handleFormat('italic')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="19" y1="4" x2="10" y2="4"/>
        <line x1="14" y1="20" x2="5" y2="20"/>
        <line x1="15" y1="4" x2="9" y2="20"/>
      </svg>
      <span class="btn-label">斜体</span>
    </button>

    <div class="dropdown color-dropdown">
      <button
        class="format-btn"
        :class="{ active: showColorMenu }"
        title="文字颜色"
        @click="toggleColorMenu"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
          <path d="M12 2v10l8.5 5"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
        <span class="btn-label">颜色</span>
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      <div v-if="showColorMenu" class="dropdown-menu color-menu">
        <button
          v-for="preset in colorPresets"
          :key="preset.value"
          class="dropdown-option color-option"
          @click="handleColorSelect(preset.value)"
        >
          <span
            class="color-preview"
            :style="{ backgroundColor: preset.value || 'transparent', border: preset.value ? 'none' : '1px dashed var(--border-color)' }"
          ></span>
          <span class="color-name">{{ preset.name }}</span>
        </button>
      </div>
    </div>

    <button
      class="format-btn"
      title="行内代码"
      @click="handleFormat('code')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16,18 22,12 16,6"/>
        <polyline points="8,6 2,12 8,18"/>
      </svg>
      <span class="btn-label">代码</span>
    </button>

    <div class="dropdown code-dropdown">
      <button
        class="format-btn"
        :class="{ active: showCodeMenu }"
        title="代码块"
        @click="toggleCodeMenu"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        <span class="btn-label">代码块</span>
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      <div v-if="showCodeMenu" class="dropdown-menu code-menu">
        <button
          class="dropdown-option default-option"
          @click="handleCodeSelect('')"
        >
          自动识别（不指定语言）
        </button>
        <div class="menu-divider"></div>
        <button
          v-for="lang in codeLanguages.slice(1)"
          :key="lang.key"
          class="dropdown-option"
          @click="handleCodeSelect(lang.key)"
        >
          {{ lang.label }}
        </button>
      </div>
    </div>

    <button
      class="format-btn"
      title="引用"
      @click="handleFormat('quote')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 0 .25 0 .25 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
      </svg>
      <span class="btn-label">引用</span>
    </button>

    <div class="dropdown">
      <button
        class="format-btn"
        :class="{ active: showHeadingMenu }"
        title="标题"
        @click="toggleHeadingMenu"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12h8"/>
          <path d="M4 18V6"/>
          <path d="M12 18V6"/>
          <path d="M17 12l3-2v8"/>
        </svg>
        <span class="btn-label">标题</span>
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      <div v-if="showHeadingMenu" class="dropdown-menu">
        <button
          v-for="level in 6"
          :key="level"
          class="dropdown-option"
          :style="{ fontSize: `${1.1 - level * 0.08}rem` }"
          @click="handleFormat(`h${level}` as FormatType)"
        >
          H{{ level }} 标题 {{ level }}
        </button>
      </div>
    </div>

    <div class="separator"></div>

    <button
      class="format-btn"
      title="无序列表"
      @click="handleFormat('ul')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="9" y1="6" x2="20" y2="6"/>
        <line x1="9" y1="12" x2="20" y2="12"/>
        <line x1="9" y1="18" x2="20" y2="18"/>
        <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
        <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
      </svg>
      <span class="btn-label">列表</span>
    </button>

    <button
      class="format-btn"
      title="有序列表"
      @click="handleFormat('ol')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="10" y1="6" x2="21" y2="6"/>
        <line x1="10" y1="12" x2="21" y2="12"/>
        <line x1="10" y1="18" x2="21" y2="18"/>
        <text x="3" y="8" font-size="8" fill="currentColor" stroke="none">1</text>
        <text x="3" y="14" font-size="8" fill="currentColor" stroke="none">2</text>
        <text x="3" y="20" font-size="8" fill="currentColor" stroke="none">3</text>
      </svg>
      <span class="btn-label">序号</span>
    </button>

    <div class="separator"></div>

    <button
      class="format-btn"
      title="插入链接"
      @click="openLinkModal"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <span class="btn-label">链接</span>
    </button>

    <button
      class="format-btn"
      title="插入图片"
      @click="openImageModal"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      <span class="btn-label">图片</span>
    </button>

    <button
      class="format-btn"
      title="插入表格"
      @click="openTableModal"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
      <span class="btn-label">表格</span>
    </button>

    <!-- 链接弹窗 -->
    <Modal
      :visible="showLinkModal"
      title="插入链接"
      :fields="[
        { key: 'text', label: '链接文本', type: 'text', placeholder: '请输入链接显示的文字' },
        { key: 'url', label: '链接地址', type: 'url', placeholder: 'https://example.com' }
      ]"
      confirm-text="插入"
      @close="showLinkModal = false"
      @confirm="handleLinkConfirm"
    />

    <!-- 图片弹窗 -->
    <Modal
      :visible="showImageModal"
      title="插入图片"
      :fields="[
        { key: 'alt', label: '图片描述', type: 'text', placeholder: '请输入图片描述文字' },
        { key: 'url', label: '图片地址', type: 'url', placeholder: 'https://example.com/image.png' }
      ]"
      confirm-text="插入"
      @close="showImageModal = false"
      @confirm="handleImageConfirm"
    />

    <!-- 表格弹窗 -->
    <Teleport to="body">
      <div
        v-if="showTableModal"
        class="modal-overlay"
        @click.self="showTableModal = false"
      >
        <div class="modal-content table-modal">
          <div class="modal-header">
            <h3 class="modal-title">插入表格</h3>
            <button class="modal-close" @click="showTableModal = false" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="table-selector">
              <div class="selector-label">选择表格大小</div>
              <div class="selector-grid">
                <div
                  v-for="r in 5"
                  :key="'row-' + r"
                  class="selector-row"
                >
                  <div
                    v-for="c in 5"
                    :key="'col-' + c"
                    class="selector-cell"
                    :class="{ active: r <= tableRows && c <= tableCols }"
                    @mouseenter="tableRows = r; tableCols = c"
                    @click="handleTableConfirm"
                  />
                </div>
              </div>
              <div class="selector-info">{{ tableRows }} 行 × {{ tableCols }} 列</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.format-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
}

.format-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.format-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
}

.format-btn:active,
.format-btn.active {
  background-color: var(--accent-color);
  color: var(--btn-active-text);
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-label {
  font-size: 0.75rem;
  white-space: nowrap;
}

.chevron {
  width: 12px;
  height: 12px;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
  margin: 0 0.5rem;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.25rem;
  background-color: var(--bg-toolbar);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px var(--dropdown-shadow);
}

.code-menu {
  min-width: 180px;
}

.color-menu {
  min-width: 120px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-primary);
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-option:hover {
  background-color: var(--bg-hover);
}

.default-option {
  color: var(--text-secondary);
}

.menu-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.25rem 0;
}

.color-option {
  gap: 0.75rem;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.color-name {
  flex: 1;
}

@media (max-width: 768px) {
  .btn-label {
    display: none;
  }
}

/* 表格弹窗样式 */
.table-modal {
  min-width: 280px;
}

.table-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.selector-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.selector-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selector-row {
  display: flex;
  gap: 4px;
}

.selector-cell {
  width: 24px;
  height: 24px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.1s ease, border-color 0.1s ease;
}

.selector-cell:hover {
  border-color: var(--accent-color);
}

.selector-cell.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.selector-info {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* 复用 Modal 的样式 */
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
  min-width: 360px;
  max-width: 480px;
  box-shadow: 0 8px 32px var(--dropdown-shadow);
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
</style>