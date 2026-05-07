<template>
  <view class="page" :style="themeStyle">
    <!-- 顶部统计 -->
    <view class="topbar">
      <text class="topbar__title">精灵图鉴</text>
      <text class="topbar__count">
        共 <text class="topbar__count-num">{{ total }}</text> 只
        <text v-if="hasAnyFilter">· 当前 {{ filteredCount }}</text>
      </text>
    </view>

    <!-- 搜索框 -->
    <view class="searchbar">
      <view class="searchbar__icon">🔍</view>
      <input
        v-model="keyword"
        class="searchbar__input"
        placeholder="搜索名称 / 编号 / 拼音 (dm / dimo)"
        placeholder-class="searchbar__placeholder"
        confirm-type="search"
      />
      <view v-if="keyword" class="searchbar__clear" @tap="onClearKeyword">×</view>
    </view>

    <!-- 属性快捷栏 -->
    <scroll-view v-if="quickElements.length" class="quickbar" scroll-x show-scrollbar="false">
      <view class="quickbar__inner">
        <view
          class="chip"
          :class="{ 'chip--active': !hasElementFilter }"
          @tap="onClearElement"
        >
          <text class="chip__label">全部</text>
        </view>
        <view
          v-for="opt in quickElements"
          :key="opt.id"
          class="chip"
          :class="{ 'chip--active': isElementSelected(opt.value) }"
          @tap="onToggleElement(opt.value)"
        >
          <image v-if="opt.iconUrl" class="chip__icon" :src="opt.iconUrl" mode="aspectFit" />
          <text class="chip__label">{{ opt.label }}</text>
        </view>
        <view class="chip chip--ghost" @tap="onOpenSheet">
          <text class="chip__label">更多 ▾</text>
        </view>
      </view>
    </scroll-view>

    <!-- 工具条：排序 + 筛选入口 -->
    <view class="toolbar">
      <view class="toolbar__left">
        <view class="toolbar__btn" @tap="onToggleSort">
          <text class="toolbar__btn-label">编号</text>
          <text class="toolbar__btn-icon">{{ sortIcon }}</text>
        </view>
        <view class="toolbar__btn" @tap="onOpenSheet">
          <text class="toolbar__btn-label">筛选</text>
          <text v-if="filters.activeCount.value > 0" class="toolbar__badge">
            {{ filters.activeCount.value }}
          </text>
        </view>
      </view>
      <view v-if="hasAnyFilter" class="toolbar__clear" @tap="onClearAll">清除全部</view>
    </view>

    <!-- 已选筛选标签 -->
    <view v-if="activeChips.length" class="active-chips">
      <view
        v-for="tag in activeChips"
        :key="`${tag.group}-${tag.value}`"
        class="active-chip"
        @tap="onRemoveChip(tag.group, tag.value)"
      >
        <text class="active-chip__label">{{ tag.label }}</text>
        <text class="active-chip__close">×</text>
      </view>
      <view v-if="keyword" class="active-chip" @tap="onClearKeyword">
        <text class="active-chip__label">关键词：{{ keyword }}</text>
        <text class="active-chip__close">×</text>
      </view>
    </view>

    <!-- 列表区 -->
    <view class="content">
      <!-- 加载中骨架 -->
      <view v-if="loading && filteredSpirits.length === 0" class="grid">
        <view v-for="i in 9" :key="`sk-${i}`" class="grid__cell">
          <view class="skeleton" />
        </view>
      </view>

      <!-- 空态 -->
      <view
        v-else-if="!loading && filteredSpirits.length === 0"
        class="empty"
      >
        <text class="empty__title">没有找到符合条件的精灵</text>
        <text class="empty__desc">试试调整属性筛选或搜索关键词</text>
        <button v-if="hasAnyFilter" class="empty__btn" @tap="onClearAll">清除筛选</button>
        <button v-else class="empty__btn" @tap="onReload">刷新</button>
      </view>

      <!-- 网格 -->
      <view v-else class="grid">
        <view v-for="s in filteredSpirits" :key="s.id" class="grid__cell">
          <SpiritCard :spirit="s" :type-icon-map="elementIconMap" @tap="onCardTap" />
        </view>
      </view>

      <!-- 错误提示（接口失败时已自动回落 mock，仅顶部提示） -->
      <view v-if="error && filteredSpirits.length > 0" class="errbar">
        <text class="errbar__text">⚠ 当前为离线数据：{{ error }}</text>
        <text class="errbar__btn" @tap="onReload">重试</text>
      </view>

      <view v-if="!loading && filteredSpirits.length > 0" class="footer-tip">
        已显示全部 {{ filteredCount }} 只
      </view>
    </view>

    <!-- 筛选抽屉 -->
    <FilterSheet
      :visible="sheetVisible"
      :sections="filters.drawerSections.value"
      :is-selected="filters.isSelected"
      :has-group-selection="hasGroupSelection"
      :active-count="filters.activeCount.value"
      @update:visible="(v) => (sheetVisible = v)"
      @toggle="(g, v) => filters.toggle(g, v)"
      @clear-group="(g) => filters.clearGroup(g)"
      @clear-all="filters.clearAll"
      @confirm="onConfirmFilter"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { useTheme } from '@/composables/useTheme'
