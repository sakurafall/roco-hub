# 02 · 数据模型、首批范围、版本号与可信标签规范

> 数据是这个产品的第一资产。本文件定义"数据长什么样、从哪来、怎么更新、怎么让用户信"。

---

## 一、数据分类总览

| 分类 | 代表实体 | MVP-A 覆盖 | 数据性质 | 授权风险 |
|---|---|---|---|---|
| **资料型** | 精灵、技能、道具、蛋组、属性克制 | 精灵（首批150-200）、属性克制 | 事实型 | 低（有来源标注即可） |
| **规则型** | 孵蛋规则、克制倍率、努力值公式 | 孵蛋V1 + 克制 | 事实型 | 低 |
| **视觉型** | 立绘、图标、地图 | 精灵立绘（自绘或待授权） | 视觉 | 高（见 `05-data-license`） |
| **表达型** | 文案介绍、攻略、社区帖 | 一句话介绍（自写） | 创作 | 中-高 |
| **动态型** | 远行商人、兑换码、活动、赛季 | （MVP-A 不做） | 时效数据 | 低 |
| **用户型** | 收藏、历史、登录态、埋点 | 收藏 + 历史 + 静默登录 | UGC/隐私 | 高（合规） |

---

## 二、核心数据模型

### 2.1 Spirit（精灵）

```typescript
/**
 * 精灵 · 核心实体
 * @source 参考 WIKI + 自整理；字段级来源见 sourceMap
 * @version 跟随全局数据版本号
 */
interface Spirit {
  // ===== 标识 =====
  id: string;              // 内部主键，UUID v4
  no: number;              // 图鉴编号（官方编号）
  slug: string;            // 英文/拼音 slug，如 "dimo"，用于 URL

  // ===== 名称 =====
  name: string;            // 中文名，如 "迪莫"
  nameZhTw?: string;       // 繁中名（预留）
  nameEn?: string;         // 英文名（预留）
  aliases: string[];       // 异名/俗称，如 ["小蓝", "电系之王"]

  // ===== 属性 =====
  types: SpiritType[];     // 1~2 个属性
  hiddenType?: SpiritType; // 隐藏属性（如有）

  // ===== 形态 =====
  formId?: string;         // 形态ID（如异色/光辉/幻色形态）
  baseFormId?: string;     // 若为变体，指向基础形态
  formLabel?: string;      // 形态标签，如 "圣光"、"异色"

  // ===== 种族值 =====
  stats: {
    hp: number;           // 生命
    atk: number;          // 物攻
    def: number;          // 物防
    matk: number;         // 魔攻
    mdef: number;         // 魔防
    spd: number;          // 速度
  };
  statsTotal: number;     // 六维总和，冗余字段便于排序

  // ===== 体型 =====
  size: number;           // 身高/尺寸，单位：米（m），保留 2 位小数
  weight: number;         // 体重，单位：千克（kg），保留 1 位小数
  sizeRange?: {           // 尺寸浮动范围（若有）
    min: number;
    max: number;
  };
  weightRange?: {
    min: number;
    max: number;
  };

  // ===== 蛋组 =====
  eggGroups: EggGroupId[];      // 所属蛋组（1~2 个）
  hatchStepsBase?: number;      // 基础孵化步数（若文档记录有）

  // ===== 进化链 =====
  evolutionChainId?: string;    // 进化链 ID（属于哪条链）
  evolvesFrom?: string;         // 前一阶 spiritId
  evolvesTo?: Evolution[];      // 后续进化分支

  // ===== 资料 =====
  description: string;          // 一句话介绍（≤ 60 字，自写）
  loreLong?: string;            // 背景故事（可选，MVP-A 不做）

  // ===== 视觉资源 =====
  images: {
    thumbnail: string;   // 列表缩略图 · WebP · 200x200
    portrait: string;    // 详情立绘 · WebP · 600x600
    icon: string;        // 迷你图标 · PNG · 64x64
  };

  // ===== 技能（MVP-A 只放引用ID，技能图鉴在 MVP-B） =====
  learnableSkillIds?: string[];

  // ===== 能力 =====
  abilities?: {
    primary: string;
    hidden?: string;
  };

  // ===== 稀有度与场景 =====
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  season?: string;              // 赛季标签，如 "s1"
  isHidden?: boolean;           // 是否隐藏精灵

  // ===== 可信度 =====
  trustLevel: TrustLevel;       // 见第四章
  sources: SourceRef[];         // 数据来源记录
  lastVerifiedAt: string;       // ISO 日期，最近一次人工核对
  sourceMap?: Record<string, SourceRef>; // 字段级溯源（可选，高级）

  // ===== 系统 =====
  dataVersion: string;          // 数据版本号（全局）
  createdAt: string;
  updatedAt: string;
}

interface Evolution {
  toSpiritId: string;
  condition: string;            // 如 "Lv.25" / "使用进化石"
  sort: number;
}

type SpiritType =
  | 'normal' | 'grass' | 'fire' | 'water' | 'light'
  | 'earth' | 'ice' | 'dragon' | 'electric' | 'poison'
  | 'bug' | 'martial' | 'wing' | 'cute' | 'ghost'
  | 'dark' | 'mech' | 'illusion';

type EggGroupId =
  | 'giant' | 'biped' | 'insect' | 'sky' | 'animal'
  | 'magic' | 'plant' | 'human' | 'soft' | 'earth'
  | 'magic_v2' | 'ocean' | 'dragon' | 'mech' | 'unknown';

type TrustLevel = 'authoritative' | 'verified' | 'community' | 'needs_review';

interface SourceRef {
  kind: 'official' | 'wiki' | 'community' | 'self';
  label: string;       // 可读名称，如 "Bilibili 洛克王国世界 WIKI"
  url?: string;
  fetchedAt: string;
}
```

