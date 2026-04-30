import { ref, type Ref } from 'vue'

interface ScrollSyncOptions {
  throttleMs?: number
}

export function useScrollSync(options: ScrollSyncOptions = {}) {
  const { throttleMs = 16 } = options

  const isEditorScrolling = ref(false)
  const isPreviewScrolling = ref(false)

  let editorScrollTimeout: ReturnType<typeof setTimeout> | null = null
  let previewScrollTimeout: ReturnType<typeof setTimeout> | null = null

  const handleEditorScroll = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
    previewElement: HTMLDivElement | null
  ) => {
    if (isPreviewScrolling.value) return

    isEditorScrolling.value = true

    if (editorScrollTimeout) {
      clearTimeout(editorScrollTimeout)
    }

    editorScrollTimeout = setTimeout(() => {
      isEditorScrolling.value = false
    }, 100)

    if (!previewElement) return

    const scrollRatio = scrollTop / (scrollHeight - clientHeight)
    const previewScrollTop = scrollRatio * (previewElement.scrollHeight - previewElement.clientHeight)

    previewElement.scrollTop = previewScrollTop
  }

  const handlePreviewScroll = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
    editorElement: HTMLTextAreaElement | null
  ) => {
    if (isEditorScrolling.value) return

    isPreviewScrolling.value = true

    if (previewScrollTimeout) {
      clearTimeout(previewScrollTimeout)
    }

    previewScrollTimeout = setTimeout(() => {
      isPreviewScrolling.value = false
    }, 100)

    if (!editorElement) return

    const scrollRatio = scrollTop / (scrollHeight - clientHeight)
    const editorScrollTop = scrollRatio * (editorElement.scrollHeight - editorElement.clientHeight)

    editorElement.scrollTop = editorScrollTop
  }

  return {
    handleEditorScroll,
    handlePreviewScroll,
    isEditorScrolling,
    isPreviewScrolling
  }
}