import { useShare } from '@/composables/useShare'
import { buildCssVarStyle } from '@/theme/engine'
import { useSpiritList } from '@/composables/useSpiritList'
import { useAnalytics } from '@/composables/useAnalytics'
import { debounce } from '@/utils/debounce'
import type { FilterGroupKey } from '@/types/spirit-filter'
import type { SpiritSummary } from '@/types/spirit'
import SpiritCard from '@/components/spirit-card/index.vue'
import FilterSheet from '@/components/filter-sheet/index.vue'

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

const {
  total,
  loading,
  error,
  filteredSpirits,
  filteredCount,
  keyword,
  clearKeyword,
  sort,
  filters,
  hasAnyFilter,
  clearAll,
  init,
  reload,
} = useSpiritList()

const analytics = useAnalytics()
const sheetVisible = ref(false)

// 顶部快捷栏：默认仅展示前 5 个属性，剩下全部走"更多"抽屉
const QUICK_ELEMENT_LIMIT = 5
const quickElements = computed(() =>
  (filters.elementSection.value?.options ?? []).slice(0, QUICK_ELEMENT_LIMIT),
)

const elementIconMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const opt of filters.elementSection.value?.options ?? []) {
    if (opt.iconUrl) map[opt.value] = opt.iconUrl
  }
  return map
})

const hasElementFilter = computed(() => (filters.selection['2']?.length ?? 0) > 0)
function isElementSelected(value: string) {
  return filters.isSelected('2', value)
}
function hasGroupSelection(group: FilterGroupKey): boolean {
  return (filters.selection[group]?.length ?? 0) > 0
}

const sortIcon = computed(() => (sort.value === 'no_asc' ? '↑' : '↓'))

const activeChips = computed(() => filters.activeTags.value)

// 搜索埋点（节流）
const trackSearch = debounce(((kw: string, count: number) => {
  if (!kw) return
  analytics.track('spirit_list_search', { query: kw, result_count: count })
}) as (...args: unknown[]) => void, 500)

watch(keyword, (kw) => {
  trackSearch(kw, filteredCount.value)
})

onMounted(() => {
  init()
})

onShow(() => {
  analytics.track('page_view', { page: 'spirit_list' })
})

function onClearKeyword() {
  clearKeyword()
}

function onClearElement() {
  filters.clearGroup('2')
  analytics.track('spirit_list_filter_type_select', { types: [] })
}

function onToggleElement(value: string) {
  filters.toggle('2', value)
  analytics.track('spirit_list_filter_type_select', { types: filters.selection['2'] ?? [] })
}

function onOpenSheet() {
  sheetVisible.value = true
  analytics.track('spirit_list_filter_open')
}

function onConfirmFilter() {
  analytics.track('spirit_list_filter_confirm', {
    selection: { ...filters.selection },
    result_count: filteredCount.value,
  })
}

function onRemoveChip(group: FilterGroupKey, value: string) {
  filters.toggle(group, value)
}

function onToggleSort() {
  sort.value = sort.value === 'no_asc' ? 'no_desc' : 'no_asc'
  analytics.track('spirit_list_sort_change', { sort_by: 'no', order: sort.value })
}

