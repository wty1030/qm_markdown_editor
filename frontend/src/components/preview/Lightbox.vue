<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import mermaid from 'mermaid'

const darkThemes = new Set(['vscode-dark', 'one-dark', 'monokai', 'dracula', 'github-dark', 'solarized-dark', 'nord', 'gruvbox-dark'])

const props = defineProps<{
  visible: boolean
  source: { type: 'image'; src: string } | { type: 'mermaid'; code: string } | null
}>()

const emit = defineEmits<{
  close: []
}>()

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const contentEl = ref<HTMLDivElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)
const hintVisible = ref(true)
const hintOpacity = ref(1)

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartOffsetX = 0
let dragStartOffsetY = 0
let baseScale = 1
let contentW = 0
let contentH = 0
let hintTimer: ReturnType<typeof setTimeout> | null = null
let mermaidCounter = 0

const centerContent = () => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  offsetX.value = (vw - contentW * scale.value) / 2
  offsetY.value = (vh - contentH * scale.value) / 2
}

const fitToScreen = () => {
  if (contentW === 0 || contentH === 0) return
  const vw = window.innerWidth * 0.9
  const vh = window.innerHeight * 0.9
  baseScale = Math.min(vw / contentW, vh / contentH)
  scale.value = baseScale
  centerContent()
}

watch(() => props.visible, (val) => {
  if (val) {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    baseScale = 1
    contentW = 0
    contentH = 0
    isDragging = false
    hintVisible.value = true
    hintOpacity.value = 1

    if (hintTimer) clearTimeout(hintTimer)
    hintTimer = setTimeout(() => {
      hintOpacity.value = 0
    }, 2500)

    nextTick(() => {
      if (props.source?.type === 'image') {
        if (imgEl.value?.complete && imgEl.value.naturalWidth > 0) {
          onImageLoaded()
        }
      } else if (props.source?.type === 'mermaid') {
        renderMermaidInLightbox()
      }
    })
  } else {
    if (hintTimer) {
      clearTimeout(hintTimer)
      hintTimer = null
    }
  }
})

const onImageLoaded = () => {
  if (!imgEl.value) return
  contentW = imgEl.value.naturalWidth
  contentH = imgEl.value.naturalHeight
  fitToScreen()
}

const renderMermaidInLightbox = async () => {
  if (props.source?.type !== 'mermaid' || !contentEl.value) return
  const code = props.source.code
  const id = `lightbox-mermaid-${++mermaidCounter}`
  try {
    const { svg } = await mermaid.render(id, code)
    if (contentEl.value) {
      contentEl.value.innerHTML = svg
      nextTick(() => {
        const svgEl = contentEl.value!.querySelector('svg')
        if (svgEl) {
          contentW = svgEl.getBoundingClientRect().width
          contentH = svgEl.getBoundingClientRect().height
          fitToScreen()
        }
      })
    }
  } catch {
    if (contentEl.value) {
      contentEl.value.innerHTML = '<p style="color:#e74c3c;font-style:italic">Mermaid 渲染失败</p>'
    }
  }
}

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const onContentClick = (e: MouseEvent) => {
  e.stopPropagation()
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const factor = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = scale.value * factor
  if (newScale < baseScale) {
    if (scale.value !== baseScale) {
      scale.value = baseScale
      centerContent()
    }
    return
  }

  const ratio = newScale / scale.value
  offsetX.value = e.clientX * (1 - ratio) + offsetX.value * ratio
  offsetY.value = e.clientY * (1 - ratio) + offsetY.value * ratio
  scale.value = newScale
}

const onMouseDown = (e: MouseEvent) => {
  if (scale.value <= baseScale) return
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartOffsetX = offsetX.value
  dragStartOffsetY = offsetY.value
  e.preventDefault()
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging) return
  offsetX.value = dragStartOffsetX + (e.clientX - dragStartX)
  offsetY.value = dragStartOffsetY + (e.clientY - dragStartY)
}

const onMouseUp = () => {
  isDragging = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (hintTimer) clearTimeout(hintTimer)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="lightbox-overlay"
      @click="onOverlayClick"
      @wheel="onWheel"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <div
        v-if="hintVisible"
        class="lightbox-hint"
        :style="{ opacity: hintOpacity }"
      >
        点击空白区域或按 Esc 退出 · 滚轮缩放 · 拖拽移动
      </div>
      <div
        ref="contentEl"
        class="lightbox-content"
        :style="{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : scale > baseScale ? 'grab' : 'default',
        }"
        @click="onContentClick"
        @mousedown="onMouseDown"
      >
        <img
          v-if="source?.type === 'image'"
          ref="imgEl"
          :src="source.src"
          class="lightbox-img"
          @load="onImageLoaded"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  user-select: none;
}

.lightbox-hint {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  font-size: 14px;
  pointer-events: none;
  transition: opacity 0.8s ease;
  backdrop-filter: blur(4px);
  white-space: nowrap;
}

.lightbox-content {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  image-rendering: auto;
}

.lightbox-img {
  display: block;
  max-width: none;
}

.lightbox-content:deep(svg) {
  max-width: none;
  height: auto;
  display: block;
}
</style>
