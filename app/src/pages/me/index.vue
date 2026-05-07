<template>
  <view class="me" :style="themeStyle">
    <view class="me__header">
      <text class="me__title">我的</text>
      <text class="me__sub">{{ profile?.id ?? '游客' }}</text>
    </view>
    <view class="me__list">
      <view class="row" @tap="go('/pages-me/favorites/index')">
        <text>我的收藏</text>
      </view>
      <view class="row" @tap="go('/pages-me/history/index')">
        <text>浏览历史</text>
      </view>
      <view class="row" @tap="go('/pages-me/appearance/index')">
        <text>外观设置</text>
      </view>
      <view class="row" @tap="go('/pages-me/feedback/index')">
        <text>意见反馈</text>
      </view>
      <view class="row" @tap="go('/pages-me/about/index')">
        <text>关于</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/composables/useTheme'
import { useShare } from '@/composables/useShare'
import { buildCssVarStyle } from '@/theme/engine'

const { currentManifest } = useTheme()
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))
const userStore = useUserStore()
const profile = computed(() => userStore.profile)

const share = useShare()

onShareAppMessage(() => {
  return share.getShareAppMessage()
})

onShareTimeline(() => {
  return share.getShareTimeline()
})

function go(url: string) {
  uni.navigateTo({ url })
}

onShow(() => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
})
</script>

<style lang="scss" scoped>
.me {
  min-height: 100vh;
  padding: 32rpx;
  background: var(--color-bg);
  color: var(--color-text);

  &__header {
    margin-bottom: 32rpx;
  }
  &__title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
  }
  &__sub {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
  &__list {
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }
}
.row {
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border);
  font-size: 28rpx;
  &:last-child {
    border-bottom: none;
  }
}
</style>
