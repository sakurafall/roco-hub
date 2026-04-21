<template>
  <view class="home" :style="themeStyle">
    <view class="home__header">
      <text class="home__title">你好，洛克助手·Malt Games</text>
      <text class="home__subtitle">Phase 1 · Skeleton Hello World</text>
    </view>

    <view class="home__cards">
      <view class="card">
        <text class="card__label">当前主题</text>
        <text class="card__value">{{ themeLabel }}（{{ themeName }}）</text>
      </view>
      <view class="card">
        <text class="card__label">运行平台</text>
        <text class="card__value">{{ platformLabel }}</text>
      </view>
      <view class="card">
        <text class="card__label">精灵图鉴</text>
        <text class="card__value">{{ listStatusText }}</text>
      </view>
    </view>

    <view class="home__actions">
      <button class="btn btn--primary" @tap="onSwitchTheme">切换主题</button>
      <button class="btn btn--ghost" @tap="onJumpList">跳转图鉴列表 →</button>
      <button class="btn btn--ghost" @tap="onReload">刷新精灵数据</button>
    </view>

    <view class="home__list">
      <view v-if="loading && spirits.length === 0" class="spirit spirit--placeholder">
        <text class="spirit__name">加载中…</text>
      </view>
      <view v-for="s in previewSpirits" :key="s.id" class="spirit">
        <image v-if="s.thumbnail" class="spirit__cover" :src="s.thumbnail" mode="aspectFill" />
        <view class="spirit__cover spirit__cover--empty" v-else />
        <view class="spirit__meta">
          <text class="spirit__no">No.{{ String(s.no).padStart(3, '0') }}</text>
          <text class="spirit__name">{{ s.name }}</text>
        </view>
        <text class="spirit__types">{{ (s.types || []).join(' / ') }}</text>
      </view>
    </view>

    <view class="home__footer">
      <text class="home__footer-text">数据版本：{{ dataVersion }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTheme } from '@/composables/useTheme'
import { useSpirits } from '@/composables/useSpirits'
import { useAnalytics } from '@/composables/useAnalytics'
import { useDataStore } from '@/stores/data'
import { getPlatformLabel } from '@/utils/env'
import { buildCssVarStyle } from '@/theme/engine'

const { current: themeName, currentManifest, toggle } = useTheme()
const { spirits, total, loading, error, load } = useSpirits()
const dataStore = useDataStore()
const analytics = useAnalytics()

const platformLabel = getPlatformLabel()
const themeLabel = computed(() => currentManifest.value.label)
const dataVersion = computed(() => dataStore.version)
// 小程序端：CSS 变量需要在节点上声明，这里把当前主题的 token 注入到 root 容器
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))

// 首页只展示前 6 条作为"接通真实数据"的视觉证据
const previewSpirits = computed(() => spirits.value.slice(0, 6))
const listStatusText = computed(() => {
  if (loading.value) return '加载中…'
  if (error.value) return `接口失败，已回落本地 mock（共 ${total.value} 条）`
  return `共 ${total.value} 只精灵（接口实时拉取）`
})

onMounted(() => {
  load()
})

function onReload() {
  load()
  analytics.track('spirit_list_reload')
}

onShow(() => {
  analytics.track('page_view', { page: 'home' })
})

function onSwitchTheme() {
  toggle()
  analytics.track('theme_switch', { to: themeName.value })
}

function onJumpList() {
  uni.navigateTo({ url: '/pages-spirit/list/index' })
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
  background: var(--color-bg);
  color: var(--color-text);

  &__header {
    margin-bottom: 32rpx;
  }

  &__title {
    display: block;
    font-size: 56rpx;
    font-weight: 700;
    color: var(--color-text);
  }

  &__subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 32rpx;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 40rpx;
  }

  &__list {
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    padding: 16rpx 24rpx;
    box-shadow: var(--shadow-card);
    margin-bottom: 32rpx;
  }

  &__footer {
    text-align: center;
    padding-top: 16rpx;
  }

  &__footer-text {
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
}

.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  border: 1rpx solid var(--color-border);
  box-shadow: var(--shadow-card);

  &__label {
    font-size: 26rpx;
    color: var(--color-text-secondary);
  }

  &__value {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
  }
}

.btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  border-radius: var(--radius-md);
  border: none;

  &--primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  &--ghost {
    background: var(--color-primary-soft);
    color: var(--color-primary);
  }
}

.spirit {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 8rpx;
  border-bottom: 1rpx solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  &--placeholder {
    justify-content: center;
    color: var(--color-text-secondary);
  }

  &__cover {
    width: 88rpx;
    height: 88rpx;
    border-radius: 16rpx;
    background: var(--color-bg);
    flex-shrink: 0;

    &--empty {
      border: 1rpx dashed var(--color-border);
    }
  }

  &__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__no {
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }

  &__name {
    font-size: 30rpx;
    color: var(--color-text);
    font-weight: 600;
  }

  &__types {
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
}
</style>
