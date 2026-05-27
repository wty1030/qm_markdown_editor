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
const containerWidth = ref(0)
const lineNumbersRef = ref<HTMLDivElement | null>(null)
const highlightRef = ref<HTMLDivElement | null>(null)

const searchOpen = ref(false)
const searchQuery = ref('')
const searchCaseSensitive = ref(false)
const searchCurrentIndex = ref(-1)
const searchInputRef = ref<HTMLInputElement | null>(null)

// canvas 测量：测量整行文字总宽度，除以可用宽度得到视觉行数
let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

const measureVisualLines = (logicalLines: string[], maxWidth: number): number[] => {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }
  const ctx = measureCtx!
  const textarea = textareaRef.value
  if (textarea) {
    const cs = window.getComputedStyle(textarea)
    ctx.font = cs.fontSize + ' ' + cs.fontFamily
  }
  if (maxWidth <= 0) return logicalLines.map(() => 1)

  return logicalLines.map(line => {
    if (line.length === 0) return 1
    const w = ctx.measureText(line).width
    return Math.max(1, Math.ceil(w / maxWidth))
  })
}

// 每个逻辑行对应的行号显示：第一个视觉行显示行号，后续视觉行显示空字符串
const lines = computed(() => {
  const maxWidth = containerWidth.value
  const logicalLines = props.content.split('\n')
  const visualCounts = measureVisualLines(logicalLines, maxWidth)
  const result: (number | string)[] = []
  for (let i = 0; i < logicalLines.length; i++) {
    result.push(i + 1)
    for (let j = 1; j < visualCounts[i]; j++) {
      result.push('')
    }
  }
  return result
})

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const searchMatches = computed(() => {
  if (!searchQuery.value) return []
  try {
    const flags = searchCaseSensitive.value ? 'g' : 'gi'
    const regex = new RegExp(escapeRegex(searchQuery.value), flags)
    const matches: { start: number; end: number }[] = []
    let match
    while ((match = regex.exec(props.content)) !== null) {
      if (match[0].length === 0) { regex.lastIndex++; continue }
      matches.push({ start: match.index, end: match.index + match[0].length })
    }
    return matches
  } catch {
    return []
  }
})

const applySearchHighlights = (html: string, matches: { start: number; end: number }[], currentIdx: number): string => {
  if (matches.length === 0) return html

  const result: string[] = []
  let textPos = 0
  let matchIdx = 0
  let i = 0

  while (i < html.length) {
    if (matchIdx < matches.length && textPos === matches[matchIdx].start) {
      const isCurrent = matchIdx === currentIdx
      const cls = isCurrent ? 'search-match-current' : 'search-match'
      result.push(`<span class="${cls}">`)
      const end = matches[matchIdx].end
      while (textPos < end && i < html.length) {
        if (html[i] === '<') {
          result.push('</span>')
          const tagEnd = html.indexOf('>', i)
          result.push(html.substring(i, tagEnd + 1))
          result.push(`<span class="${cls}">`)
          i = tagEnd + 1
        } else if (html[i] === '&') {
          const entityEnd = html.indexOf(';', i)
          result.push(html.substring(i, entityEnd + 1))
          textPos++
          i = entityEnd + 1
        } else {
          result.push(html[i])
          textPos++
          i++
        }
      }
      result.push('</span>')
      matchIdx++
      continue
    }

    if (html[i] === '<') {
      const tagEnd = html.indexOf('>', i)
      result.push(html.substring(i, tagEnd + 1))
      i = tagEnd + 1
    } else if (html[i] === '&') {
      const entityEnd = html.indexOf(';', i)
      result.push(html.substring(i, entityEnd + 1))
      textPos++
      i = entityEnd + 1
    } else {
      result.push(html[i])
      textPos++
      i++
    }
  }

  return result.join('')
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

  const html = result.join('\n')
  if (searchMatches.value.length > 0 && searchCurrentIndex.value >= 0) {
    return applySearchHighlights(html, searchMatches.value, searchCurrentIndex.value)
  }
  return html
})

watch(searchMatches, () => {
  if (searchMatches.value.length === 0) {
    searchCurrentIndex.value = -1
    return
  }
  const cursorPos = textareaRef.value?.selectionStart ?? 0
  let idx = searchMatches.value.findIndex(m => m.start >= cursorPos)
  if (idx === -1) idx = 0
  searchCurrentIndex.value = idx
  nextTick(scrollToCurrentMatch)
})

const scrollToCurrentMatch = () => {
  const textarea = textareaRef.value
  if (!textarea || searchCurrentIndex.value < 0 || searchMatches.value.length === 0) return

  const match = searchMatches.value[searchCurrentIndex.value]
  textarea.setSelectionRange(match.start, match.end)
  textarea.focus()

  const textBefore = props.content.substring(0, match.start)
  const lineNumber = textBefore.split('\n').length
  const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight)
  const paddingTop = parseFloat(window.getComputedStyle(textarea).paddingTop) || 16
  const targetScroll = Math.max(0, (lineNumber - 1) * lineHeight - textarea.clientHeight / 2 + paddingTop)
  textarea.scrollTop = targetScroll
}

