/**
 * 简易防抖 / 节流，覆盖搜索框输入等场景。
 */

export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait = 300): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  const wrapped = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...(args as unknown[]))
      timer = null
    }, wait)
  }
  return wrapped as unknown as T
}

export function throttle<T extends (...args: unknown[]) => void>(fn: T, wait = 300): T {
  let last = 0
  const wrapped = (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn(...(args as unknown[]))
    }
  }
  return wrapped as unknown as T
}