function onClearAll() {
  clearAll()
  analytics.track('spirit_list_clear_all')
}

function onReload() {
  reload()
}

function onCardTap(spirit: SpiritSummary) {
  analytics.track('spirit_card_click', { spirit_id: spirit.id, source: 'list' })
  uni.navigateTo({ url: `/pages-spirit/detail/index?id=${encodeURIComponent(spirit.id)}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  padding-bottom: 32rpx;
}

/* 顶部统计 */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 24rpx 32rpx 8rpx;
}
.topbar__title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text);
}
.topbar__count {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}
.topbar__count-num {
  color: var(--color-primary);
  font-weight: 600;
}

/* 搜索框 */
.searchbar {
  margin: 16rpx 32rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx;
  background: var(--color-bg-elevated);
  border-radius: 999rpx;
  border: 1rpx solid var(--color-border);
}
.searchbar__icon {
  font-size: 28rpx;
  color: var(--color-text-secondary);
}
.searchbar__input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: var(--color-text);
}
.searchbar__placeholder {
  color: var(--color-text-secondary);
  font-size: 26rpx;
}
.searchbar__clear {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 32rpx;
  line-height: 1;
}

/* 属性快捷栏 */
.quickbar {
  margin: 8rpx 0;
  white-space: nowrap;
}
.quickbar__inner {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 32rpx;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: var(--color-bg-elevated);
  border: 1rpx solid var(--color-border);
  white-space: nowrap;
  flex-shrink: 0;
}
.chip--active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}
.chip--active .chip__label {
  color: var(--color-primary);
  font-weight: 600;
}
.chip--ghost {
  background: transparent;
  border-style: dashed;
}
.chip__icon {
  width: 32rpx;
  height: 32rpx;
}
.chip__label {
  font-size: 24rpx;
  color: var(--color-text);
}

/* 工具条 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 32rpx 0;
}
.toolbar__left {
  display: flex;
  gap: 16rpx;
}
.toolbar__btn {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: var(--color-bg-elevated);
  border: 1rpx solid var(--color-border);
  position: relative;
}
.toolbar__btn-label {
  font-size: 24rpx;
  color: var(--color-text);
}
.toolbar__btn-icon {
  font-size: 24rpx;
  color: var(--color-primary);
  font-weight: 700;
}
.toolbar__badge {
  margin-left: 4rpx;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 999rpx;
  padding: 2rpx 10rpx;
  min-width: 24rpx;
  text-align: center;
}
.toolbar__clear {
  font-size: 24rpx;
  color: var(--color-primary);
  padding: 8rpx 4rpx;
}

/* 已选筛选标签 */
.active-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 16rpx 32rpx 0;
}
.active-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: var(--color-primary-soft);
}
.active-chip__label {
  font-size: 22rpx;
  color: var(--color-primary);
  font-weight: 500;
}
.active-chip__close {
  font-size: 28rpx;
  color: var(--color-primary);
  line-height: 1;
}

/* 列表区 */
.content {
  padding: 16rpx 24rpx 0;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8rpx;
}
.grid__cell {
  width: 33.333%;
  padding: 8rpx;
  box-sizing: border-box;
}

.skeleton {
  width: 100%;
  padding-top: 130%;
  background: linear-gradient(
    90deg,
    var(--color-bg-elevated) 0%,
    var(--color-border) 50%,
    var(--color-bg-elevated) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  animation: skeleton-shine 1.4s linear infinite;
}
@keyframes skeleton-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 96rpx 32rpx;
}
.empty__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.empty__desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}
.empty__btn {
  margin-top: 32rpx;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 26rpx;
  border: none;
}

/* 错误条 / 底部提示 */
.errbar {
  margin: 16rpx 8rpx 0;
  padding: 16rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  border: 1rpx solid var(--color-border);
}
.errbar__text {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  flex: 1;
}
.errbar__btn {
  font-size: 24rpx;
  color: var(--color-primary);
  padding: 4rpx 12rpx;
}
.footer-tip {
  text-align: center;
  font-size: 22rpx;
  color: var(--color-text-secondary);
  padding: 32rpx 0 16rpx;
}
</style>