### 2.2 TypeMatchup（属性克制）

```typescript
/**
 * 属性克制 · 18×18 矩阵
 * @source 洛克王国世界官方规则 + WIKI
 */
interface TypeMatchup {
  attacker: SpiritType;
  defender: SpiritType;
  multiplier: 0 | 0.25 | 0.5 | 1 | 1.5 | 2 | 2.5;
  note?: string;   // 特殊备注（如 "光克幽"）
}

// 完整矩阵以 18×18 = 324 条记录承载
// 前端拿到后在内存中构造 Map<"attacker:defender", multiplier>
```

### 2.3 EggGroup（蛋组）

```typescript
interface EggGroup {
  id: EggGroupId;
  name: string;            // 中文名，"巨兽组"
  description: string;     // 简短介绍
  memberSpiritIds: string[]; // 组内精灵
  canBreedWith?: EggGroupId[]; // 可互相繁殖的蛋组（规则延后到 MVP-B 详细）
}
```

### 2.4 HatchRule（孵蛋规则，MVP-A 仅用最简版）

```typescript
/**
 * MVP-A 孵蛋 V1 只用精灵的 size/weight 做反查
 * 真正的"孵蛋规则"推导延后到 MVP-B
 */
interface HatchPredictInput {
  size: number;     // 用户输入的蛋尺寸（m）
  weight: number;   // 用户输入的蛋重量（kg）
}

interface HatchCandidate {
  spiritId: string;
  spiritNo: number;
  spiritName: string;
  confidence: number;     // 0~1，基于距离的相似度
  reason: string;         // 简短说明，如 "尺寸接近 (0.6m vs 0.58m)"
}
```

### 2.5 User / Favorite（用户与收藏）

```typescript
/**
 * 用户 · 静默登录产物
 */
interface User {
  id: string;                  // 内部 UUID
  tenantChannel: 'mp-weixin' | 'h5';
  openid?: string;             // 微信小程序
  unionid?: string;            // 微信开放平台
  deviceId?: string;           // H5
  nickname?: string;           // 后期用户填写（MVP-A 不采集）
  avatar?: string;
  createdAt: string;
  lastActiveAt: string;
}

/**
 * 收藏 · 统一抽象，MVP-A 仅用 SPIRIT
 */
interface Favorite {
  id: string;
  userId: string;
  targetType: 'SPIRIT' | 'SKILL' | 'TEAM' | 'STRATEGY' | 'UGC_POST' | 'CREATOR' | 'THEME';
  targetId: string;
  folderId?: string;          // 收藏夹（留给一期）
  tags?: string[];            // （留给一期）
  createdAt: string;
}
```

### 2.6 DataVersion（全局数据版本）

```typescript
/**
 * 数据版本号 · 驱动前端增量更新
 */
interface DataVersion {
  global: string;              // 全局版本，如 "2026.04.3"
  spirits: {
    version: string;
    etag: string;
    count: number;
    url: string;               // CDN JSON 地址
  };
  skills?: { /* MVP-B */ };
  items?: { /* MVP-B */ };
  typeMatchup: {
    version: string;
    etag: string;
    url: string;
  };
  eggGroups: {
    version: string;
    etag: string;
    url: string;
  };
  publishedAt: string;
}
```

---

## 三、首批精灵范围（150-200 只）

### 3.1 选择原则

按以下权重排序，选出前 150-200 只：

