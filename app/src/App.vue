<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { applyTheme } from '@/theme/engine'
import { useUiStore } from '@/stores/ui'
import { useSilentLogin } from '@/composables/useSilentLogin'
import { useAnalytics } from '@/composables/useAnalytics'

onLaunch(async () => {
  console.log('[LOKA-APP] App Launch')
  // 1. 应用上次保存的主题（必须在任何页面渲染前完成）
  const ui = useUiStore()
  applyTheme(ui.themeName)

  // 2. 静默登录（骨架阶段写入 mock token）
  await useSilentLogin().run()

  // 3. 启动事件
  useAnalytics().track('app_launch')
})

onShow(() => {
  useAnalytics().track('app_show')
})

onHide(() => {
  useAnalytics().track('app_hide')
})
</script>

<style lang="scss">
/* H5 端注入 CSS 变量到 page 根，确保 var() 在所有页面都能解析。
   小程序端通过 page 选择器作用到 page 节点。 */
page {
  background-color: var(--color-bg, #F6F8FB);
  color: var(--color-text, #1B2236);
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
</style>
