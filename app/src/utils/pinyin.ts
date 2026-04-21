import { pinyin } from 'pinyin-pro'

/**
 * 把中文转成不带音调的连续拼音字符串，便于本地搜索时做模糊匹配。
 * 例：'迪莫' -> 'dimo'
 */
export function toPinyin(text: string): string {
  if (!text) return ''
  return pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase()
}

/**
 * 返回首字母拼接，例：'迪莫' -> 'dm'
 */
export function toPinyinInitial(text: string): string {
  if (!text) return ''
  return pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase()
}
