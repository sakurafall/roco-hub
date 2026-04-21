<template>
  <view class="appearance" :style="themeStyle">
    <text class="appearance__title">外观设置</text>
    <text class="appearance__desc">选择一套主题（持久化到本地存储）</text>
    <view class="theme-list">
      <view
        v-for="t in available"
        :key="t.name"
        class="theme-item"
        :class="{ 'is-active': t.name === current }"
        @tap="onPick(t.name)"
      >
        <view class="theme-item__swatch" :style="{ background: t.tokens.colorPrimary }" />
        <view class="theme-item__meta">
          <text class="theme-item__label">{{ t.label }}</text>
          <text class="theme-item__name">{{ t.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { buildCssVarStyle } from '@/theme/engine'

const { available, current, currentManifest, switchTo } = useTheme()
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))

function onPick(name: string) {
  switchTo(name)
}
</script>

<style lang="scss" scoped>
.appearance {
  min-height: 100vh;
  padding: 32rpx;
  background: var(--color-bg);
  color: var(--color-text);

  &__title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
  }
  &__desc {
    display: block;
    margin: 8rpx 0 32rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
  }
}
.theme-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.theme-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  border: 2rpx solid var(--color-border);
  box-shadow: var(--shadow-card);

  &.is-active {
    border-color: var(--color-primary);
  }
  &__swatch {
    width: 64rpx;
    height: 64rpx;
    border-radius: var(--radius-sm);
  }
  &__label {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
  }
  &__name {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
}
</style>
