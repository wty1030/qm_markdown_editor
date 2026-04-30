<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../common/Modal.vue'

export type FormatType =
  | 'bold'
  | 'italic'
  | 'code'
  | 'quote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'ul'
  | 'ol'

export interface LinkData {
  text: string
  url: string
}

export interface ImageData {
  alt: string
  url: string
}

const emit = defineEmits<{
  format: [type: FormatType]
  insertLink: [data: LinkData]
  insertImage: [data: ImageData]
}>()

const showHeadingMenu = ref(false)
const showLinkModal = ref(false)
const showImageModal = ref(false)

const handleFormat = (type: FormatType) => {
  emit('format', type)
  showHeadingMenu.value = false
}

const toggleHeadingMenu = () => {
  showHeadingMenu.value = !showHeadingMenu.value
}

const closeMenu = () => {
  showHeadingMenu.value = false
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

    <button
      class="format-btn code-btn"
      title="代码块 (Ctrl+`)"
      @click="handleFormat('code')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16,18 22,12 16,6"/>
        <polyline points="8,6 2,12 8,18"/>
      </svg>
      <span class="btn-label">代码</span>
    </button>

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

    <div class="heading-dropdown">
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

      <div v-if="showHeadingMenu" class="heading-menu">
        <button
          v-for="level in 6"
          :key="level"
          class="heading-option"
          :style="{ fontSize: `${1.25 - level * 0.1}rem` }"
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

.heading-dropdown {
  position: relative;
}

.heading-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  padding: 0.25rem;
  background-color: var(--bg-toolbar);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.heading-option {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.heading-option:hover {
  background-color: var(--bg-hover);
}

/* Code button - more visible */
.code-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
}

.code-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-color);
}

@media (max-width: 768px) {
  .btn-label {
    display: none;
  }
}
</style>
