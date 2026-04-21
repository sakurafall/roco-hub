/**
 * 精灵筛选项相关类型，对应后端 GET /api/spirit/filters 当前返回结构。
 *
 * 后端返回示例：
 * {
 *   sections: [
 *     {
 *       section_key: "sec_xxx",
 *       section_title: "精灵类型",
 *       options: [
 *         { id, group: "1", label: "Ⅰ阶", data_option: "1|Ⅰ阶", data_reverse: "false", icon_url: "" },
 *         ...
 *       ]
 *     }
 *   ]
 * }
 *
 * data_option 形如 "group|value"，用于 (a) 后端筛选传参；(b) 前端本地匹配。
 * data_reverse 是字符串的 "true" / "false"，目前仅作为字段保留，前端匹配按"包含"语义即可。
 */

export type FilterGroupKey =
  | '1' // 精灵类型 / 形态阶段（Ⅰ阶 / Ⅱ阶 / 最终形态 等）
  | '2' // 精灵属性（草/火/水/光/...）
  | '4' // 地区形态
  | '5' // 首领形态
  | '6' // 异色

export interface RawFilterOption {
  id: number
  group: string
  label: string
  data_option: string
  data_reverse: string
  icon_url: string
}

export interface RawFilterSection {
  section_key: string
  section_title: string
  options: RawFilterOption[]
}

export interface RawFilterListResp {
  sections: RawFilterSection[]
}

/** 前端使用的筛选选项（已 normalize） */
export interface FilterOption {
  /** 后端原始 id */
  id: number
  /** 分组 key（解析自 group 字段） */
  group: FilterGroupKey
  /** 选项展示文案 */
  label: string
  /** 选项的实际匹配值（解析自 data_option 第二段） */
  value: string
  /** 后端预留：true 表示"反选"语义，前端目前按正向"等于/包含"匹配 */
  reverse: boolean
  /** 图标 URL（属性分组才有） */
  iconUrl?: string
}

export interface FilterSection {
  key: string
  title: string
  group: FilterGroupKey
  options: FilterOption[]
}

/** 当前选中状态：group → 选中的 value 列表 */
export type FilterSelection = Partial<Record<FilterGroupKey, string[]>>

/** 排序枚举（MVP-A 后端没给排序字段，先支持编号） */
export type SpiritSortKey = 'no_asc' | 'no_desc'
