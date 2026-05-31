<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

const charCount = computed(() => props.content.length)
const lineCount = computed(() => props.content.split('\n').length)
const wordCount = computed(() => {
  const text = props.content.trim()
  if (!text) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
  const englishWords = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
  return chineseChars + englishWords
})
</script>

<template>
  <footer class="status-bar">
    <span class="status-left">
      <span>{{ lineCount }} 行</span>
      <span>{{ charCount }} 字符</span>
      <span>{{ wordCount }} 字</span>
    </span>
    <span class="status-right"></span>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  height: 24px;
  user-select: none;
}

.status-left {
  display: flex;
  gap: 1rem;
}
</style>
