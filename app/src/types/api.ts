/**
 * 统一的 API 信封 / 分页类型，源于 docs/06 §3.3 / §3.4
 */

export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  requestId?: string
}

export interface Paginated<T> {
  list: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface PageQuery {
  page?: number
  pageSize?: number
}

export interface DataVersionMeta {
  global: string
  publishedAt: string
  baseUrl: string
  modules: Record<string, { file: string; etag: string; size: number }>
}

export interface FeatureFlags {
  [key: string]: boolean
}
