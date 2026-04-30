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

const lines = computed(() => {
  const lineCount = props.content.split('\n').length
  return Array.from({ length: lineCount }, (_, i) => i + 1)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update', target.value)
}

const handleScroll = () => {
  if (!textareaRef.value || !lineNumbersRef.value) return

  lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop

  emit('scroll', textareaRef.value.scrollTop, textareaRef.value.scrollHeight, textareaRef.value.clientHeight)
}

const syncScrollFromPreview = (scrollTop: number) => {
  if (!textareaRef.value) return

  const editorScrollRatio = scrollTop / textareaRef.value.scrollHeight
  textareaRef.value.scrollTop = editorScrollRatio * textareaRef.value.scrollHeight
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

.editor-textarea {
  flex: 1;
  padding: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--text-secondary);
}
</style>