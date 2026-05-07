<template>
  <view class="placeholder" :style="themeStyle">
    <text class="placeholder__title">发现</text>
    <text class="placeholder__desc">MVP-A 暂未启用，将在 MVP-B 接入主题/赛季/活动入口。</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { useTheme } from '@/composables/useTheme'
import { useShare } from '@/composables/useShare'
import { buildCssVarStyle } from '@/theme/engine'
const { currentManifest } = useTheme()
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))
const share = useShare()

onShareAppMessage(() => {
  return share.getShareAppMessage()
})

onShareTimeline(() => {
  return share.getShareTimeline()
})

onShow(() => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
})
</script>

<style lang="scss" scoped>
.placeholder {
  min-height: 100vh;
  padding: 64rpx 32rpx;
  background: var(--color-bg);
  color: var(--color-text);

  &__title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
  }

  &__desc {
    display: block;
    margin-top: 16rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
  }
}
</style>
