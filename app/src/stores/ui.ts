import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { applyTheme, listAvailableThemes } from '@/theme/engine'

const STORAGE_KEY = 'ui.themeName'

const THEME_ORDER = ['themeC', 'themeA', 'themeB'] as const

export const useUiStore = defineStore('ui', () => {
  const themeName = ref<string>(storage.get<string>(STORAGE_KEY, 'themeC') ?? 'themeC')

  function setTheme(name: string) {
    themeName.value = name
    storage.set(STORAGE_KEY, name)
    applyTheme(name)
  }

  /**
   * 在三套首发主题之间轮转：洛克日 → 晨光 → 夜枫 → 洛克日。
   */
  function toggleTheme() {
    const idx = THEME_ORDER.indexOf(themeName.value as (typeof THEME_ORDER)[number])
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length]
    setTheme(next)
  }

  function getAvailable() {
    return listAvailableThemes()
  }

  return { themeName, setTheme, toggleTheme, getAvailable }
})
