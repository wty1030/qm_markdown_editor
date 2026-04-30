<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [content: string]
  scroll: [scrollTop: number, scrollHeight: number, clientHeight: number]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const lineNumbersRef = ref<HTMLDivElement | null>(null)
const highlightRef = ref<HTMLDivElement | null>(null)

const lines = computed(() => {
  const lineCount = props.content.split('\n').length
  return Array.from({ length: lineCount }, (_, i) => i + 1)
})

// Markdown 语法高亮
const highlightedContent = computed(() => {
  let text = props.content

  // 转义 HTML
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 代码块 (```code```)
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<span class="md-code-block">\<span class="md-code-fence">\`\`\`</span><span class="md-code-lang">${lang}</span>\n${code}<span class="md-code-fence">\`\`\`</span></span>`
  })

  // 行内代码 (`code`)
  text = text.replace(/`([^`\n]+)`/g, '<span class="md-inline-code">`$1`</span>')

  // 标题 (# ## ### #### ##### ######)
  text = text.replace(/^(#{1,6})\s+(.*)$/gm, '<span class="md-heading"><span class="md-heading-mark">$1</span> $2</span>')

  // 粗体 (**text** 或 __text__)
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<span class="md-bold">**$1**</span>')
  text = text.replace(/__([^_\n]+)__/g, '<span class="md-bold">__$1__</span>')

  // 斜体 (*text* 或 _text_)
  text = text.replace(/\*([^*\n]+)\*/g, '<span class="md-italic">*$1*</span>')
  text = text.replace(/_([^_\n]+)_/g, '<span class="md-italic">_$1_</span>')

  // 删除线 (~~text~~)
  text = text.replace(/~~([^~\n]+)~~/g, '<span class="md-strikethrough">~~$1~~</span>')

  // 链接 [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="md-link">[<span class="md-link-text">$1</span>](<span class="md-link-url">$2</span>)</span>')

  // 图片 ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<span class="md-image">![<span class="md-image-alt">$1</span>](<span class="md-image-url">$2</span>)</span>')

  // 引用 (> text)
  text = text.replace(/^(&gt;|>)\s*(.*)$/gm, '<span class="md-quote"><span class="md-quote-mark">$1</span> $2</span>')

  // 无序列表 (- * +)
  text = text.replace(/^(\s*)([-*+])\s+/gm, '$1<span class="md-list-mark">$2</span> ')

  // 有序列表 (1. 2. etc)
  text = text.replace(/^(\s*)(\d+\.)\s+/gm, '$1<span class="md-list-mark">$2</span> ')

  // 任务列表 (- [ ] 或 - [x])
  text = text.replace(/^(\s*)([-*+])\s+\[([ xX])\]/gm, '$1<span class="md-list-mark">$2</span> [<span class="md-task-$3"> </span>]')

  // 水平分割线 (--- *** ___)
  text = text.replace(/^(---|\*\*\*|___)$/gm, '<span class="md-hr">$1</span>')

  // 换行处理
  text = text.replace(/\n/g, '<br>')

  return text
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update', target.value)
}

const handleScroll = () => {
  if (!textareaRef.value || !lineNumbersRef.value || !highlightRef.value) return

  lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  highlightRef.value.scrollTop = textareaRef.value.scrollTop
  highlightRef.value.scrollLeft = textareaRef.value.scrollLeft

  emit('scroll', textareaRef.value.scrollTop, textareaRef.value.scrollHeight, textareaRef.value.clientHeight)
}

const syncScrollFromPreview = (scrollTop: number) => {
  if (!textareaRef.value) return

  const editorScrollRatio = scrollTop / textareaRef.value.scrollHeight
  textareaRef.value.scrollTop = editorScrollRatio * textareaRef.value.scrollHeight
}

// 同步滚动高亮层
const syncHighlightScroll = () => {
  if (!textareaRef.value || !highlightRef.value) return
  highlightRef.value.scrollTop = textareaRef.value.scrollTop
  highlightRef.value.scrollLeft = textareaRef.value.scrollLeft
}

defineExpose({
  syncScrollFromPreview,
  textareaRef
})
</script>

<template>
  <div class="editor-container">
    <div class="line-numbers" ref="lineNumbersRef">
      <span v-for="line in lines" :key="line" class="line-number">{{ line }}</span>
    </div>
    <div class="editor-wrapper">
      <div class="editor-highlight" ref="highlightRef" v-html="highlightedContent"></div>
      <textarea
        ref="textareaRef"
        class="editor-textarea"
        :value="content"
        @input="handleInput"
        @scroll="handleScroll"
        placeholder="在此输入 Markdown..."
        spellcheck="false"
      />
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  height: 100%;
  background-color: var(--bg-primary);
}

.line-numbers {
  width: 40px;
  padding: 1rem 0.5rem;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  text-align: right;
  overflow-y: hidden;
  user-select: none;
  border-right: 1px solid var(--border-color);
}

.line-number {
  display: block;
}

.editor-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-y: auto;
  overflow-x: auto;
  pointer-events: none;
  color: var(--text-primary);
}

.editor-textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: transparent;
  color: transparent;
  caret-color: var(--editor-cursor);
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
  overflow-x: auto;
}

.editor-textarea::placeholder {
  color: var(--text-secondary);
}

.editor-textarea::selection {
  background-color: var(--editor-selection);
}

/* Markdown 语法高亮样式 */
.editor-highlight :deep(.md-heading) {
  color: var(--syntax-keyword);
  font-weight: 600;
}

.editor-highlight :deep(.md-heading-mark) {
  color: var(--accent-color);
}

.editor-highlight :deep(.md-bold) {
  color: var(--syntax-variable);
  font-weight: 600;
}

.editor-highlight :deep(.md-italic) {
  color: var(--syntax-variable);
  font-style: italic;
}

.editor-highlight :deep(.md-strikethrough) {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.editor-highlight :deep(.md-code-block) {
  display: block;
}

.editor-highlight :deep(.md-code-fence) {
  color: var(--syntax-comment);
}

.editor-highlight :deep(.md-code-lang) {
  color: var(--syntax-function);
}

.editor-highlight :deep(.md-inline-code) {
  color: var(--syntax-string);
  background-color: var(--bg-secondary);
  border-radius: 3px;
}

.editor-highlight :deep(.md-link) {
  color: var(--text-primary);
}

.editor-highlight :deep(.md-link-text) {
  color: var(--syntax-string);
}

.editor-highlight :deep(.md-link-url) {
  color: var(--accent-color);
}

.editor-highlight :deep(.md-image) {
  color: var(--text-primary);
}

.editor-highlight :deep(.md-image-alt) {
  color: var(--syntax-string);
}

.editor-highlight :deep(.md-image-url) {
  color: var(--accent-color);
}

.editor-highlight :deep(.md-quote) {
  color: var(--text-secondary);
}

.editor-highlight :deep(.md-quote-mark) {
  color: var(--success-color);
}

.editor-highlight :deep(.md-list-mark) {
  color: var(--accent-color);
}

.editor-highlight :deep(.md-hr) {
  color: var(--border-color);
}
</style>
