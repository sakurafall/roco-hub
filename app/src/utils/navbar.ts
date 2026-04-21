/**
 * 自定义 NavBar 布局计算。
 *
 * 所有需要做自定义导航栏（pages.json 中 `navigationStyle: custom`）的页面都应
 * 调用 `getNavbarLayout()` 拿到统一布局参数，**不要各自计算**，避免误差与重复代码。
 *
 * 典型用法：
 * ```vue
 * <view class="navbar">
 *   <view class="navbar__status" :style="{ height: nav.statusBarHeight + 'px' }" />
 *   <view class="navbar__inner" :style="{ height: nav.contentHeight + 'px' }">
 *     <view class="navbar__left" />
 *     <view class="navbar__right" :style="{ marginRight: nav.rightSafeArea + 'px' }" />
 *   </view>
 * </view>
 *
 * <script setup>
 * import { getNavbarLayout } from '@/utils/navbar'
 * const nav = getNavbarLayout()
 * </script>
 * ```
 *
 * 数值单位统一为 px（微信 `getSystemInfoSync` 与 `getMenuButtonBoundingClientRect` 返回
 * 的都是逻辑像素 px；自定义 NavBar 的高度用 px 而非 rpx，才能与系统胶囊严格对齐）。
 */

/** 胶囊位置信息（仅 mp-weixin 有；其它平台为 null） */
export interface MenuButtonRect {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface NavbarLayout {
  /** 系统状态栏高度（px） */
  statusBarHeight: number
  /** NavBar 内容区高度（px）—— mp-weixin 下与胶囊对齐，其它平台 fallback 44 */
  contentHeight: number
  /** NavBar 整体高度（px）= statusBarHeight + contentHeight */
  totalHeight: number
  /**
   * 右侧需要避让的距离（px）—— mp-weixin 下让开胶囊；其它平台为 0。
   * 给 NavBar 右侧元素设置 `margin-right: rightSafeArea + 'px'` 即可。
   */
  rightSafeArea: number
  /** 胶囊按钮矩形（仅 mp-weixin 有） */
  menuButton: MenuButtonRect | null
}

/** 非 mp-weixin 平台的默认内容区高度，对齐 iOS 导航栏标准 44pt */
const DEFAULT_CONTENT_HEIGHT = 44

/** 基础库拿不到胶囊时的兜底右侧避让（经验值：胶囊宽 87 + 右边距 7 + 呼吸 8 ≈ 100） */
const FALLBACK_RIGHT_SAFE_AREA = 100

/**
 * 进程内缓存：NavBar 布局在 App 生命周期里不会变，计算一次即可。
 * 主题切换、路由跳转都不应触发重算。
 */
let cached: NavbarLayout | null = null

/**
 * 获取 NavBar 布局参数（带缓存）。
 * 首次调用会读取系统信息与胶囊位置，之后直接复用结果。
 */
export function getNavbarLayout(): NavbarLayout {
  if (cached) return cached

  let statusBarHeight = 0
  try {
    statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0
  } catch {
    statusBarHeight = 0
  }

  let contentHeight = DEFAULT_CONTENT_HEIGHT
  let rightSafeArea = 0
  let menuButton: MenuButtonRect | null = null

  // #ifdef MP-WEIXIN
  try {
    const menu = uni.getMenuButtonBoundingClientRect()
    // 胶囊上边距状态栏底的距离 = menu.top - statusBarHeight
    // 让 NavBar 内容区上下各留一份相同 gap，实现胶囊垂直居中
    const gap = Math.max(0, menu.top - statusBarHeight)
    contentHeight = Math.max(DEFAULT_CONTENT_HEIGHT, menu.height + gap * 2)

    // 右侧避让：从屏幕右侧退到胶囊左边缘，再留 8px 呼吸
    const windowWidth = uni.getSystemInfoSync().windowWidth
    rightSafeArea = Math.max(0, windowWidth - menu.left + 8)

    menuButton = {
      top: menu.top,
      left: menu.left,
      right: menu.right,
      bottom: menu.bottom,
      width: menu.width,
      height: menu.height,
    }
  } catch {
    // 基础库异常 / 模拟器：走兜底
    rightSafeArea = FALLBACK_RIGHT_SAFE_AREA
  }
  // #endif

  cached = {
    statusBarHeight,
    contentHeight,
    totalHeight: statusBarHeight + contentHeight,
    rightSafeArea,
    menuButton,
  }
  return cached
}

/**
 * 清除缓存，强制下次 `getNavbarLayout()` 重新计算。
 * 一般只在测试场景用到；正常业务流程不需要调用。
 */
export function resetNavbarLayoutCache(): void {
  cached = null
}
