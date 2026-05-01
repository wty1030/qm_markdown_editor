import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export type TabMode = 'tab' | 'spaces-2' | 'spaces-4' | 'spaces-8'

export interface TabOption {
  value: TabMode
  label: string
  description: string
}

export const tabOptions: TabOption[] = [
  { value: 'tab', label: '制表符', description: '使用 \\t 字符' },
  { value: 'spaces-2', label: '2 空格', description: '插入 2 个空格' },
  { value: 'spaces-4', label: '4 空格', description: '插入 4 个空格' },
  { value: 'spaces-8', label: '8 空格', description: '插入 8 个空格' },
]

export type ViewMode = 'editor' | 'preview' | 'split'

export interface ViewModeOption {
  value: ViewMode
  label: string
  icon: string
}

export const viewModeOptions: ViewModeOption[] = [
  { value: 'editor', label: '编辑', icon: '✏️' },
  { value: 'preview', label: '预览', icon: '👁️' },
  { value: 'split', label: '分栏', icon: '⬛⬛' },
]

const storedTabMode = useLocalStorage<TabMode>('qmmd-tab-mode', 'tab')
const storedViewMode = useLocalStorage<ViewMode>('qmmd-view-mode', 'split')

const tabMode = ref<TabMode>(storedTabMode.value || 'tab')
const viewMode = ref<ViewMode>(storedViewMode.value || 'split')

/**
 * Settings management composable.
 * Persists user preferences to localStorage.
 */
export function useSettings() {
  const setTabMode = (mode: TabMode) => {
    tabMode.value = mode
    storedTabMode.value = mode
  }

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
    storedViewMode.value = mode
  }

  const getTabString = (): string => {
    switch (tabMode.value) {
      case 'tab':
        return '\t'
      case 'spaces-2':
        return '  '
      case 'spaces-4':
        return '    '
      case 'spaces-8':
        return '        '
      default:
        return '\t'
    }
  }

  const currentTabOption = computed(() => {
    return tabOptions.find(t => t.value === tabMode.value) || tabOptions[0]
  })

  const currentViewModeOption = computed(() => {
    return viewModeOptions.find(v => v.value === viewMode.value) || viewModeOptions[2]
  })

  return {
    tabMode,
    viewMode,
    setTabMode,
    setViewMode,
    getTabString,
    currentTabOption,
    currentViewModeOption,
    tabOptions,
    viewModeOptions
  }
}
