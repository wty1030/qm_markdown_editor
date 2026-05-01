import { ref, computed, type Ref } from 'vue'

const MAX_HISTORY_SIZE = 10

export function useUndoRedo(content: Ref<string>) {
  const history = ref<string[]>([content.value])
  const historyIndex = ref(0)

  // 可撤销/重做状态
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // 立即记录（格式化操作用）
  const pushHistoryImmediate = (newContent: string) => {
    // 如果内容没变化，不记录
    if (newContent === history.value[historyIndex.value]) return

    // 截断后续历史
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(newContent)
    historyIndex.value = history.value.length - 1

    // 超出限制，移除最早的记录
    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value.shift()
      historyIndex.value--
    }
  }

  // 防抖记录（用户输入用）
  const pushHistory = (newContent: string) => {
    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      pushHistoryImmediate(newContent)
    }, 500)
  }

  // 撤销
  const undo = (): string | null => {
    if (historyIndex.value <= 0) return null
    historyIndex.value--
    return history.value[historyIndex.value]
  }

  // 重做
  const redo = (): string | null => {
    if (historyIndex.value >= history.value.length - 1) return null
    historyIndex.value++
    return history.value[historyIndex.value]
  }

  // 重置（打开新文件时）
  const reset = (initialContent: string) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    history.value = [initialContent]
    historyIndex.value = 0
  }

  return {
    canUndo,
    canRedo,
    pushHistory,
    pushHistoryImmediate,
    undo,
    redo,
    reset
  }
}