const openSearch = () => {
  searchOpen.value = true
  nextTick(() => searchInputRef.value?.focus())
}

const closeSearch = () => {
  searchOpen.value = false
  searchQuery.value = ''
  searchCurrentIndex.value = -1
  textareaRef.value?.focus()
}

const searchNext = () => {
  if (searchMatches.value.length === 0) return
  searchCurrentIndex.value = (searchCurrentIndex.value + 1) % searchMatches.value.length
  scrollToCurrentMatch()
}

const searchPrev = () => {
  if (searchMatches.value.length === 0) return
  searchCurrentIndex.value = (searchCurrentIndex.value - 1 + searchMatches.value.length) % searchMatches.value.length
  scrollToCurrentMatch()
}

const handleSearchKeydown = (e: KeyboardEvent) => {
  if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    searchInputRef.value?.select()
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    e.shiftKey ? searchPrev() : searchNext()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeSearch()
  }
}

watch(highlightedContent, () => {
  nextTick(syncHighlightScroll)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update', target.value)
}

// 处理 Tab 键：根据设置插入制表符或空格
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    openSearch()
    return
  }

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

// 滚动到指定逻辑行号（1-indexed），考虑自动换行的视觉行偏移
const scrollToLine = (lineNumber: number) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const computedStyle = window.getComputedStyle(textarea)
  const lineHeight = parseFloat(computedStyle.lineHeight)
  const paddingTop = parseFloat(computedStyle.paddingTop) || 16
  const pl = parseFloat(computedStyle.paddingLeft) || 0
  const pr = parseFloat(computedStyle.paddingRight) || 0
  const maxWidth = textarea.clientWidth - pl - pr

  // 计算目标行之前的视觉行总数
  const logicalLines = props.content.split('\n')
  const linesBefore = logicalLines.slice(0, lineNumber - 1)
  const visualCounts = measureVisualLines(linesBefore, maxWidth)
  const visualOffset = visualCounts.reduce((sum, c) => sum + c, 0)

  const targetScrollTop = Math.max(0, visualOffset * lineHeight - paddingTop)
  textarea.scrollTop = targetScrollTop
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const textarea = textareaRef.value
  if (!textarea) return

  const updateWidth = () => {
    const cs = window.getComputedStyle(textarea)
    const pl = parseFloat(cs.paddingLeft) || 0
    const pr = parseFloat(cs.paddingRight) || 0
    containerWidth.value = textarea.clientWidth - pl - pr
  }

  updateWidth()
  resizeObserver = new ResizeObserver(() => updateWidth())
  resizeObserver.observe(textarea)

  // 字体加载后重新测量
  document.fonts.ready.then(() => updateWidth())
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

defineExpose({
  syncScrollFromPreview,
  textareaRef,
  scrollToLine
})
</script>

<template>
  <div class="editor-container">
    <div class="line-numbers" ref="lineNumbersRef">
      <span v-for="(line, idx) in lines" :key="idx" class="line-number">{{ line }}</span>
    </div>
    <div class="editor-wrapper">
      <div class="search-bar" v-if="searchOpen">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索..."
          @keydown="handleSearchKeydown"
          spellcheck="false"
        />
        <button
          class="search-btn"
          :class="{ active: searchCaseSensitive }"
          @click="searchCaseSensitive = !searchCaseSensitive"
          title="区分大小写"
        >Aa</button>
        <span class="search-count" v-if="searchQuery">
          {{ searchMatches.length > 0 ? `${searchCurrentIndex + 1}/${searchMatches.length}` : '无结果' }}
        </span>
        <button class="search-btn" @click="searchPrev" title="上一个 (Shift+Enter)">▲</button>
        <button class="search-btn" @click="searchNext" title="下一个 (Enter)">▼</button>
        <button class="search-btn" @click="closeSearch" title="关闭 (Esc)">✕</button>
      </div>
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
  height: 1.6em;
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
  overflow-wrap: break-word;
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
  box-sizing: border-box;
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

.editor-highlight :deep(.search-match) {
  background-color: rgba(255, 200, 0, 0.3);
  border-radius: 2px;
}

.editor-highlight :deep(.search-match-current) {
  background-color: rgba(255, 150, 0, 0.6);
  border-radius: 2px;
}

.search-bar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.search-input {
  width: 180px;
  padding: 2px 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 2px;
  font-size: 13px;
  outline: none;
}

.search-input:focus {
  border-color: var(--accent-color);
}

.search-btn {
  padding: 2px 6px;
  background: none;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  border-radius: 2px;
  line-height: 1;
}

.search-btn:hover {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.search-btn.active {
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
}

.search-count {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}
</style>
