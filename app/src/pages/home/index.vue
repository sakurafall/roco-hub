<template>
  <view class="home" :style="themeStyle">
    <!-- ============ 自定义 NavBar ============ -->
    <view class="navbar" :style="navbarStyle">
      <!-- 状态栏占位（高度由 utils/navbar 统一计算） -->
      <view class="navbar__status" :style="{ height: nav.statusBarHeight + 'px' }" />
      <view class="navbar__inner" :style="{ height: nav.contentHeight + 'px' }">
        <view class="navbar__brand">
          <view class="navbar__logo">
            <text class="navbar__logo-glyph">洛</text>
          </view>
          <view class="navbar__title-block">
            <text class="navbar__title">洛克助手</text>
            <text class="navbar__subtitle">Malt Games · {{ themeLabel }}</text>
          </view>
        </view>
        <!-- 主题切换按钮：小程序端 rightSafeArea 会让开胶囊，H5 为 0 原样右贴 -->
        <view
          class="navbar__theme"
          :style="{ marginRight: nav.rightSafeArea + 'px' }"
          @tap="onSwitchTheme"
        >
          <text class="navbar__theme-icon">◐</text>
        </view>
      </view>
    </view>

    <!-- ============ Hero ============ -->
    <view class="hero">
      <view class="hero__decor hero__decor--ring" />
      <view class="hero__decor hero__decor--dots" />
      <view class="hero__inner">
        <text class="hero__hello">你好，训练师</text>
        <text class="hero__tagline">今天想查哪只精灵？</text>
        <view class="hero__search" @tap="onSearchTap">
          <text class="hero__search-icon">🔍</text>
          <text class="hero__search-placeholder">输入精灵名 / 编号 / 拼音</text>
          <view class="hero__search-mic">🎙</view>
        </view>
      </view>
    </view>

    <!-- ============ 数据版本 Banner ============ -->
    <view class="banner" @tap="onBannerTap">
      <view class="banner__icon">📦</view>
      <view class="banner__body">
        <text class="banner__title">当前数据版本 {{ dataVersion }}</text>
        <text class="banner__desc">{{ bannerDesc }}</text>
      </view>
      <text class="banner__arrow">›</text>
    </view>

    <!-- ============ 4 宫格快速工具 ============ -->
    <view class="quick">
      <view
        v-for="tool in quickTools"
        :key="tool.key"
        class="quick__cell"
        @tap="onQuickToolTap(tool)"
      >
        <view class="quick__icon-wrap" :style="{ background: tool.bg }">
          <text class="quick__icon">{{ tool.icon }}</text>
        </view>
        <text class="quick__label">{{ tool.label }}</text>
      </view>
    </view>

    <!-- ============ 热门精灵 ============ -->
    <view class="section">
      <view class="section__header">
        <view class="section__title-wrap">
          <text class="section__emoji">🔥</text>
          <text class="section__title">热门精灵</text>
        </view>
        <text class="section__more" @tap="onJumpList">全部 ›</text>
      </view>
      <scroll-view
        v-if="!loading || hotSpirits.length > 0"
        class="hscroll"
        scroll-x
        show-scrollbar="false"
      >
        <view class="hscroll__inner">
          <view
            v-for="s in hotSpirits"
            :key="s.id"
            class="hscroll__item"
          >
            <SpiritCard
              :spirit="s"
              :type-icon-map="elementIconMap"
              compact
              @tap="onHotSpiritTap"
            />
          </view>
        </view>
      </scroll-view>
      <!-- 骨架 -->
      <view v-else class="hscroll">
        <view class="hscroll__inner">
          <view v-for="i in 5" :key="`hot-sk-${i}`" class="hscroll__item">
            <view class="skeleton skeleton--card" />
          </view>
        </view>
      </view>
    </view>

    <!-- ============ 最近查看（无 history 时整模块隐藏）============ -->
    <view v-if="recentSpirits.length > 0" class="section">
      <view class="section__header">
        <view class="section__title-wrap">
          <text class="section__emoji">🕘</text>
          <text class="section__title">最近查看</text>
        </view>
        <text class="section__more" @tap="onJumpHistory">历史 ›</text>
      </view>
      <scroll-view class="hscroll" scroll-x show-scrollbar="false">
        <view class="hscroll__inner">
          <view
            v-for="s in recentSpirits"
            :key="s.id"
            class="hscroll__item"
          >
            <SpiritCard
              :spirit="s"
              :type-icon-map="elementIconMap"
              compact
              @tap="onRecentSpiritTap"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- ============ 反馈与数据纠错 ============ -->
    <view class="feedback" @tap="onFeedbackTap">
      <view class="feedback__icon">💬</view>
      <view class="feedback__body">
        <text class="feedback__title">数据有误？想要新功能？</text>
        <text class="feedback__desc">告诉我们，每条建议都会被人看到</text>
      </view>
      <text class="feedback__arrow">›</text>
    </view>

    <!-- 底部留白 -->
    <view class="footer">
      <text class="footer__text">v0.1.0 · 数据来自洛克王国官方公开资料</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTheme } from '@/composables/useTheme'
