<template>
  <view class="card" :class="{ 'card--compact': compact }" @tap="onTap">
    <view class="card__cover">
      <image
        v-if="spirit.thumbnail"
        class="card__img"
        :src="spirit.thumbnail"
        mode="aspectFit"
        lazy-load
      />
      <view v-else class="card__img card__img--empty" />

      <view class="card__no">No.{{ noText }}</view>

      <view v-if="iconList.length" class="card__types">
        <view v-for="(icon, idx) in iconList" :key="idx" class="card__type">
          <image class="card__type-img" :src="icon" mode="aspectFit" />
        </view>
      </view>

      <view v-if="shinyTag" class="card__shiny">异色</view>
    </view>
    <view class="card__name-bar">
      <text class="card__name">{{ spirit.name }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpiritSummary } from '@/types/spirit'

interface Props {
  spirit: SpiritSummary
  /**
   * 可选：兜底的"属性名 → icon URL"索引（来自 filters 接口）。
   * spirit.typeIcons 缺失时用它补，避免老数据没有 element_detail 导致空白。
   */
  typeIconMap?: Record<string, string>
  /**
   * 紧凑模式：用于首页横滑等空间受限的容器，整体字号/间距更小、阴影更柔。
   */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  typeIconMap: () => ({}),
  compact: false,
})
const emit = defineEmits<{
  (e: 'tap', spirit: SpiritSummary): void
}>()

const noText = computed(() => String(props.spirit.no).padStart(3, '0'))

/** 优先用精灵自带 typeIcons，缺则回落到 typeIconMap 按名字查 */
const iconList = computed<string[]>(() => {
  const own = props.spirit.typeIcons ?? []
  if (own.length) return own
  const names = (props.spirit.types as unknown as string[]) ?? []
  if (!props.typeIconMap) return []
  return names.map((n) => props.typeIconMap?.[n]).filter((u): u is string => !!u)
})

const shinyTag = computed(() => props.spirit.shinyLabel === '是')

function onTap() {
  emit('tap', props.spirit)
}
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1rpx solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.card__cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: var(--color-bg);
}

.card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  &--empty {
    background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-border) 100%);
  }
}

.card__no {
  position: absolute;
  left: 8rpx;
  bottom: 8rpx;
  background: var(--color-accent);
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 600;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  letter-spacing: 0.5rpx;
}

.card__types {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.card__type {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12);
}

.card__type-img {
  width: 28rpx;
  height: 28rpx;
}

.card__shiny {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: linear-gradient(90deg, #ffb454, #ff6a3d);
  color: #ffffff;
  font-size: 18rpx;
  font-weight: 600;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
}

.card__name-bar {
  padding: 12rpx 8rpx;
  background: var(--color-bg-elevated);
  text-align: center;
}

.card__name {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-text);
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card--compact {
  border-radius: var(--radius-lg);
  box-shadow: 0 4rpx 14rpx rgba(255, 180, 80, 0.18);
  border: none;

  .card__no {
    font-size: 18rpx;
    padding: 2rpx 8rpx;
  }

  .card__type {
    width: 28rpx;
    height: 28rpx;
  }

  .card__type-img {
    width: 22rpx;
    height: 22rpx;
  }

  .card__name-bar {
    padding: 10rpx 6rpx 14rpx;
  }

  .card__name {
    font-size: 24rpx;
  }
}
</style>
