import { ref, watchEffect, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { WindowSetLightTheme, WindowSetDarkTheme } from '../../wailsjs/runtime/runtime'

export type ThemeName = 'vscode-dark' | 'vscode-light' | 'one-dark' | 'one-light' | 'monokai' | 'dracula' | 'github-dark' | 'solarized-dark' | 'nord' | 'gruvbox-dark'

export interface ThemeOption {
  name: ThemeName
  label: string
  icon: string
}

export const themeOptions: ThemeOption[] = [
  { name: 'vscode-dark', label: 'VS Code Dark', icon: '🌙' },
  { name: 'vscode-light', label: 'VS Code Light', icon: '☀️' },
  { name: 'one-dark', label: 'One Dark', icon: '🌑' },
  { name: 'one-light', label: 'One Light', icon: '🌤️' },
  { name: 'monokai', label: 'Monokai', icon: '🎨' },
  { name: 'dracula', label: 'Dracula', icon: '🧛' },
  { name: 'github-dark', label: 'GitHub Dark', icon: '🐙' },
  { name: 'solarized-dark', label: 'Solarized Dark', icon: '🌅' },
  { name: 'nord', label: 'Nord', icon: '❄️' },
  { name: 'gruvbox-dark', label: 'Gruvbox Dark', icon: '🍂' },
]

const storedTheme = useLocalStorage<ThemeName>('qmmd-theme', 'vscode-dark')

// Initialize theme
const theme = ref<ThemeName>(storedTheme.value || 'vscode-dark')

/**
 * Theme management composable for multiple theme switching.
 * Persists user preference to localStorage and applies to document root.
 */
export function useTheme() {
  /**
   * Set theme explicitly
   */
  const setTheme = (newTheme: ThemeName) => {
    theme.value = newTheme
    storedTheme.value = newTheme
  }

  /**
   * Check if current theme is dark
   */
  const isDark = computed(() => {
    const darkThemes = ['vscode-dark', 'one-dark', 'monokai', 'dracula', 'github-dark', 'solarized-dark', 'nord', 'gruvbox-dark']
    return darkThemes.includes(theme.value)
  })

  /**
   * Get current theme option
   */
  const currentThemeOption = computed(() => {
    return themeOptions.find(t => t.name === theme.value) || themeOptions[0]
  })

  // Apply theme to document root element
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
    if (isDark.value) {
      WindowSetDarkTheme()
    } else {
      WindowSetLightTheme()
    }
  })

  return {
    theme,
    isDark,
    setTheme,
    currentThemeOption,
    themeOptions
  }
}