import { useSpirits } from '@/composables/useSpirits'
import { useSpiritFilters } from '@/composables/useSpiritFilters'
import { useAnalytics } from '@/composables/useAnalytics'
import { useDataStore } from '@/stores/data'
import { useHistoryStore } from '@/stores/history'
import { buildCssVarStyle } from '@/theme/engine'
import { getNavbarLayout } from '@/utils/navbar'
import SpiritCard from '@/components/spirit-card/index.vue'
import type { SpiritSummary } from '@/types/spirit'

const { currentManifest, toggle } = useTheme()
const { spirits, total, loading, load } = useSpirits()
const filters = useSpiritFilters()
const dataStore = useDataStore()
const historyStore = useHistoryStore()
const analytics = useAnalytics()

const themeLabel = computed(() => currentManifest.value.label)
const themeStyle = computed(() => buildCssVarStyle(currentManifest.value.tokens))
const navbarStyle = computed(() => ({
  background: currentManifest.value.navBg,
}))

/** 自定义 NavBar 布局：状态栏高度 / 内容区高度 / 右侧胶囊避让，统一由 utils/navbar 计算（带缓存）。 */
const nav = getNavbarLayout()

const dataVersion = computed(() => dataStore.version)
const bannerDesc = computed(() => {
  if (loading.value && total.value === 0) return '正在加载精灵数据…'
  return `已收录 ${total.value} 只精灵 · 点击查看更新日志`
})

// 热门精灵：MVP-A 暂取前 8 只占位（PRD §2.7 说明后端"最近 7 日 TOP"接口未就绪）
const hotSpirits = computed<SpiritSummary[]>(() => spirits.value.slice(0, 8))

// 最近查看：从 historyStore 取前 6 条，并和 spirits 关联出完整卡数据
const recentSpirits = computed<SpiritSummary[]>(() => {
  const ids = historyStore.list.slice(0, 6).map((h) => h.spiritId)
  if (!ids.length) return []
  const indexed = new Map(spirits.value.map((s) => [s.id, s] as const))
  return ids
    .map((id) => indexed.get(id))
    .filter((s): s is SpiritSummary => !!s)
})

// 属性 icon 索引（spirit-card 需要兜底）
const elementIconMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const opt of filters.elementSection.value?.options ?? []) {
    if (opt.iconUrl) map[opt.value] = opt.iconUrl
  }
  return map
})

interface QuickTool {
  key: 'pokedex' | 'matchup' | 'hatch' | 'fav'
  label: string
  icon: string
  bg: string
  url: string
}