1. **赛季热门精灵**（S1 环境 Tier S/A）——权重 0.4
2. **初始御三家及其进化链**——权重 0.2
3. **外观识别度高的精灵**（迪莫/喵喵/火花等）——权重 0.15
4. **强度高/玩家常用**（烈火战神、叶冕魔力猫等）——权重 0.15
5. **异色 / 炫彩 / 特殊形态**（代表性稀有形态）——权重 0.1

### 3.2 不纳入首批的类型

- 隐藏精灵（留到一期做隐藏精灵专区）
- 剧情精灵 / 非常规精灵
- 资料极不完整的精灵（缺立绘、缺种族值等）

### 3.3 数据完整度要求

首批精灵每只必须满足（否则降级到二批）：

- [ ] 有编号、名称、属性、种族值、身高、体重、蛋组
- [ ] 有立绘（最低 600x600，允许 WebP 压缩）
- [ ] 有一句话介绍（自写）
- [ ] 进化链信息（若有进化则必填）
- [ ] 至少 1 个数据来源标注

### 3.4 数据管理方式

- **Phase 0 阶段**：用一张共享表格（飞书/Notion/Excel）维护，字段按 2.1 的 Spirit 定义
- **Phase 1 末**：导出为 `spirits.json` 放到 CDN
- **一期以后**：迁移到后端 DB + 简单 CMS

### 3.5 首发页面提示

在精灵图鉴列表页顶部长期展示：

> 当前已录入 187 只精灵（v2026.04.3 · 更新于 2026-04-20）· [查看更新日志]

---

## 四、可信标签（Trust Label）

### 4.1 四级分级

| 标签 | 含义 | 徽章色 | 使用场景 |
|---|---|---|---|
| `authoritative` | 官方权威（官方游戏、官方攻略、公告） | 蓝色 | 极少，只有官方出处 |
| `verified` | 已人工核验（团队成员对照多源验证过） | 绿色 | 默认状态 |
| `community` | 社区共识（WIKI、攻略站多处一致） | 黄色 | WIKI 搬运数据 |
| `needs_review` | 待核验（用户反馈或爬取但未校对） | 红色 | 仅内部可见，不对用户展示 |

### 4.2 展示规则

- **列表页**：默认不展示徽章（避免信息噪声），只在搜索/筛选时可按可信度过滤
- **详情页**：顶部统一展示一枚主徽章（取最弱可信度字段的级别），点击查看完整溯源
- **字段级徽章**：P2 级别功能，详情页长按字段显示"这个数据来自哪里"

### 4.3 需要可信标签的字段

最关键的几个：种族值、身高、体重、蛋组、属性。

次要字段可以省略，降低维护成本。

---

## 五、版本号规范

### 5.1 全局版本号格式

```
<YEAR>.<MONTH>.<PATCH>

例如：
  2026.04.1   → 2026 年 4 月第 1 次发布
  2026.04.2   → 2026 年 4 月第 2 次更新
  2026.05.1   → 2026 年 5 月第 1 次发布
```

- **YEAR.MONTH** 代表"内容批次"，跟随版本节奏（通常一月一次）
- **PATCH** 代表"当月修订"，快速修正数据错误时 +1

### 5.2 字段级版本

每个子数据源（spirits / skills / items 等）都有独立版本号 + ETag：

- 前端启动时拉取 `GET /v1/meta/data-version`
- 比较本地与云端，不一致时按子模块增量下载
- ETag 用于 CDN 层缓存命中判断

### 5.3 版本与赛季的关系

- 数据版本号**不绑定**游戏赛季（游戏可能赛季中期调整某些精灵）
- 精灵数据里的 `season` 字段独立表示"这只精灵在哪个赛季是热门"
- 数据版本号记录"本次发布整理了哪些内容"

---

## 六、数据更新流程

### 6.1 流程概览

```mermaid
flowchart LR
    A[数据源发现变更] --> B[团队成员整理]
    B --> C[飞书表/Notion 更新]
    C --> D[同行评审]
    D --> E[导出 JSON 并校验格式]
    E --> F[上传 CDN + 更新 ETag]
    F --> G[更新数据版本号]
    G --> H[前端下次启动自动拉取]
    H --> I[写更新日志]
```

### 6.2 角色分工

- **数据整理员**（1-2 人）：负责新增/更新精灵资料
- **评审员**（1 人轮值）：每次发布前复核变更
- **发布员**（1 人）：负责导出 JSON、上传 CDN、更新版本号

### 6.3 发布节奏

- **常规发布**：每两周一次
- **紧急修订**：数据错误被用户反馈后 48 小时内
- **赛季发布**：游戏赛季更新后 72 小时内出新版本

