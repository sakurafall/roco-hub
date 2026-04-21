import { getConfig } from '@/config'
import { APP_VERSION } from '@/config'
import { getPlatform, uuid } from '@/utils/env'
import { useUserStore } from '@/stores/user'
import { useDataStore } from '@/stores/data'
import { BizError, NetworkError } from './errors'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RequestOptions {
  // 接受任意可枚举对象，内部按 Record<string, unknown> 处理
  params?: object
  headers?: Record<string, string>
  timeout?: number
  /** 直接传完整 URL 时（如已包含 http:// 前缀），跳过 baseURL 拼接 */
  absolute?: boolean
}

const config = getConfig()

function joinQuery(params: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }
  }
  return parts.join('&')
}

function buildUrl(path: string, params?: object, absolute?: boolean): string {
  let url = path.startsWith('http') || absolute ? path : config.apiBaseUrl.replace(/\/$/, '') + path
  if (params) {
    const qs = joinQuery(params as Record<string, unknown>)
    if (qs) url += (url.includes('?') ? '&' : '?') + qs
  }
  return url
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const userStore = useUserStore()
  const dataStore = useDataStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Channel': getPlatform(),
    'X-App-Version': APP_VERSION,
    'X-Device-Id': userStore.deviceId,
    'X-Request-Id': uuid(),
    'X-Data-Version': dataStore.version,
    'X-Ts': String(Date.now()),
  }
  const token = userStore.accessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (extra) Object.assign(headers, extra)
  return headers
}

interface UniRequestSuccessResult {
  data: unknown
  statusCode: number
  header?: Record<string, string>
}

interface UniRequestFailResult {
  errMsg: string
  errno?: number
}

/**
 * 统一发送请求；
 * 1. 走 uni.request（双端通用，无需额外 adapter）
 * 2. 解信封 { code, message, data }
 *    - 兼容真实后端目前的 { code, data } 形态（无 message 字段）
 * 3. 401 类业务码留分支占位（后端就绪后接 refresh / silentLogin 重放）
 */
function send<T>(method: HttpMethod, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const url = buildUrl(path, options?.params, options?.absolute)
  const headers = buildHeaders(options?.headers)
  const timeout = options?.timeout ?? config.requestTimeoutMs

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url,
      method,
      data: body as never,
      header: headers,
      timeout,
      success(res: UniRequestSuccessResult) {
        const raw = res.data
        // 1. 业务信封
        if (raw && typeof raw === 'object' && 'code' in (raw as Record<string, unknown>)) {
          const env = raw as { code: number; message?: string; data?: unknown; requestId?: string }
          if (env.code === 0) return resolve(env.data as T)
          if (env.code === 40101 || env.code === 40102 || env.code === 40103) {
            return reject(new BizError(env.code, env.message ?? 'auth required', env.requestId))
          }
          return reject(new BizError(env.code ?? -1, env.message ?? 'unknown', env.requestId))
        }
        // 2. 非信封响应（兜底）
        resolve(raw as T)
      },
      fail(err: UniRequestFailResult) {
        reject(new NetworkError(err?.errMsg ?? 'network error', err))
      },
    })
  })
}

export const request = {
  get<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return send<T>('GET', url, undefined, options)
  },
  post<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return send<T>('POST', url, data, options)
  },
  put<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return send<T>('PUT', url, data, options)
  },
  delete<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return send<T>('DELETE', url, undefined, options)
  },
}

export default request
