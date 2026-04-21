import { computed, ref } from 'vue'
import type { SpiritSummary } from '@/types/spirit'
import type { SpiritSortKey } from '@/types/spirit-filter'
import { useSpirits } from './useSpirits'
import { useSpiritFilters } from './useSpiritFilters'
import { toPinyin, toPinyinInitial } from '@/utils/pinyin'

/**
 * 图鉴列表页核心组合：
 * - 数据：useSpirits 拉真实接口（接口失败回落 mock）
 * - 筛选：useSpiritFilters 提供 sections / selection / matches
 * - 搜索：本地多策略匹配（名称包含 / 编号包含 / 拼音全拼 / 拼音首字母）
 * - 排序：编号升/降（其他维度等后端补完字段后扩）
 */
export function useSpiritList() {
  const { spirits, total, loading, error, load } = useSpirits()
  const filters = useSpiritFilters()

  const keyword = ref('')
  const sort = ref<SpiritSortKey>('no_asc')

  /** 给每只精灵预算一次拼音，避免每次输入都重算 */
  const pinyinIndex = computed(() => {
    const map = new Map<string, { full: string; initial: string }>()
    for (const s of spirits.value) {
      map.set(s.id, {
        full: toPinyin(s.name),
        initial: toPinyinInitial(s.name),
      })
    }
    return map
  })

  function matchKeyword(s: SpiritSummary, kw: string): boolean {
    if (!kw) return true
    const lower = kw.toLowerCase().trim()
    if (!lower) return true
    if (s.name.toLowerCase().includes(lower)) return true
    if (String(s.no).padStart(3, '0').includes(lower)) return true
    const py = pinyinIndex.value.get(s.id)
    if (py) {
      if (py.full.includes(lower)) return true
      if (py.initial.includes(lower)) return true
    }
    return false
  }

  const filteredSpirits = computed<SpiritSummary[]>(() => {
    const out: SpiritSummary[] = []
    for (const s of spirits.value) {
      if (!filters.matches(s)) continue
      if (!matchKeyword(s, keyword.value)) continue
      out.push(s)
    }
    out.sort((a, b) => (sort.value === 'no_asc' ? a.no - b.no : b.no - a.no))
    return out
  })

  const filteredCount = computed(() => filteredSpirits.value.length)

  /** 是否处于"有筛选/搜索"状态（用于"清除全部"按钮露出） */
  const hasAnyFilter = computed(
    () => filters.activeCount.value > 0 || keyword.value.trim().length > 0,
  )

  function clearKeyword() {
    keyword.value = ''
  }

  function clearAll() {
    filters.clearAll()
    keyword.value = ''
  }

  async function init() {
    // 并行拉数据 + 筛选项配置
    await Promise.all([load(), filters.loadSections()])
  }

  return {
    // 数据
    spirits,
    total,
    loading,
    error,
    filteredSpirits,
    filteredCount,
    // 搜索
    keyword,
    clearKeyword,
    // 排序
    sort,
    // 筛选
    filters,
    hasAnyFilter,
    clearAll,
    // 操作
    init,
    reload: load,
  }
}