### 6.4 更新日志

每次发布必须在 CDN 上同步一个 `changelog.json`，前端"我的 → 关于 → 数据更新"页面展示：

```json
{
  "version": "2026.04.3",
  "publishedAt": "2026-04-20T10:00:00Z",
  "changes": [
    { "type": "add", "target": "spirit", "name": "叶冕魔力猫", "note": "新增异色形态" },
    { "type": "fix", "target": "spirit", "name": "迪莫", "note": "修正体重单位 0.5kg → 0.4kg" },
    { "type": "update", "target": "type-matchup", "note": "更新 S1 赛季光系克制倍率" }
  ]
}
```

---

## 七、用户反馈/纠错入口

### 7.1 入口位置

- 精灵详情页右下角"反馈"按钮（复用之前项目的反馈组件理念）
- 反馈内容可选"数据错误 / 建议补充 / 其他"
- 可附截图（小程序走 `chooseImage`）

### 7.2 后端结构（MVP-A 即可预埋）

```typescript
interface DataFeedback {
  id: string;
  userId: string;
  targetType: 'spirit' | 'skill' | 'item' | 'type-matchup' | 'other';
  targetId?: string;
  type: 'error' | 'missing' | 'suggestion' | 'other';
  description: string;
  images?: string[];
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  createdAt: string;
}
```

### 7.3 激励

- **MVP-A 不做激励**（但在反馈成功页告知"采纳后会有奖励"）
- **二期** 起，被采纳的反馈奖励麦穗 + 专属徽章

---

## 八、CDN JSON 结构规范

### 8.1 目录结构（CDN 下发）

```
/data/
├── v2026.04.3/
│   ├── meta.json              # 本版本元信息
│   ├── spirits.json           # 全部精灵
│   ├── type-matchup.json      # 克制矩阵 18x18
│   ├── egg-groups.json        # 蛋组列表
│   └── changelog.json         # 本次更新日志
├── v2026.04.2/
│   └── ...
└── latest.json                # 指向当前最新版本的指针
```

### 8.2 latest.json 示例

```json
{
  "global": "2026.04.3",
  "publishedAt": "2026-04-20T10:00:00Z",
  "baseUrl": "https://cdn.loka-helper.com/data/v2026.04.3/",
  "modules": {
    "spirits":       { "file": "spirits.json",       "etag": "a7f3...", "size": 215000 },
    "typeMatchup":   { "file": "type-matchup.json",  "etag": "9c21...", "size":  12000 },
    "eggGroups":     { "file": "egg-groups.json",    "etag": "b5e0...", "size":   8000 }
  }
}
```

### 8.3 前端增量更新逻辑（伪代码）

```typescript
async function syncData() {
  const local = await getLocalDataVersion();
  const remote = await fetch('/data/latest.json').then(r => r.json());

  if (local?.global === remote.global) return;

  for (const [mod, info] of Object.entries(remote.modules)) {
    if (local?.modules?.[mod]?.etag !== info.etag) {
      const data = await fetch(remote.baseUrl + info.file).then(r => r.json());
      await saveLocal(mod, data, info.etag);
    }
  }

  await saveLocalDataVersion(remote);
  emit('data-synced', remote.global);
}
```

---

## 九、隐私与最小化采集

### 9.1 MVP-A 只采集这些

- 静默登录标识：openid / unionid（微信）或 deviceId（H5）
- 行为埋点：事件名 + 时间戳 + 轻量属性（详见 `04-competitor-edge-and-metrics.md`）
- 收藏记录：userId + targetId

### 9.2 MVP-A 不采集

- 手机号 / 身份证 / 真实姓名
- 通讯录 / 位置
- 用户昵称 / 头像（后续阶段再采集并明确协议）

### 9.3 数据存储期限

- 埋点事件：90 天滚动
- 收藏记录：永久（伴随用户账号）
- 服务器日志：30 天

---

## 十、评审 checklist（本文件）

- [ ] Spirit 字段是否覆盖所有 MVP-A 页面所需
- [ ] 首批 150-200 只精灵的挑选标准是否团队认可
- [ ] 可信标签四级是否足够，是否有维护成本考虑
- [ ] 版本号格式是否被后端认可（Go 侧校验用）
- [ ] CDN JSON 结构是否符合后端发布流程
- [ ] 数据整理员 / 评审员 / 发布员角色是否落实到人
- [ ] 用户反馈入口是否已列入 MVP-A P2 范围

---

## 附：本文件版本

- v1.0 · 2026-04-21 · Phase 0 初稿
