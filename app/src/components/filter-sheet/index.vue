<template>
  <view v-if="visible" class="sheet" @tap="onMaskTap">
    <view class="sheet__panel" :style="themeStyle" @tap.stop>
      <view class="sheet__header">
        <text class="sheet__title">筛选</text>
        <text class="sheet__close" @tap="onClose">关闭</text>
      </view>

      <scroll-view class="sheet__body" scroll-y>
        <view v-for="section in sections" :key="section.key" class="section">
          <view class="section__head">
            <text class="section__title">{{ section.title }}</text>
            <text
              v-if="hasGroupSelection(section.group)"
              class="section__clear"
              @tap="onClearGroup(section.group)"
            >清空</text>
          </view>
          <view class="section__options">
            <view
              v-for="opt in section.options"
              :key="opt.id"
              class="option"
              :class="{ 'option--active': isSelected(section.group, opt.value) }"
              @tap="onToggle(section.group, opt.value)"
            >
              <image
                v-if="opt.iconUrl"
                class="option__icon"
                :src="opt.iconUrl"
                mode="aspectFit"
              />
              <text class="option__label">{{ opt.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="sheet__footer">
        <button class="btn btn--ghost" @tap="onClearAll">清除全部</button>
        <button class="btn btn--primary" @tap="onConfirm">
          确定{{ activeCount > 0 ? `（${activeCount}）` : '' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { buildCssVarStyle } from '@/theme/engine'
import type { FilterGroupKey, FilterSection } from '@/types/spirit-filter'

interface Props {
  visible: boolean
  sections: FilterSection[]
  isSelected: (group: FilterGroupKey, value: string) => boolean
  hasGroupSelection: (group: FilterGroupKey) => boolean
  activeCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'toggle', group: FilterGroupKey, value: string): void
  (e: 'clearGroup', group: FilterGroupKey): void
  (e: 'clearAll'): void
  (e: 'confirm'): void
}>()

const { currentManifest } = useTheme()
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))

function onMaskTap() {
  emit('update:visible', false)
}
function onClose() {
  emit('update:visible', false)
}
function onToggle(group: FilterGroupKey, value: string) {
  emit('toggle', group, value)
}
function onClearGroup(group: FilterGroupKey) {
  emit('clearGroup', group)
}
function onClearAll() {
  emit('clearAll')
}
function onConfirm() {
  emit('confirm')
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.sheet {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* mp-weixin 下 fixed 的 inset:0 在某些版本里不会让宽高都到 100%，显式兜底 */
  width: 100%;
  height: 100%;
}

.sheet__panel {
  /* 必须显式撑满宽度，否则 mp-weixin flex cross-axis 不会 stretch，
     panel 会变成"内容宽"，导致清空按钮 / chips 跑出右边界被裁 */
  width: 100%;
  box-sizing: border-box;
  background: var(--color-bg);
  color: var(--color-text);
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border);
  width: 100%;
  box-sizing: border-box;
}

.sheet__title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-text);
}

.sheet__close {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  padding: 8rpx 16rpx;
  flex-shrink: 0;
}

.sheet__body {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  /* 注意：mp-weixin 的 scroll-view 对内边距处理不可靠，
     padding 全部下沉到 .section 上，避免子元素 width:100% 溢出 */
  max-height: 60vh;
}

.section {
  width: 100%;
  box-sizing: border-box;
  padding: 16rpx 32rpx 8rpx;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.section__title {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section__clear {
  flex-shrink: 0;
  font-size: 24rpx;
  color: var(--color-primary);
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: var(--color-primary-soft);
  line-height: 1;
  white-space: nowrap;
}

.section__options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: var(--color-bg-elevated);
  border: 1rpx solid var(--color-border);
  transition: all 0.15s ease;
}

.option--active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.option__icon {
  width: 32rpx;
  height: 32rpx;
}

.option__label {
  font-size: 26rpx;
  color: var(--color-text);
  line-height: 1.2;
}

.option--active .option__label {
  color: var(--color-primary);
  font-weight: 600;
}

.sheet__footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--color-border);
  background: var(--color-bg);
  width: 100%;
  box-sizing: border-box;
}

.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  border-radius: var(--radius-md);
  border: none;

  &--primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  &--ghost {
    background: var(--color-bg-elevated);
    color: var(--color-text);
    border: 1rpx solid var(--color-border);
  }
}
</style>
