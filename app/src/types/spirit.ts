/**
 * 精灵相关核心类型，源于 docs/02-data-model-and-scope.md
 * MVP-A 阶段仅引入页面/服务直接需要的子集，避免一次性铺满所有字段。
 */

export type SpiritType =
  | 'normal'
  | 'grass'
  | 'fire'
  | 'water'
  | 'light'
  | 'earth'
  | 'ice'
  | 'dragon'
  | 'electric'
  | 'poison'
  | 'bug'
  | 'martial'
  | 'wing'
  | 'cute'
  | 'ghost'
  | 'dark'
  | 'mech'
  | 'illusion'

export type EggGroupId =
  | 'giant'
  | 'biped'
  | 'insect'
  | 'sky'
  | 'animal'
  | 'magic'
  | 'plant'
  | 'human'
  | 'soft'
  | 'earth'
  | 'magic_v2'
  | 'ocean'
  | 'dragon'
  | 'mech'
  | 'unknown'

export type TrustLevel = 'authoritative' | 'verified' | 'community' | 'needs_review'

export interface SourceRef {
  kind: 'official' | 'wiki' | 'community' | 'self'
  label: string
  url?: string
  fetchedAt: string
}

export interface SpiritStats {
  hp: number
  atk: number
  def: number
  matk: number
  mdef: number
  spd: number
}

export interface SpiritImages {
  thumbnail: string
  portrait: string
  icon: string
}

/**
 * 列表/卡片场景的精灵摘要（与服务端 list 接口返回字段对齐）
 */
export interface SpiritSummary {
  id: string
  no: number
  slug: string
  name: string
  types: SpiritType[]
  /** 与 types 一一对应的属性图标 URL（来自后端 element_detail） */
  typeIcons?: string[]
  statsTotal: number
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  trustLevel: TrustLevel
  thumbnail: string
  /**
   * 以下为"当前真实后端"的额外原始字段，用于前端本地筛选匹配。
   * 后端契约切到 docs/06 §4.2 的标准字段（form/shiny/season）后可下掉。
   */
  spiritType?: string // group=1：Ⅰ阶 / Ⅱ阶 / 最终形态 等
  formParam4?: string // group=4：地区形态 / 原始形态
  formParam5?: string // group=5：首领形态 / 原始形态
  shinyLabel?: string // group=6：是 / 否
}

/**
 * 完整精灵实体（详情页所需）
 */
export interface Spirit extends SpiritSummary {
  aliases: string[]
  hiddenType?: SpiritType
  formId?: string
  baseFormId?: string
  formLabel?: string
  stats: SpiritStats
  size: number
  weight: number
  sizeRange?: { min: number; max: number }
  weightRange?: { min: number; max: number }
  eggGroups: EggGroupId[]
  hatchStepsBase?: number
  evolutionChainId?: string
  evolvesFrom?: string
  description: string
  loreLong?: string
  images: SpiritImages
  abilities?: { primary: string; hidden?: string }
  season?: string
  isHidden?: boolean
  sources: SourceRef[]
  lastVerifiedAt: string
  dataVersion: string
  createdAt: string
  updatedAt: string
}

export interface TypeMatchupRow {
  attacker: SpiritType
  defender: SpiritType
  multiplier: 0 | 0.25 | 0.5 | 1 | 1.5 | 2 | 2.5
  note?: string
}

export interface EggGroup {
  id: EggGroupId
  name: string
  description: string
  memberSpiritIds: string[]
  canBreedWith?: EggGroupId[]
}

export interface HatchPredictInput {
  size: number
  weight: number
}

export interface HatchCandidate {
  spiritId: string
  spiritNo: number
  spiritName: string
  confidence: number
  reason: string
  thumbnail?: string
}
