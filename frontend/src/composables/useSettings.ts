import { ref, computed, watchEffect } from 'vue'
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
  { value: 'editor', label: '编辑', icon: 'edit' },
  { value: 'preview', label: '预览', icon: 'preview' },
  { value: 'split', label: '分栏', icon: 'split' },
]

// 壁纸相关类型
export interface WallpaperArea {
  editor: boolean
  preview: boolean
  toolbar: boolean
  formatBar: boolean
  sidebar: boolean
}

export interface PresetWallpaper {
  id: string
  name: string
  thumbnail: string
  full: string
}

// 预设壁纸（使用渐变和纹理作为内置壁纸）
export const presetWallpapers: PresetWallpaper[] = [
  {
    id: 'gradient-blue',
    name: '蓝色渐变',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    full: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-sunset',
    name: '日落渐变',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    full: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'gradient-ocean',
    name: '海洋渐变',
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    full: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'gradient-forest',
    name: '森林渐变',
    thumbnail: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    full: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
  },
  {
    id: 'gradient-night',
    name: '夜空渐变',
    thumbnail: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
    full: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
  },
  {
    id: 'gradient-aurora',
    name: '极光渐变',
    thumbnail: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    full: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'none',
    name: '无壁纸',
    thumbnail: '',
    full: ''
  },
]

const storedTabMode = useLocalStorage<TabMode>('qmmd-tab-mode', 'tab')
const storedViewMode = useLocalStorage<ViewMode>('qmmd-view-mode', 'split')
const storedWallpaper = useLocalStorage<string>('qmmd-wallpaper', '')
const storedWallpaperAreas = useLocalStorage<WallpaperArea>('qmmd-wallpaper-areas', {
  editor: true,
  preview: true,
  toolbar: true,
  formatBar: true,
  sidebar: true
})
const storedOverlayOpacity = useLocalStorage<number>('qmmd-overlay-opacity', 85)
const storedAutoSaveEnabled = useLocalStorage<boolean>('qmmd-auto-save-enabled', true)
const storedAutoSaveInterval = useLocalStorage<number>('qmmd-auto-save-interval', 30)
const storedRecentFiles = useLocalStorage<string[]>('qmmd-recent-files', [])

const tabMode = ref<TabMode>(storedTabMode.value || 'tab')
const viewMode = ref<ViewMode>(storedViewMode.value || 'split')
const wallpaper = ref<string>(storedWallpaper.value || '')
const wallpaperAreas = ref<WallpaperArea>(storedWallpaperAreas.value || {
  editor: true,
  preview: true,
  toolbar: true,
  formatBar: true,
  sidebar: true
})
const overlayOpacity = ref<number>(storedOverlayOpacity.value || 85)
const autoSaveEnabled = ref<boolean>(storedAutoSaveEnabled.value !== false)
const autoSaveInterval = ref<number>(storedAutoSaveInterval.value || 30)

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

  const setWallpaper = (wp: string) => {
    wallpaper.value = wp
    storedWallpaper.value = wp
  }

  const setWallpaperAreas = (areas: WallpaperArea) => {
    wallpaperAreas.value = areas
    storedWallpaperAreas.value = areas
  }

  const setOverlayOpacity = (opacity: number) => {
    overlayOpacity.value = opacity
    storedOverlayOpacity.value = opacity
  }

  const setAutoSaveEnabled = (enabled: boolean) => {
    autoSaveEnabled.value = enabled
    storedAutoSaveEnabled.value = enabled
  }

  const setAutoSaveInterval = (interval: number) => {
    autoSaveInterval.value = interval
    storedAutoSaveInterval.value = interval
  }

  const addRecentFile = (path: string) => {
    const list = storedRecentFiles.value.filter(p => p !== path)
    list.unshift(path)
    storedRecentFiles.value = list.slice(0, 10)
  }

  const removeRecentFile = (path: string) => {
    storedRecentFiles.value = storedRecentFiles.value.filter(p => p !== path)
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

  const hasWallpaper = computed(() => {
    return wallpaper.value !== ''
  })

  // 应用壁纸到 DOM
  watchEffect(() => {
    const root = document.documentElement
    if (wallpaper.value) {
      root.style.setProperty('--wallpaper-bg', wallpaper.value)
      root.setAttribute('data-has-wallpaper', 'true')
    } else {
      root.style.setProperty('--wallpaper-bg', 'none')
      root.removeAttribute('data-has-wallpaper')
    }
    root.style.setProperty('--wallpaper-overlay-opacity', `${overlayOpacity.value / 100}`)

    // 设置各区域的壁纸启用状态
    root.setAttribute('data-wallpaper-editor', wallpaperAreas.value.editor && wallpaper.value ? 'true' : 'false')
    root.setAttribute('data-wallpaper-preview', wallpaperAreas.value.preview && wallpaper.value ? 'true' : 'false')
    root.setAttribute('data-wallpaper-toolbar', wallpaperAreas.value.toolbar && wallpaper.value ? 'true' : 'false')
    root.setAttribute('data-wallpaper-formatbar', wallpaperAreas.value.formatBar && wallpaper.value ? 'true' : 'false')
    root.setAttribute('data-wallpaper-sidebar', wallpaperAreas.value.sidebar && wallpaper.value ? 'true' : 'false')
  })

  return {
    tabMode,
    viewMode,
    wallpaper,
    wallpaperAreas,
    overlayOpacity,
    setTabMode,
    setViewMode,
    setWallpaper,
    setWallpaperAreas,
    setOverlayOpacity,
    getTabString,
    currentTabOption,
    currentViewModeOption,
    hasWallpaper,
    tabOptions,
    viewModeOptions,
    presetWallpapers,
    autoSaveEnabled,
    autoSaveInterval,
    setAutoSaveEnabled,
    setAutoSaveInterval,
    recentFiles: storedRecentFiles,
    addRecentFile,
    removeRecentFile
  }
}