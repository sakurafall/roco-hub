<template>
  <view class="placeholder" :style="themeStyle">
    <text class="placeholder__title">工具箱</text>
    <text class="placeholder__desc">分包占位 · pages-tools/index</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { buildCssVarStyle } from '@/theme/engine'
const { currentManifest } = useTheme()
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))
</script>

<style lang="scss" scoped>
.placeholder {
  min-height: 100vh;
  padding: 64rpx 32rpx;
  background: var(--color-bg);
  color: var(--color-text);
}
.placeholder__title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
}
.placeholder__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
}
</style>
