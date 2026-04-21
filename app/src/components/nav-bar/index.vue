<template>
  <view class="loka-nav-bar">
    <view class="loka-nav-bar__title">{{ title }}</view>
    <view v-if="$slots.right" class="loka-nav-bar__right">
      <slot name="right" />
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>
.loka-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  border-bottom: 1rpx solid var(--color-border);

  &__title {
    font-size: 32rpx;
    font-weight: 600;
  }

  &__right {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }
}
</style>
