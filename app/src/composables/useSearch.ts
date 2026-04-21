import { ref } from 'vue'
import type { SpiritSummary } from '@/types/spirit'
import { toPinyin, toPinyinInitial } from '@/utils/pinyin'

/**
 * 本地搜索（前端在内存里过 spirits 列表）。
 * MVP-A 仅按"中文名 + 拼音 + 首字母"匹配，命中即返回，无相关性排序。
 * 真实数据上来后可在此扩展模糊匹配权重。
 */
export function useSearch(source: () => SpiritSummary[]) {
  const keyword = ref('')
  const results = ref<SpiritSummary[]>([])

  function search(q: string) {
    keyword.value = q
    const k = q.trim().toLowerCase()
    if (!k) {
      results.value = []
      return
    }
    const all = source()
    results.value = all.filter((s) => {
      if (s.name.includes(q)) return true
      if (toPinyin(s.name).includes(k)) return true
      if (toPinyinInitial(s.name).includes(k)) return true
      return s.slug.includes(k)
    })
  }

  return { keyword, results, search }
}
