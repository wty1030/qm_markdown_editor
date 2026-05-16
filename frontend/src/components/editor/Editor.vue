<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSettings } from '../../composables/useSettings'

interface Props {
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [content: string]
  scroll: [scrollTop: number, scrollHeight: number, clientHeight: number]
}>()

const { getTabString } = useSettings()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const lineNumbersRef = ref<HTMLDivElement | null>(null)
const highlightRef = ref<HTMLDivElement | null>(null)

const lines = computed(() => {
  const lineCount = props.content.split('\n').length
  return Array.from({ length: lineCount }, (_, i) => i + 1)
})

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const processLine = (text: string): string => {
  let line = escapeHtml(text)

  // 行内代码 (`code`)
  line = line.replace(/`([^`\n]+)`/g, '<span class="md-inline-code">`$1`</span>')

  // 标题 (# ## ### #### ##### ######)
  line = line.replace(/^(#{1,6})([ \t]+)(.*)$/, '<span class="md-heading"><span class="md-heading-mark">$1</span>$2$3</span>')

  // 粗体 (**text** 或 __text__)
  line = line.replace(/\*\*([^*\n]+)\*\*/g, '<span class="md-bold">**$1**</span>')
  line = line.replace(/__([^_\n]+)__/g, '<span class="md-bold">__$1__</span>')

  // 斜体 (*text* 或 _text_)
  line = line.replace(/\*([^*\n]+)\*/g, '<span class="md-italic">*$1*</span>')
  line = line.replace(/_([^_\n]+)_/g, '<span class="md-italic">_$1_</span>')

  // 删除线 (~~text~~)
  line = line.replace(/~~([^~\n]+)~~/g, '<span class="md-strikethrough">~~$1~~</span>')

  // 图片 ![alt](url) — 必须在链接之前
  line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<span class="md-image">![<span class="md-image-alt">$1</span>](<span class="md-image-url">$2</span>)</span>')

  // 链接 [text](url)
  line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="md-link">[<span class="md-link-text">$1</span>](<span class="md-link-url">$2</span>)</span>')

  // 引用 (> text)
  line = line.replace(/^(&gt;|>)([ \t]*)(.*)$/, '<span class="md-quote"><span class="md-quote-mark">$1</span>$2$3</span>')

  // 任务列表 (- [ ] 或 - [x]) — 必须在无序列表之前
  line = line.replace(/^(\s*)([-*+])([ \t]+)\[([ xX])\]/, '$1<span class="md-list-mark">$2</span>$3[<span class="md-task-$4"> </span>]')

  // 无序列表 (- * +)
  line = line.replace(/^(\s*)([-*+])([ \t]+)/, '$1<span class="md-list-mark">$2</span>$3')

  // 有序列表 (1. 2. etc)
  line = line.replace(/^(\s*)(\d+\.)([ \t]+)/, '$1<span class="md-list-mark">$2</span>$3')

  // 水平分割线 (--- *** ___)
  line = line.replace(/^(---|\*\*\*|___)$/, '<span class="md-hr">$1</span>')

  return line
}

const highlightedContent = computed(() => {
  const lines = props.content.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (!inCodeBlock && line.startsWith('```')) {
      inCodeBlock = true
      const lang = line.slice(3).trim()
      result.push(`<span class="md-code-fence">\`\`\`</span><span class="md-code-lang">${escapeHtml(lang)}</span>`)
    } else if (inCodeBlock && line.startsWith('```')) {
      inCodeBlock = false
      result.push(`<span class="md-code-fence">\`\`\`</span>`)
    } else if (inCodeBlock) {
      result.push(escapeHtml(line))
    } else {
      result.push(processLine(line))
    }
  }

  return result.join('<br>')
})

