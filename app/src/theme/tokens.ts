/**
 * 主题 Token 类型定义。
 * MVP-A 仅落地颜色与圆角，后续可扩展字号、阴影、渐变等。
 */

export interface ThemeTokens {
  colorBg: string
  colorBgElevated: string
  colorPrimary: string
  colorPrimarySoft: string
  colorAccent: string
  colorText: string
  colorTextSecondary: string
  colorBorder: string
  radiusSm: string
  radiusMd: string
  radiusLg: string
  shadowCard: string
}

export interface ThemeManifest {
  name: string
  label: string
  tokens: ThemeTokens
  navBg: string
  navTextStyle: 'black' | 'white'
}

/**
 * Token 名称到 CSS 变量名的映射，统一在 engine 中使用。
 */
export const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  colorBg: '--color-bg',
  colorBgElevated: '--color-bg-elevated',
  colorPrimary: '--color-primary',
  colorPrimarySoft: '--color-primary-soft',
  colorAccent: '--color-accent',
  colorText: '--color-text',
  colorTextSecondary: '--color-text-secondary',
  colorBorder: '--color-border',
  radiusSm: '--radius-sm',
  radiusMd: '--radius-md',
  radiusLg: '--radius-lg',
  shadowCard: '--shadow-card',
}
