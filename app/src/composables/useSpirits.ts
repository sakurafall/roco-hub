import { ref } from 'vue'
import type { SpiritSummary } from '@/types/spirit'
import { spiritService } from '@/http/services/spirit.service'

/**
 * 精灵列表访问 composable。
 * 现状：
 *   - load()      → 真实后端 /api/spirit/list（一次拉全 465 条）
 *   - __loadMock() → 离线兜底（本地 mock JSON）
 * 后端契约对齐到 docs/06 后，把 load() 切回 spiritService.list({ page, pageSize })
 */
export function useSpirits() {
  const spirits = ref<SpiritSummary[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function __loadMock() {
    const res = spiritService.__mockList()
    spirits.value = res.list
    total.value = res.total
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await spiritService.realList()
      spirits.value = res.list
      total.value = res.total
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      // 网络/接口失败时回落到本地 mock，保证页面不空
      __loadMock()
    } finally {
      loading.value = false
    }
  }

  return { spirits, total, loading, error, load, __loadMock }
}