watch(highlightedContent, () => {
  nextTick(syncHighlightScroll)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update', target.value)
}

// 处理 Tab 键：根据设置插入制表符或空格
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value
    const tabStr = getTabString()

    const newValue = value.substring(0, start) + tabStr + value.substring(end)
    emit('update', newValue)

    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + tabStr.length
    })
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    let lineStart = start
    while (lineStart > 0 && value[lineStart - 1] !== '\n') lineStart--
    let lineEnd = start
    while (lineEnd < value.length && value[lineEnd] !== '\n') lineEnd++
    const fullLine = value.substring(lineStart, lineEnd)

    const taskMatch = fullLine.match(/^(\s*[-*+] \[[ xX]\] )/)
    const olMatch = fullLine.match(/^(\s*\d+\. )/)
    const ulMatch = fullLine.match(/^(\s*[-*+] )/)
    const quoteMatch = fullLine.match(/^(> )+/)

    let prefix = ''
    let originalPrefixLen = 0
    let olRenumber: { indent: string; nextNum: number } | null = null

    if (taskMatch) {
      originalPrefixLen = taskMatch[1].length
      prefix = taskMatch[1].replace(/\[[ xX]\]/, '[ ]')
    } else if (olMatch) {
      originalPrefixLen = olMatch[1].length
      const num = olMatch[1].match(/(\d+)\./)
      if (num) {
        prefix = olMatch[1].replace(/\d+/, String(parseInt(num[1]) + 1))
        olRenumber = {
          indent: olMatch[1].match(/^\s*/)![0],
          nextNum: parseInt(num[1]) + 2
        }
      }
    } else if (ulMatch) {
      originalPrefixLen = ulMatch[1].length
      prefix = ulMatch[1]
    } else if (quoteMatch) {
      originalPrefixLen = quoteMatch[0].length
      prefix = quoteMatch[0]
    }

    if (!prefix) {
      const newValue = value.substring(0, start) + '\n' + value.substring(end)
      emit('update', newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      })
      return
    }

    const afterPrefix = fullLine.substring(originalPrefixLen)

    // Empty content after prefix → exit the block
    if (afterPrefix.trim() === '') {
      const newValue = value.substring(0, lineStart) + value.substring(lineEnd)
      emit('update', newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = lineStart
      })
      return
    }

    // Cursor inside the prefix → normal newline
    if (start < lineStart + originalPrefixLen) {
      const newValue = value.substring(0, start) + '\n' + value.substring(end)
      emit('update', newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      })
      return
    }

    // Continue with prefix
    let newValue = value.substring(0, start) + '\n' + prefix + value.substring(end)
    const cursorPos = start + 1 + prefix.length

    // Renumber subsequent ordered list items
    if (olRenumber) {
      let pos = cursorPos
      while (pos < newValue.length && newValue[pos] !== '\n') pos++
      if (pos < newValue.length) pos++

      let nextNum = olRenumber.nextNum

      while (pos < newValue.length) {
        let lineEnd = pos
        while (lineEnd < newValue.length && newValue[lineEnd] !== '\n') lineEnd++
        const line = newValue.substring(pos, lineEnd)

        const lineMatch = line.match(/^(\s*)(\d+)\. /)
        if (!lineMatch || lineMatch[1] !== olRenumber.indent) break

        const newPrefix = olRenumber.indent + nextNum + '. '
        const oldLen = lineMatch[0].length
        newValue = newValue.substring(0, pos) + newPrefix + newValue.substring(pos + oldLen)
        lineEnd += newPrefix.length - oldLen

        nextNum++
        pos = lineEnd < newValue.length ? lineEnd + 1 : newValue.length
      }
    }

    emit('update', newValue)
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos
    })
  }
}

const handleScroll = () => {
  if (!textareaRef.value || !lineNumbersRef.value || !highlightRef.value) return

  lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  highlightRef.value.style.transform = `translate(${-textareaRef.value.scrollLeft}px, ${-textareaRef.value.scrollTop}px)`

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
  highlightRef.value.style.transform = `translate(${-textareaRef.value.scrollLeft}px, ${-textareaRef.value.scrollTop}px)`
}

// 滚动到指定行号（1-indexed）
const scrollToLine = (lineNumber: number) => {
  const textarea = textareaRef.value
  if (!textarea) return

  // 计算目标滚动位置
  // 使用实际渲染的行高
  const computedStyle = window.getComputedStyle(textarea)
  const lineHeight = parseFloat(computedStyle.lineHeight)

  // 编辑器内边距
  const paddingTop = parseFloat(computedStyle.paddingTop) || 16

  // 目标滚动位置：让目标行显示在视口顶部附近
  const targetScrollTop = Math.max(0, (lineNumber - 1) * lineHeight - paddingTop)

  textarea.scrollTop = targetScrollTop
}

defineExpose({
  syncScrollFromPreview,
  textareaRef,
  scrollToLine
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
        @keydown="handleKeyDown"
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
  font-size: 16px;
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
  padding: 1rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  pointer-events: none;
  color: var(--text-primary);
  will-change: transform;
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
  font-size: 16px;
  line-height: 1.6;
  overflow-y: auto;
  overflow-x: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  cursor: var(--cursor-default);
  scrollbar-width: none;
}

.editor-textarea::-webkit-scrollbar {
  display: none;
}

.editor-textarea::placeholder {
  color: var(--text-secondary);
}

.editor-textarea::selection {
  background-color: var(--editor-selection);
  color: var(--text-primary);
}

/* Markdown 语法高亮样式 */
/* 注意：只修改颜色，不修改 font-weight/font-style 等影响布局的属性 */
/* 否则高亮层和 textarea 的字符宽度不一致，导致光标位置错位 */
.editor-highlight :deep(.md-heading) {
  color: var(--syntax-keyword);
}

.editor-highlight :deep(.md-heading-mark) {
  color: var(--accent-color);
}

.editor-highlight :deep(.md-bold) {
  color: var(--syntax-variable);
}

.editor-highlight :deep(.md-italic) {
  color: var(--syntax-variable);
}

.editor-highlight :deep(.md-strikethrough) {
  color: var(--text-secondary);
  text-decoration: line-through;
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
