<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { marked, type Tokens } from 'marked'
import hljs from 'highlight.js'

// 动态加载主题
const loadTheme = (theme: 'dark' | 'light') => {
  // 移除旧主题
  const oldTheme = document.getElementById('hljs-theme')
  if (oldTheme) {
    oldTheme.remove()
  }

  // 添加新主题
  const link = document.createElement('link')
  link.id = 'hljs-theme'
  link.rel = 'stylesheet'
  link.href = theme === 'dark'
    ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
    : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css'
  document.head.appendChild(link)
}

// 监听主题变化
const observer = new MutationObserver(() => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark'
  loadTheme(theme as 'dark' | 'light')
})

onMounted(() => {
  // 初始加载主题
  const theme = document.documentElement.getAttribute('data-theme') || 'dark'
  loadTheme(theme as 'dark' | 'light')

  // 监听 data-theme 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
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

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  try {
    return marked.parse(props.content) as string
  } catch {
    return '<p>渲染错误</p>'
  }
})

const handleScroll = () => {
  if (!previewRef.value) return

  emit('scroll', previewRef.value.scrollTop, previewRef.value.scrollHeight, previewRef.value.clientHeight)
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
    <div class="markdown-body" v-html="renderedContent" />
  </div>
</template>

<style scoped>
.preview-container {
  height: 100%;
  overflow-y: auto;
  background-color: var(--bg-primary);
}

.markdown-body {
  padding: 1rem;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
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
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
  margin: 0 0 1rem;
  color: var(--text-secondary);
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
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.75rem;
}

.markdown-body :deep(th) {
  background-color: var(--bg-secondary);
  font-weight: 600;
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
</style>