const quickTools: QuickTool[] = [
  { key: 'pokedex', label: '图鉴', icon: '📖', bg: 'linear-gradient(135deg, #FFE08A 0%, #FFC93C 100%)', url: '/pages-spirit/list/index' },
  { key: 'matchup', label: '克制', icon: '⚔', bg: 'linear-gradient(135deg, #FFB199 0%, #FF7A5A 100%)', url: '/pages-tools/type-matchup/index' },
  { key: 'hatch', label: '孵蛋', icon: '🥚', bg: 'linear-gradient(135deg, #B5E4FF 0%, #7EC8FF 100%)', url: '/pages-tools/hatch-predict/index' },
  { key: 'fav', label: '收藏', icon: '❤', bg: 'linear-gradient(135deg, #FFB7C5 0%, #FF7A9C 100%)', url: '/pages-me/favorites/index' },
]

onMounted(() => {
  // 列表数据：首页"热门"和"最近查看"都依赖 spirits
  load()
  // 属性 icon 索引
  filters.loadSections().catch(() => {
    // 失败已在 composable 内回落 mock，这里吞掉
  })
})

onShow(() => {
  analytics.track('page_view', { page: 'home' })
})

function onSwitchTheme() {
  toggle()
  analytics.track('theme_switch', { to: currentManifest.value.name })
  uni.showToast({ title: `已切换到 ${currentManifest.value.label}`, icon: 'none', duration: 1200 })
}

function onSearchTap() {
  analytics.track('home_search_focus')
  uni.navigateTo({ url: '/pages-spirit/list/index?focus=1' })
}

function onBannerTap() {
  analytics.track('home_banner_click')
  uni.navigateTo({ url: '/pages-me/about/index' })
}

function onQuickToolTap(tool: QuickTool) {
  analytics.track('home_quick_tool_click', { tool: tool.key })
  uni.navigateTo({ url: tool.url })
}

function onJumpList() {
  uni.navigateTo({ url: '/pages-spirit/list/index' })
}

function onJumpHistory() {
  uni.navigateTo({ url: '/pages-me/history/index' })
}

function onHotSpiritTap(spirit: SpiritSummary) {
  analytics.track('home_hot_spirit_click', { spirit_id: spirit.id })
  uni.navigateTo({ url: `/pages-spirit/detail/index?id=${encodeURIComponent(spirit.id)}` })
}

function onRecentSpiritTap(spirit: SpiritSummary) {
  analytics.track('home_recent_spirit_click', { spirit_id: spirit.id })
  uni.navigateTo({ url: `/pages-spirit/detail/index?id=${encodeURIComponent(spirit.id)}` })
}

function onFeedbackTap() {
  uni.navigateTo({ url: '/pages-me/feedback/index' })
}
</script>

<style lang="scss" scoped>
/* ============ 根容器 ============ */
.home {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%, #FFE9A1 0%, transparent 40%),
    var(--color-bg);
  color: var(--color-text);
  padding-bottom: 64rpx;
  box-sizing: border-box;
}

/* ============ NavBar ============ */
.navbar {
  width: 100%;
}
.navbar__status {
  width: 100%;
  /* height 由 JS 注入，保持与系统状态栏等高 */
}
.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  /* height 由 JS 注入，与胶囊对齐 */
}
.navbar__brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.navbar__logo {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFC93C 0%, #FF7A5A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 180, 80, 0.32);
}
.navbar__logo-glyph {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1;
}
.navbar__title-block {
  display: flex;
  flex-direction: column;
}
.navbar__title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}
.navbar__subtitle {
  font-size: 20rpx;
  color: var(--color-text-secondary);
  line-height: 1.2;
  margin-top: 2rpx;
}
.navbar__theme {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  border: 1rpx solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-card);
}
.navbar__theme-icon {
  font-size: 32rpx;
  color: var(--color-primary);
  font-weight: 700;
  line-height: 1;
}

