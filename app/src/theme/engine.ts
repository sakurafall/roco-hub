import { TOKEN_TO_CSS_VAR, type ThemeManifest, type ThemeTokens } from './tokens'
import themeA from './manifests/theme-a.json'
import themeB from './manifests/theme-b.json'
import themeC from './manifests/theme-c.json'

const manifests: Record<string, ThemeManifest> = {
  themeC: themeC as ThemeManifest,
  themeA: themeA as ThemeManifest,
  themeB: themeB as ThemeManifest,
}

let currentManifest: ThemeManifest = manifests.themeC

/**
 * 把 Token 序列化成 CSS variable 声明片段，
 * 既可注入到 H5 的 :root，也可作为小程序页面根容器的 inline style。
 *
 * 例：'--color-bg: #FFF; --color-primary: #2F6BFF;'
 */
export function buildCssVarStyle(tokens: ThemeTokens): string {
  return (Object.keys(tokens) as Array<keyof ThemeTokens>)
    .map((key) => `${TOKEN_TO_CSS_VAR[key]}: ${tokens[key]};`)
    .join(' ')
}

/**
 * 应用主题：
 * - H5：直接写入 documentElement 的 style，全局生效
 * - 小程序：CSS 变量需要在节点上声明，因此提供 buildCssVarStyle 让页面根容器引用
 *   并通过 setNavigationBarColor 同步顶部栏配色
 */
export function applyTheme(name: string): ThemeManifest {
  const manifest = manifests[name] ?? manifests.themeC
  currentManifest = manifest

  // #ifdef H5
  if (typeof document !== 'undefined' && document.documentElement) {
    const root = document.documentElement
    const tokens = manifest.tokens
    ;(Object.keys(tokens) as Array<keyof ThemeTokens>).forEach((key) => {
      root.style.setProperty(TOKEN_TO_CSS_VAR[key], tokens[key])
    })
    root.dataset.theme = manifest.name
  }
  // #endif

  // 同步导航栏（小程序与 H5 都生效）
  try {
    uni.setNavigationBarColor({
      frontColor: manifest.navTextStyle === 'white' ? '#ffffff' : '#000000',
      backgroundColor: manifest.navBg,
    })
  } catch {
    // 某些平台/页面初始化前调用会报错，吞掉
  }

  return manifest
}

export function getCurrentManifest(): ThemeManifest {
  return currentManifest
}

export function listAvailableThemes(): ThemeManifest[] {
  return Object.values(manifests)
}
