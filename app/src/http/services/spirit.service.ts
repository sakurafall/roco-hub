import { request } from '../request'
import { Endpoints } from '../endpoints'
import type { Paginated, PageQuery } from '@/types/api'
import type { Spirit, SpiritSummary, SpiritType, TrustLevel } from '@/types/spirit'
import type {
  FilterGroupKey,
  FilterOption,
  FilterSection,
  RawFilterListResp,
  RawFilterOption,
  RawFilterSection,
} from '@/types/spirit-filter'
// mock 文件保持与后端真实接口完全同构（含 code/data 信封），便于离线/CI 场景
import mockSpiritsRaw from '@/../mock/spirits.json'
import mockFiltersRaw from '@/../mock/spirit-filters.json'

export interface SpiritListQuery extends PageQuery {
  types?: SpiritType[]
  form?: 'normal' | 'shiny' | 'glory'
  eggGroup?: string
  season?: string
  sort?: 'no' | 'name' | 'stats_total' | 'hp' | 'atk' | 'def' | 'matk' | 'mdef' | 'spd'
  order?: 'asc' | 'desc'
  q?: string
}

/**
 * 真实后端目前返回的精灵原始结构（snake_case + 中文枚举）。
 * 与 docs/06 §4.2 的目标契约存在差异，待后端收敛后下掉这层映射。
 */
export interface RawSpirit {
  slug: string
  name: string
  number: string // "NO.001"
  spirit_type: string // "最终形态" / "Ⅰ阶" / "Ⅱ阶" 等
  elements: string[] // ["光"]
  element_detail: { name: string; icon_url: string }[]
  element_sub: string
  form_param4: string
  form_param5: string
  shiny: string // "否" / "是"
  cover_image: string
}

export interface RawSpiritListResp {
  count: number
  list: RawSpirit[]
}

/** 把后端 number "NO.001" 抽成 1；解析失败则用顺序索引兜底 */
function parseNo(raw: string, fallback: number): number {
  const m = /\d+/.exec(raw ?? '')
  return m ? Number(m[0]) : fallback
}

/** 把单条原始数据映射成前端通用 SpiritSummary */
export function mapRawSpirit(raw: RawSpirit, index: number): SpiritSummary {
  const no = parseNo(raw.number, index + 1)
  // 优先用 element_detail（含 icon），缺则回落到 elements
  const detail = raw.element_detail ?? []
  const typeNames: string[] =
    detail.length > 0 ? detail.map((d) => d.name).filter(Boolean) : (raw.elements ?? [])
  const typeIcons: string[] =
    detail.length > 0 ? detail.map((d) => d.icon_url).filter(Boolean) : []
  return {
    id: raw.slug || `idx-${index}`,
    no,
    slug: raw.slug,
    name: raw.name,
    // 后端返回的是中文 element 名称，不在 SpiritType 字面量集合内，
    // 这里直接做断言透传，UI 仅用于展示，真实的属性枚举对齐留到后端切换契约后处理。
    types: typeNames as unknown as SpiritType[],
    typeIcons,
    statsTotal: 0,
    rarity: undefined,
    trustLevel: 'community' as TrustLevel,
    thumbnail: raw.cover_image,
    spiritType: raw.spirit_type,
    formParam4: raw.form_param4,
    formParam5: raw.form_param5,
    shinyLabel: raw.shiny,
  }
}

/** 解析 data_option 形如 "group|value" */
function parseDataOption(input: string): { group: string; value: string } {
  const idx = (input ?? '').indexOf('|')
  if (idx < 0) return { group: '', value: input ?? '' }
  return { group: input.slice(0, idx), value: input.slice(idx + 1) }
}

function mapRawFilterOption(raw: RawFilterOption): FilterOption {
  const parsed = parseDataOption(raw.data_option)
  return {
    id: raw.id,
    group: (parsed.group || raw.group) as FilterGroupKey,
    label: raw.label,
    value: parsed.value || raw.label,
    reverse: raw.data_reverse === 'true',
    iconUrl: raw.icon_url || undefined,
  }
}

function mapRawFilterSection(raw: RawFilterSection): FilterSection {
  const options = (raw.options ?? []).map(mapRawFilterOption)
  // 取首个 option 的 group 作为整段 section 的 group（同 section 内 group 一致）
  const group = (options[0]?.group ?? '1') as FilterGroupKey
  return {
    key: raw.section_key,
    title: raw.section_title,
    group,
    options,
  }
}

export const spiritService = {
  list(params: SpiritListQuery): Promise<Paginated<SpiritSummary>> {
    return request.get<Paginated<SpiritSummary>>(Endpoints.spirits, { params })
  },

  detail(id: string): Promise<Spirit> {
    return request.get<Spirit>(Endpoints.spiritDetail(id))
  },

  search(q: string, limit = 20): Promise<SpiritSummary[]> {
    return request.get<SpiritSummary[]>(Endpoints.spiritSearch, { params: { q, limit } })
  },

  /**
   * 接入"当前真实后端"的精灵图鉴列表。
   * - URL：/api/spirit/list（与 docs/06 §4.2 的 /v1/spirits 不同，后端收敛后再切回）
   * - 已对返回做映射，输出仍是前端统一 SpiritSummary
   */
  async realList(): Promise<Paginated<SpiritSummary>> {
    const data = await request.get<RawSpiritListResp>(Endpoints.realSpiritList)
    const list = (data?.list ?? []).map(mapRawSpirit)
    return {
      list,
      page: 1,
      pageSize: list.length,
      total: data?.count ?? list.length,
      hasMore: false,
    }
  },

  /**
   * 接入"当前真实后端"的精灵筛选项配置。
   * - URL：/api/spirit/filters
   * - 已 normalize 成前端友好结构（解 data_option / 拆 group）
   */
  async realFilters(): Promise<FilterSection[]> {
    const data = await request.get<RawFilterListResp>(Endpoints.realSpiritFilters)
    return (data?.sections ?? []).map(mapRawFilterSection)
  },

  /**
   * 接口失败时的离线兜底：直接读 mock/spirit-filters.json。
   * mock 文件结构与 /api/spirit/filters 完全同构，走与 realFilters 相同的映射逻辑。
   */
  __mockFilters(): FilterSection[] {
    const data = (mockFiltersRaw as { data?: RawFilterListResp }).data
    return (data?.sections ?? []).map(mapRawFilterSection)
  },

  /**
   * 接口失败时的离线兜底：直接读 mock/spirits.json。
   * mock 文件结构与后端 /api/spirit/list 完全同构（含 code/data 信封），
   * 因此走与 realList 相同的 mapRawSpirit 映射，保证两条路径产出 100% 一致。
   */
  __mockList(): Paginated<SpiritSummary> {
    const data = (mockSpiritsRaw as { data?: RawSpiritListResp }).data
    const list = (data?.list ?? []).map(mapRawSpirit)
    return {
      list,
      page: 1,
      pageSize: list.length,
      total: data?.count ?? list.length,
      hasMore: false,
    }
  },
}
