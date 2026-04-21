import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { applyTheme, listAvailableThemes } from '@/theme/engine'

const STORAGE_KEY = 'ui.themeName'

export const useUiStore = defineStore('ui', () => {
  const themeName = ref<string>(storage.get<string>(STORAGE_KEY, 'themeA') ?? 'themeA')

  function setTheme(name: string) {
    themeName.value = name
    storage.set(STORAGE_KEY, name)
    applyTheme(name)
  }

  /**
   * 在两套首发主题之间切换；后续接入更多主题时可改为按列表轮转。
   */
  function toggleTheme() {
    const next = themeName.value === 'themeA' ? 'themeB' : 'themeA'
    setTheme(next)
  }

  function getAvailable() {
    return listAvailableThemes()
  }

  return { themeName, setTheme, toggleTheme, getAvailable }
})
