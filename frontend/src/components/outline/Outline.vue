<script setup lang="ts">
import { computed } from 'vue'

interface OutlineItem {
  level: number    // 1-6
  text: string     // 标题文本
  line: number     // 行号
}

interface Props {
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  scrollToLine: [lineNumber: number]
}>()

const outlineItems = computed<OutlineItem[]>(() => {
  const lines = props.content.split('\n')
  const items: OutlineItem[] = []

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      items.push({
        level: match[1].length,
        text: match[2].trim(),
        line: index + 1
      })
    }
  })

  return items
})

const scrollToLine = (lineNumber: number) => {
  emit('scrollToLine', lineNumber)
}
</script>

<template>
  <div class="outline">
    <div class="outline-list">
      <div
        v-for="item in outlineItems"
        :key="item.line"
        :class="['outline-item', `level-${item.level}`]"
        @click="scrollToLine(item.line)"
      >
        <span class="outline-marker">{{ '#'.repeat(item.level) }}</span>
        <span class="outline-text">{{ item.text }}</span>
      </div>
      <div v-if="outlineItems.length === 0" class="empty-message">
        无标题
      </div>
    </div>
  </div>
</template>

<style scoped>
.outline {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.outline-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.outline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outline-item:hover {
  background-color: var(--bg-hover);
}

.outline-marker {
  color: var(--accent-color);
  font-weight: 600;
  flex-shrink: 0;
}

.outline-text {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.outline-item.level-1 { padding-left: 0.5rem; font-weight: 600; }
.outline-item.level-2 { padding-left: 1rem; }
.outline-item.level-3 { padding-left: 1.5rem; font-size: 12px; }
.outline-item.level-4 { padding-left: 2rem; font-size: 12px; }
.outline-item.level-5 { padding-left: 2.5rem; font-size: 11px; color: var(--text-secondary); }
.outline-item.level-6 { padding-left: 3rem; font-size: 11px; color: var(--text-secondary); }

.empty-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