/* ============ Hero ============ */
.hero {
  position: relative;
  margin: 16rpx 32rpx 0;
  padding: 48rpx 40rpx 56rpx;
  border-radius: 40rpx;
  background:
    radial-gradient(circle at 85% -10%, #FFE9A1 0%, transparent 55%),
    radial-gradient(circle at 0% 110%, #FFD3B5 0%, transparent 50%),
    linear-gradient(180deg, #FFFCF3 0%, #FFF1C2 100%);
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(255, 180, 80, 0.12);
}
.hero__decor {
  position: absolute;
  pointer-events: none;
}
.hero__decor--ring {
  top: -60rpx;
  right: -60rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 201, 60, 0.45), transparent 70%);
}
.hero__decor--dots {
  bottom: 32rpx;
  left: 56rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #FF7A5A;
  box-shadow:
    60rpx -32rpx 0 #7EC8FF,
    100rpx 24rpx 0 #FFC93C,
    -32rpx -16rpx 0 #FFB7C5;
}
.hero__inner {
  position: relative;
  z-index: 1;
}
.hero__hello {
  display: block;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.hero__tagline {
  display: block;
  margin-top: 8rpx;
  font-size: 52rpx;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  letter-spacing: 1rpx;
}
.hero__search {
  margin-top: 32rpx;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 180, 80, 0.18);
  border: 2rpx solid rgba(255, 201, 60, 0.4);
}
.hero__search-icon {
  font-size: 32rpx;
}
.hero__search-placeholder {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-text-secondary);
}
.hero__search-mic {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--color-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: var(--color-primary);
  opacity: 0.55; /* PRD §2.4：语音 P2 再上，灰置 */
}

/* ============ 版本 Banner ============ */
.banner {
  margin: 28rpx 32rpx 0;
  padding: 28rpx 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #FFC93C 0%, #FF7A5A 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 8rpx 22rpx rgba(255, 122, 90, 0.28);
}
.banner__icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}
.banner__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}
.banner__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.banner__desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
}
.banner__arrow {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 300;
  line-height: 1;
  flex-shrink: 0;
}

/* ============ 4 宫格 ============ */
.quick {
  margin: 28rpx 32rpx 0;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}
.quick__cell {
  flex: 1;
  background: var(--color-bg-elevated);
  border-radius: 28rpx;
  padding: 24rpx 0 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: var(--shadow-card);
  border: 1rpx solid var(--color-border);
  /* 触摸反馈：用 transform 模拟按下 */
  transition: transform 120ms ease;
}
.quick__cell:active {
  transform: scale(0.96);
}
.quick__icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}
.quick__icon {
  font-size: 44rpx;
  color: #FFFFFF;
  line-height: 1;
}
.quick__label {
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 600;
}

/* ============ 通用 section（热门/最近）============ */
.section {
  margin: 40rpx 0 0;
}
.section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx;
  margin-bottom: 16rpx;
}
.section__title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.section__emoji {
  font-size: 30rpx;
}
.section__title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-text);
}
.section__more {
  font-size: 24rpx;
  color: var(--color-primary);
}

/* 横滑容器 */
.hscroll {
  white-space: nowrap;
}
.hscroll__inner {
  display: inline-flex;
  align-items: stretch;
  gap: 20rpx;
  padding: 4rpx 32rpx 12rpx;
}
.hscroll__item {
  width: 220rpx;
  flex-shrink: 0;
}

/* 骨架（仅热门首屏用）*/
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-elevated) 0%,
    var(--color-border) 50%,
    var(--color-bg-elevated) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-lg);
  animation: skeleton-shine 1.4s linear infinite;
}
.skeleton--card {
  width: 220rpx;
  height: 280rpx;
}
@keyframes skeleton-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============ 反馈卡 ============ */
.feedback {
  margin: 40rpx 32rpx 0;
  padding: 28rpx;
  border-radius: 28rpx;
  background: var(--color-bg-elevated);
  border: 2rpx dashed var(--color-primary);
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.feedback__icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  background: var(--color-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}
.feedback__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}
.feedback__title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
}
.feedback__desc {
  font-size: 22rpx;
  color: var(--color-text-secondary);
}
.feedback__arrow {
  font-size: 40rpx;
  color: var(--color-primary);
  line-height: 1;
  flex-shrink: 0;
}

/* ============ 底部 ============ */
.footer {
  margin-top: 40rpx;
  text-align: center;
}
.footer__text {
  font-size: 20rpx;
  color: var(--color-text-secondary);
}
</style>
