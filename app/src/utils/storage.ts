/**
 * 对 uni storage API 的同步包装，统一带前缀避免与第三方 key 冲突。
 */
const PREFIX = 'loka:'

export const storage = {
  get<T = unknown>(key: string, fallback?: T): T | undefined {
    try {
      const raw = uni.getStorageSync(PREFIX + key)
      if (raw === '' || raw === null || raw === undefined) return fallback
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) as T
        } catch {
          return raw as unknown as T
        }
      }
      return raw as T
    } catch {
      return fallback
    }
  },

  set(key: string, value: unknown): void {
    try {
      const v = typeof value === 'string' ? value : JSON.stringify(value)
      uni.setStorageSync(PREFIX + key, v)
    } catch {
      // ignore
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(PREFIX + key)
    } catch {
      // ignore
    }
  },
}
