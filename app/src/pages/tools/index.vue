<template>
  <view class="page" :style="themeStyle">
    <!-- 顶部标题 -->
    <view class="page__header">
      <text class="page__title">工具箱</text>
      <text class="page__subtitle">训练师的百宝袋 · 常用计算一键直达</text>
    </view>

    <!-- 工具分组：核心工具 -->
    <view class="section">
      <view class="section__title-row">
        <text class="section__dot">●</text>
        <text class="section__title">核心工具</text>
      </view>
      <view class="tool-list">
        <view
          v-for="tool in coreTools"
          :key="tool.key"
          class="tool-card"
          :class="{ 'tool-card--disabled': tool.disabled }"
          @tap="onToolTap(tool)"
        >
          <view class="tool-card__icon-wrap" :style="{ background: tool.bg }">
            <image class="tool-card__icon" :src="tool.iconImg" mode="aspectFit" />
          </view>
          <view class="tool-card__body">
            <view class="tool-card__title-row">
              <text class="tool-card__title">{{ tool.label }}</text>
              <text v-if="tool.tag" class="tool-card__tag">{{ tool.tag }}</text>
            </view>
            <text class="tool-card__desc">{{ tool.desc }}</text>
          </view>
          <text class="tool-card__arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 工具分组：更多（P2 预留） -->
    <view class="section">
      <view class="section__title-row">
        <text class="section__dot">●</text>
        <text class="section__title">即将推出</text>
      </view>
      <view class="tool-list">
        <view
          v-for="tool in futureTools"
          :key="tool.key"
          class="tool-card tool-card--disabled"
        >
          <view class="tool-card__icon-wrap" :style="{ background: tool.bg }">
            <image class="tool-card__icon" :src="tool.iconImg" mode="aspectFit" />
          </view>
          <view class="tool-card__body">
            <view class="tool-card__title-row">
              <text class="tool-card__title">{{ tool.label }}</text>
              <text class="tool-card__tag tool-card__tag--soon">敬请期待</text>
            </view>
            <text class="tool-card__desc">{{ tool.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="footer">
      <text class="footer__text">更多工具加急制作中 · 有想法请去「我的」意见反馈</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAnalytics } from '@/composables/useAnalytics'
import { buildCssVarStyle } from '@/theme/engine'

const { currentManifest } = useTheme()
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))
const analytics = useAnalytics()

interface Tool {
  key: string
  label: string
  iconImg: string
  desc: string
  bg: string
  url?: string
  tag?: string
  disabled?: boolean
}

const coreTools: Tool[] = [
  {
    key: 'type-matchup',
    label: '属性克制',
    iconImg: '/static/icons/sword.svg',
    desc: '双属性攻防一键反查，克制 / 被克 / 等效三色一目了然',
    bg: 'linear-gradient(135deg, #FFB199 0%, #FF7A5A 100%)',
    url: '/pages-tools/type-matchup/index',
    tag: '高频',
  },
  {
    key: 'hatch-predict',
    label: '孵蛋反查',
    iconImg: '/static/icons/egg.svg',
    desc: '从目标精灵反推可孵蛋的候选组合',
    bg: 'linear-gradient(135deg, #B5E4FF 0%, #7EC8FF 100%)',
    url: '/pages-tools/hatch-predict/index',
  },
]

const futureTools: Tool[] = [
  {
    key: 'team-builder',
    label: '队伍模拟',
    iconImg: '/static/icons/target.svg',
    desc: '配队属性覆盖率分析，提示短板与推荐补位',
    bg: 'linear-gradient(135deg, #FFE08A 0%, #FFC93C 100%)',
  },
  {
    key: 'nature-calc',
    label: '性格收益',
    iconImg: '/static/icons/flask.svg',
    desc: '性格 × 努力值带来的六维收益换算',
    bg: 'linear-gradient(135deg, #D8B4F8 0%, #A782E8 100%)',
  },
]

function onToolTap(tool: Tool) {
  if (tool.disabled || !tool.url) return
  analytics.track('tool_open', { tool: tool.key })
  uni.navigateTo({ url: tool.url })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: 32rpx 0 64rpx;
  box-sizing: border-box;
}

/* 顶部标题 */
.page__header {
  padding: 8rpx 32rpx 24rpx;
}
.page__title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 1rpx;
}
.page__subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

/* 分组 */
.section {
  margin-top: 24rpx;
}
.section__title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 0 32rpx;
  margin-bottom: 16rpx;
}
.section__dot {
  color: var(--color-primary);
  font-size: 18rpx;
}
.section__title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
}

/* 工具卡片 */
.tool-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.tool-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: var(--color-bg-elevated);
  border-radius: 28rpx;
  padding: 24rpx 24rpx;
  border: 1rpx solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition: transform 120ms ease;
}
.tool-card:active:not(.tool-card--disabled) {
  transform: scale(0.98);
}
.tool-card--disabled {
  opacity: 0.55;
}
.tool-card__icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}
.tool-card__icon {
  width: 56rpx;
  height: 56rpx;
}
.tool-card__body {
  flex: 1;
  min-width: 0;
}
.tool-card__title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}
.tool-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.tool-card__tag {
  font-size: 18rpx;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 500;
}
.tool-card__tag--soon {
  background: var(--color-border);
  color: var(--color-text-secondary);
}
.tool-card__desc {
  display: block;
  font-size: 22rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.tool-card__arrow {
  font-size: 44rpx;
  color: var(--color-primary);
  font-weight: 300;
  line-height: 1;
  flex-shrink: 0;
}

/* 底部 */
.footer {
  margin-top: 48rpx;
  text-align: center;
  padding: 0 32rpx;
}
.footer__text {
  font-size: 22rpx;
  color: var(--color-text-secondary);
}
</style>
