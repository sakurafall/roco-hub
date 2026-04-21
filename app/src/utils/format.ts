import dayjs from 'dayjs'

export function formatDate(value: string | number | Date | undefined, pattern = 'YYYY-MM-DD'): string {
  if (!value) return ''
  return dayjs(value).format(pattern)
}

export function formatDateTime(value: string | number | Date | undefined): string {
  return formatDate(value, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 把数字千分位化，主要用于详情页种族值合计等展示场景。
 */
export function formatNumber(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(n)) return '-'
  return n.toLocaleString('zh-CN')
}
