import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { applyTheme, listAvailableThemes } from '@/theme/engine'

const STORAGE_KEY = 'ui.themeName'
const PREF_VERSION_KEY = 'ui.themePrefVersion'
/**
 * 主题偏好版本号：
 *   v2 = 洛克日（themeC）作为首发默认
 * 当 storage 中的版本号 < 当前版本时，会执行一次性迁移，把旧默认偏好刷新为新默认，
 * 避免老测试机里残留的 'themeA' / 'themeB' 继续顶替 PRD 钉死的"洛克日"默认。
 */
const CURRENT_PREF_VERSION = 2

const THEME_ORDER = ['themeC', 'themeA', 'themeB'] as const

function resolveInitialTheme(): string {
  const prevVer = storage.get<number>(PREF_VERSION_KEY, 0) ?? 0
  if (prevVer < CURRENT_PREF_VERSION) {
    storage.set(STORAGE_KEY, 'themeC')
    storage.set(PREF_VERSION_KEY, CURRENT_PREF_VERSION)
    return 'themeC'
  }
  return storage.get<string>(STORAGE_KEY, 'themeC') ?? 'themeC'
}

export const useUiStore = defineStore('ui', () => {
  const themeName = ref<string>(resolveInitialTheme())

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
