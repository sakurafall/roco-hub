import { computed, reactive, ref } from 'vue'
import { spiritService } from '@/http/services/spirit.service'
import type { SpiritSummary } from '@/types/spirit'
import type {
  FilterGroupKey,
  FilterOption,
  FilterSection,
  FilterSelection,
} from '@/types/spirit-filter'

/**
 * 把单只精灵投射到某个 group 上的"实际取值集合"。
 * - group=1: spirit_type （单值）
 * - group=2: elements （多值）
 * - group=4: form_param4 （单值）
 * - group=5: form_param5 （单值）
 * - group=6: shiny     （单值，"是" / "否"）
 */
function pickGroupValues(s: SpiritSummary, group: FilterGroupKey): string[] {
  switch (group) {
    case '1':
      return s.spiritType ? [s.spiritType] : []
    case '2':
      return (s.types as unknown as string[]) ?? []
    case '4':
      return s.formParam4 ? [s.formParam4] : []
    case '5':
      return s.formParam5 ? [s.formParam5] : []
    case '6':
      return s.shinyLabel ? [s.shinyLabel] : []
    default:
      return []
  }
}

/**
 * 精灵筛选状态 + 匹配器。
 * - 同一 group 内多个选中 → OR
 * - 不同 group 之间 → AND
 */
export function useSpiritFilters() {
  const sections = ref<FilterSection[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 选中状态：group → values[]，使用 reactive 让模板里能直接 v-model
  const selection = reactive<FilterSelection>({})

  async function loadSections() {
    loading.value = true
    error.value = null
    try {
      sections.value = await spiritService.realFilters()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      // 接口失败时回落到本地 mock，至少保证筛选 UI 可用
      sections.value = spiritService.__mockFilters()
    } finally {
      loading.value = false
    }
  }

  function isSelected(group: FilterGroupKey, value: string): boolean {
    return selection[group]?.includes(value) ?? false
  }

  function toggle(group: FilterGroupKey, value: string) {
    const current = selection[group] ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    if (next.length === 0) delete selection[group]
    else selection[group] = next
  }

  function setExclusive(group: FilterGroupKey, value: string | null) {
    if (value === null) delete selection[group]
    else selection[group] = [value]
  }

  function clearGroup(group: FilterGroupKey) {
    delete selection[group]
  }

  function clearAll() {
    for (const k of Object.keys(selection) as FilterGroupKey[]) delete selection[k]
  }

  /** 当前选中的扁平化标签列表，用于"已选筛选条件"行展示 */
  const activeTags = computed<{ group: FilterGroupKey; value: string; label: string }[]>(() => {
    const tags: { group: FilterGroupKey; value: string; label: string }[] = []
    for (const section of sections.value) {
      const picked = selection[section.group] ?? []
      for (const value of picked) {
        const opt = section.options.find((o) => o.value === value)
        tags.push({ group: section.group, value, label: opt?.label ?? value })
      }
    }
    return tags
  })

  const activeCount = computed(() =>
    Object.values(selection).reduce<number>((sum, arr) => sum + (arr?.length ?? 0), 0),
  )

  /** 把"属性"(group=2) section 单独拎出来给顶部快捷栏用 */
  const elementSection = computed<FilterSection | undefined>(() =>
    sections.value.find((s) => s.group === '2'),
  )

  /**
   * 抽屉里完整展示所有 sections（含 18 个属性）。
   * 顶部快捷栏只是属性的"高频前 N 个"，全量入口在抽屉里，避免用户看不到剩下的属性。
   */
  const drawerSections = computed<FilterSection[]>(() => sections.value)

  /** 单条匹配函数：传入精灵，返回是否通过当前所有筛选 */
  function matches(s: SpiritSummary): boolean {
    for (const groupKey of Object.keys(selection) as FilterGroupKey[]) {
      const wanted = selection[groupKey] ?? []
      if (wanted.length === 0) continue
      const actual = pickGroupValues(s, groupKey)
      // group 内 OR：任一选中值出现在精灵字段里即可
      const hit = wanted.some((w) => actual.includes(w))
      if (!hit) return false
    }
    return true
  }

  /** 找到属性 group 中的某个 option（用于在顶部快捷栏点击时取 value） */
  function findElementOption(label: string): FilterOption | undefined {
    return elementSection.value?.options.find((o) => o.label === label || o.value === label)
  }

  return {
    sections,
    loading,
    error,
    selection,
    activeTags,
    activeCount,
    elementSection,
    drawerSections,
    loadSections,
    isSelected,
    toggle,
    setExclusive,
    clearGroup,
    clearAll,
    matches,
    findElementOption,
  }
}
