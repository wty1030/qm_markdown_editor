import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

const LEFT_PANE_SIZE_KEY = 'qmmd-left-pane-size'
const DEFAULT_LEFT_SIZE = 50

// Shared state instance
const leftPaneSize = useLocalStorage<number>(LEFT_PANE_SIZE_KEY, DEFAULT_LEFT_SIZE)

/**
 * Layout state management composable for split pane persistence.
 * Persists pane sizes to localStorage using @vueuse/core.
 */
export function useLayoutState() {
  /**
   * Left pane size as percentage (0-100)
   */
  const leftSize = computed({
    get: () => leftPaneSize.value,
    set: (value: number) => {
      // Clamp to valid range
      leftPaneSize.value = Math.max(20, Math.min(80, value))
    }
  })

  /**
   * Right pane size as percentage (derived)
   */
  const rightSize = computed(() => 100 - leftSize.value)

  /**
   * Update pane sizes from splitpanes resize event
   * @param panes - Array of pane objects from splitpanes
   */
  const updateFromResize = (panes: Array<{ index: number; size: number }>) => {
    if (panes[0]) {
      leftSize.value = panes[0].size
    }
  }

  /**
   * Reset to default layout
   */
  const resetLayout = () => {
    leftPaneSize.value = DEFAULT_LEFT_SIZE
  }

  return {
    leftSize,
    rightSize,
    updateFromResize,
    resetLayout
  }
}

export type LayoutState = ReturnType<typeof useLayoutState>
