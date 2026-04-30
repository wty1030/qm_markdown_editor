import { ref, watchEffect, computed } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

export type Theme = 'dark' | 'light'

const storedTheme = useLocalStorage<Theme>('qmmd-theme', 'dark')

// Initialize theme - follow system preference if no stored value
const prefersDark = usePreferredDark()
const theme = ref<Theme>(storedTheme.value || (prefersDark.value ? 'dark' : 'light'))

/**
 * Theme management composable for VS Code dark/light theme switching.
 * Persists user preference to localStorage and applies to document root.
 */
export function useTheme() {
  /**
   * Toggle between dark and light themes
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    storedTheme.value = theme.value
  }

  /**
   * Set theme explicitly
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    storedTheme.value = newTheme
  }

  /**
   * Check if current theme is dark
   */
  const isDark = computed(() => theme.value === 'dark')

  // Apply theme to document root element
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
  })

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme
  }
}
