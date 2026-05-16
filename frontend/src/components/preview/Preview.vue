<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { marked, type Tokens } from 'marked'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import { createMarkdownParser } from '../../utils/markdown'
import { OpenInBrowser } from '../../../wailsjs/go/main/App'

mermaid.initialize({ startOnLoad: false, theme: 'dark' })

const darkThemes = new Set(['vscode-dark', 'one-dark', 'monokai', 'dracula', 'github-dark', 'solarized-dark', 'nord', 'gruvbox-dark'])
let mermaidCounter = 0
let lastMermaidTheme = 'dark'

// 主题到 highlight.js 主题的映射（全部使用本地主题文件）
const themeToHljs: Record<string, { dark: boolean; theme: string }> = {
  'vscode-dark': { dark: true, theme: 'atom-one-dark' },
  'vscode-light': { dark: false, theme: 'atom-one-light' },
  'one-dark': { dark: true, theme: 'atom-one-dark' },
  'one-light': { dark: false, theme: 'atom-one-light' },
  'monokai': { dark: true, theme: 'monokai' },
  'dracula': { dark: true, theme: 'a11y-dark' },
  'github-dark': { dark: true, theme: 'github-dark' },
  'solarized-dark': { dark: true, theme: 'atom-one-dark' },
  'nord': { dark: true, theme: 'nord' },
  'gruvbox-dark': { dark: true, theme: 'monokai' },
}

// 动态加载主题
const loadTheme = (themeName: string) => {
  // 移除旧主题
  const oldTheme = document.getElementById('hljs-theme')
  if (oldTheme) {
    oldTheme.remove()
  }

  const hljsConfig = themeToHljs[themeName] || { dark: true, theme: 'atom-one-dark' }

  // 添加新主题
  const link = document.createElement('link')
  link.id = 'hljs-theme'
  link.rel = 'stylesheet'
  link.href = `/hljs-themes/${hljsConfig.theme}.min.css`
  document.head.appendChild(link)
}

// 监听主题变化
const observer = new MutationObserver(() => {
  const theme = document.documentElement.getAttribute('data-theme') || 'vscode-dark'
  loadTheme(theme)
  syncMermaidTheme()
})

onMounted(() => {
  // 初始加载主题
  const theme = document.documentElement.getAttribute('data-theme') || 'vscode-dark'
  loadTheme(theme)

  // 监听 data-theme 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  observer.disconnect()
})

interface Props {
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  scroll: [scrollTop: number, scrollHeight: number, clientHeight: number]
}>()

const previewRef = ref<HTMLDivElement | null>(null)

// Custom renderer with highlight.js
const renderer = new marked.Renderer()

renderer.code = (token: Tokens.Code): string => {
  const lang = token.lang || ''
  const code = token.text

  if (lang === 'mermaid') {
    const id = `mermaid-${++mermaidCounter}`
    return `<div class="mermaid-placeholder" data-mermaid-id="${id}" data-mermaid-source="${encodeURIComponent(code)}"></div>`
  }

  let highlighted: string
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(code, { language: lang }).value
    } catch {
      highlighted = hljs.highlightAuto(code).value
    }
  } else {
    highlighted = hljs.highlightAuto(code).value
  }

  return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
}

const markdownParser = createMarkdownParser({ renderer })

const renderedContent = computed(() => {
  try {
    mermaidCounter = 0
    return markdownParser.parse(props.content) as string
  } catch {
    return '<p>渲染错误</p>'
  }
})

const renderMermaidDiagrams = async () => {
  if (!previewRef.value) return
  const placeholders = previewRef.value.querySelectorAll('.mermaid-placeholder')
  for (const el of placeholders) {
    const source = decodeURIComponent((el as HTMLElement).dataset.mermaidSource || '')
    if (!source) continue
    const id = (el as HTMLElement).dataset.mermaidId || 'mermaid'
    try {
      const { svg } = await mermaid.render(id, source)
      el.innerHTML = svg
      el.classList.remove('mermaid-placeholder')
      el.classList.add('mermaid-diagram')
      ;(el as HTMLElement).dataset.mermaidSource = encodeURIComponent(source)
    } catch {
      el.innerHTML = '<p class="mermaid-error">Mermaid 语法错误</p>'
      el.classList.remove('mermaid-placeholder')
      el.classList.add('mermaid-error-container')
      ;(el as HTMLElement).dataset.mermaidSource = encodeURIComponent(source)
    }
  }
}

const syncMermaidTheme = () => {
  const appTheme = document.documentElement.getAttribute('data-theme') || 'vscode-dark'
  const mermaidTheme = darkThemes.has(appTheme) ? 'dark' : 'default'
  if (mermaidTheme !== lastMermaidTheme) {
    lastMermaidTheme = mermaidTheme
    mermaid.initialize({ startOnLoad: false, theme: mermaidTheme })
    reRenderExistingDiagrams()
  }
}

