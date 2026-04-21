import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { getCurrentManifest, listAvailableThemes } from '@/theme/engine'

/**
 * 主题访问入口：组件用 useTheme().current.value 取当前主题，
 * 用 switchTo / toggle 切换。
 */
export function useTheme() {
  const ui = useUiStore()

  const current = computed(() => ui.themeName)
  const currentManifest = computed(() => getCurrentManifest())
  const available = computed(() => listAvailableThemes())

  function switchTo(name: string) {
    ui.setTheme(name)
  }

  function toggle() {
    ui.toggleTheme()
  }

  return { current, currentManifest, available, switchTo, toggle }
}