const reRenderExistingDiagrams = async () => {
  if (!previewRef.value) return
  const diagrams = previewRef.value.querySelectorAll('.mermaid-diagram, .mermaid-error-container')
  for (const el of diagrams) {
    const source = decodeURIComponent((el as HTMLElement).dataset.mermaidSource || '')
    if (!source) continue
    const id = `rerender-${++mermaidCounter}`
    try {
      const { svg } = await mermaid.render(id, source)
      el.innerHTML = svg
      el.classList.remove('mermaid-error-container')
      el.classList.add('mermaid-diagram')
    } catch {
      el.innerHTML = '<p class="mermaid-error">Mermaid 语法错误</p>'
      el.classList.remove('mermaid-diagram')
      el.classList.add('mermaid-error-container')
    }
  }
}

watch(renderedContent, () => {
  nextTick(renderMermaidDiagrams)
})

const handleScroll = () => {
  if (!previewRef.value) return

  emit('scroll', previewRef.value.scrollTop, previewRef.value.scrollHeight, previewRef.value.clientHeight)
}

const handleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const anchor = target.closest('a') as HTMLAnchorElement | null
  if (!anchor) return

  e.preventDefault()
  const href = anchor.getAttribute('href')
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    OpenInBrowser(href)
  }
}

const syncScrollFromEditor = (scrollTop: number) => {
  if (!previewRef.value) return

  const previewScrollRatio = scrollTop / previewRef.value.scrollHeight
  previewRef.value.scrollTop = previewScrollRatio * previewRef.value.scrollHeight
}

defineExpose({
  syncScrollFromEditor,
  previewRef
})
</script>

<template>
  <div
    ref="previewRef"
    class="preview-container"
    @scroll="handleScroll"
  >
    <div class="markdown-body" v-html="renderedContent" @click="handleClick" />
  </div>
</template>

<style scoped>
.preview-container {
  height: 100%;
  overflow-y: auto;
  background-color: var(--bg-primary);
  cursor: var(--cursor-default);
}

.markdown-body {
  padding: 1rem;
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.6;
}

.markdown-body ::selection {
  background-color: var(--editor-selection);
}

/* Headings */
.markdown-body :deep(h1) {
  font-size: 2em;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
  margin: 1rem 0 0.5rem;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
  margin: 1rem 0 0.5rem;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.markdown-body :deep(h4) {
  font-size: 1em;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.markdown-body :deep(h5) {
  font-size: 0.875em;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.markdown-body :deep(h6) {
  font-size: 0.85em;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 1rem 0 0.5rem;
}

/* Paragraphs */
.markdown-body :deep(p) {
  margin: 0 0 1rem;
}

/* Links */
.markdown-body :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
  cursor: var(--cursor-pointer);
}

/* Code */
.markdown-body :deep(code) {
  background-color: var(--bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  border: 1px solid var(--border-color);
}

.markdown-body :deep(pre) {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 1rem;
  border: 1px solid var(--border-color);
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.875em;
  border: none;
}

/* Blockquote */
.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--preview-quote-border);
  background-color: var(--preview-quote-bg);
  padding: 0.5rem 1rem;
  margin: 0 0 1rem;
  color: var(--text-secondary);
  border-radius: 0 4px 4px 0;
}

/* Lists */
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2rem;
  margin: 0 0 1rem;
}

.markdown-body :deep(li) {
  margin: 0.25rem 0;
}

/* Tables */
.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-body :deep(th) {
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-body :deep(tr:nth-child(even) td) {
  background-color: var(--bg-secondary);
}

.markdown-body :deep(tr:hover td) {
  background-color: var(--bg-hover);
}

/* Horizontal rule */
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1rem 0;
}

/* Images */
.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
}

/* Math formulas */
.markdown-body :deep(.katex) {
  font-size: 1.05em;
}

.markdown-body :deep(.katex-display) {
  margin: 0 0 1rem;
  padding: 0.25rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}

/* Mermaid diagrams */
.markdown-body :deep(.mermaid-diagram) {
  text-align: center;
  margin: 0 0 1rem;
  padding: 1rem;
  overflow-x: auto;
}

.markdown-body :deep(.mermaid-diagram svg) {
  max-width: 100%;
  height: auto;
}

.markdown-body :deep(.mermaid-error-container) {
  text-align: center;
  margin: 0 0 1rem;
  padding: 1rem;
}

.markdown-body :deep(.mermaid-error) {
  color: #e74c3c;
  font-style: italic;
}
</style>
