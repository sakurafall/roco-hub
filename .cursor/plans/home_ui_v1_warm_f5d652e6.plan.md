---
name: home ui v1 warm
overview: 按 PRD §2 全量落地首页：新增「洛克日 themeC」洛克黄暖色主题作为默认，重写 [app/src/pages/home/index.vue](app/src/pages/home/index.vue) 为亲和卡通风（自定义 NavBar + 大 Hero 搜索框 + 数据版本 Banner + 4 宫格快速工具 + 热门精灵横滑 + 最近查看横滑 + 反馈卡），插画感全部用 CSS 渐变/光晕实现，配合后端真实精灵图作为视觉点缀。
todos:
  - id: theme-c
    content: 新增 theme-c.json（洛克黄），在 engine.ts 注册并设为默认，ui store 默认值与 toggle 轮转调为 3 套
    status: completed
  - id: global-style
    content: pages.json tabBar / globalStyle 颜色同步换为洛克黄主题
    status: completed
  - id: events
    content: event.ts 补全 5 个 home_* 埋点事件名
    status: completed
  - id: home-rewrite
    content: 重写 pages/home/index.vue：NavBar+Hero+Banner+4宫格+热门+最近+反馈卡
    status: completed
  - id: spirit-card-compact
    content: spirit-card 组件加 compact prop，适配首页横滑窄卡
    status: completed
  - id: list-focus
    content: pages-spirit/list 读取 ?focus=1 query 自动聚焦搜索框
    status: completed
  - id: verify
    content: pnpm type-check + dev:h5 与 mp-weixin 双端设计验收
    status: completed
isProject: false
---

## 设计基调

**视觉风格：洛克黄亲和卡通风**（参考宝可梦 HOME / Pokémon 官网的暖色卡片观感）

- 主色：洛克黄 `#FFC93C`（来自 [docs/03 §8.2](app/docs/03-prd-core-screens.md)）
- 辅色：暖橙 `#FF7A5A`、奶油底 `#FFF8E1`、晴空蓝 `#7EC8FF`（点缀）
- 圆角：偏圆胖（`24-32rpx`），卡片使用 `28rpx` 圆角
- 阴影：暖色低饱和阴影 `rgba(255,180,80,0.12)`，避免冷灰阴影
- 装饰：CSS 径向渐变模拟"太阳光晕"、浮动小圆点，**不依赖插画资源**
- 字号层级：Hero 标题 `64rpx` / 卡片标题 `30rpx` / 副文 `24rpx`
- 由于文档 §4.5 明确没有插画资源授权，所有"插画感"通过：
  1. CSS 渐变 + 径向光圈
  2. 后端已返回的真实精灵 `cover_image`（作为热门卡的主视觉）
  3. emoji-like 的纯 CSS 几何装饰（圆点、圆环、波浪线）

---

## 信息架构（PRD §2.3 全量）

```
┌─────────────────────────────────────────┐
│  自定义 NavBar                           │
│  [Logo + "洛克助手"]      [主题切换图标] │   高 88rpx + 状态栏
├─────────────────────────────────────────┤
│  Hero 区（暖色径向渐变背景 + 装饰光圈）   │
│  ┌────────────────────────────────────┐ │
│  │ 你好，训练师                        │ │
│  │ 今天想查哪只精灵？                  │ │
│  │ ┌──────────────────────────────┐  │ │
│  │ │ 🔍 输入精灵名 / 编号 / 拼音  │  │ │  ← 点击跳列表+focus
│  │ └──────────────────────────────┘  │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  数据版本 Banner（暖橙→洛克黄 渐变卡）    │
│  📦 当前数据版本 v0.0.0-skeleton         │
│  全量 N 只精灵 · 点击查看更新日志        │
├─────────────────────────────────────────┤
│  4 宫格快速工具                          │
│  ┌──────┬──────┬──────┬──────┐          │
│  │ 图鉴 │ 克制 │ 孵蛋 │ 收藏 │          │  圆角 24rpx，每格 emoji-like 图示
│  └──────┴──────┴──────┴──────┘          │
├─────────────────────────────────────────┤
│  🔥 热门精灵 · 横滑（取 spirit list 前 8）│
│  [card1][card2][card3] →                │  每张 220rpx 宽
├─────────────────────────────────────────┤
│  🕘 最近查看 · 横滑（history 前 6）        │
│  [card1][card2][card3] →                │  history 为空时整模块隐藏
├─────────────────────────────────────────┤
│  💬 反馈与数据纠错 入口卡                │
└─────────────────────────────────────────┘
```

---

## 关键实现要点

### 1. 新增 themeC「洛克日」

新增 [app/src/theme/manifests/theme-c.json](app/src/theme/manifests/theme-c.json)，使用文档钉死的洛克黄色板：

```json
{
  "name": "themeC",
  "label": "洛克日",
  "navBg": "#FFFCF3",
  "navTextStyle": "black",
  "tokens": {
    "colorBg": "#FFF8E1",
    "colorBgElevated": "#FFFFFF",
    "colorPrimary": "#FFC93C",
    "colorPrimarySoft": "#FFF1C2",
    "colorAccent": "#FF7A5A",
    "colorText": "#2A2A2A",
    "colorTextSecondary": "#6E6A5C",
    "colorBorder": "#F2E6BD",
    "radiusSm": "12rpx",
    "radiusMd": "20rpx",
    "radiusLg": "32rpx",
    "shadowCard": "0 6rpx 18rpx rgba(255, 180, 80, 0.16)"
  }
}
```

挂载点：

- [app/src/theme/engine.ts](app/src/theme/engine.ts) 第 3-8 行 `manifests` 注册 `themeC`，并把 `currentManifest` 默认改为 `manifests.themeC`
- [app/src/stores/ui.ts](app/src/stores/ui.ts) 第 9 行存储默认值改为 `'themeC'`，第 21 行 `toggleTheme` 改成三套轮转 `themeC → themeA → themeB → themeC`
- [app/src/pages.json](app/src/pages.json) 第 91-95 行 `tabBar` 与第 86-89 行 `globalStyle` 中写死的 `#2F6BFF` / `#F6F8FB` 替换为洛克黄主题对应值

### 2. 重写 [app/src/pages/home/index.vue](app/src/pages/home/index.vue)

整页重写，分块（每块都是独立的 BEM section）：

- `home__navbar`：自定义状态栏占位 + Logo 文字 + 主题切换 icon（点击触发 `toggle()`）
- `home__hero`：暖色径向渐变背景 + 装饰光圈（CSS `::before` `::after` 圆形）+ 大标题 + 假搜索框
- `home__banner`：洛克黄→暖橙线性渐变卡，左侧版本号、右侧"›"
- `home__quick`：4 宫格 grid，每格背景使用 `colorPrimarySoft`，图标用 emoji-like 字符或 Unicode 图形（`⚔` 克制 / `🥚` 孵蛋 / `📖` 图鉴 / `❤` 收藏）
- `home__hot`：横滑 `scroll-view`（PRD §2.3 取前 8），单卡 `220rpx × 280rpx`，复用 [app/src/components/spirit-card/index.vue](app/src/components/spirit-card/index.vue) 但通过 prop 传递 `compact` 模式
- `home__recent`：横滑 `scroll-view`，绑定 `useHistoryStore().list.slice(0, 6)`，列表为空 `v-if` 整模块隐藏
- `home__feedback`：单张提示卡，跳 `/pages-me/feedback/index`

### 3. 数据来源

- **热门精灵**：MVP-A 暂无后端热门接口，复用 `useSpirits.load()` 取前 8 条作为占位（PRD §2.7 备注后端"最近 7 日 TOP"，未来后端就绪后只换 service）
- **最近查看**：直接读 [app/src/stores/history.ts](app/src/stores/history.ts) 的 `list`
- **数据版本**：读 [app/src/stores/data.ts](app/src/stores/data.ts) 的 `version`
- **总数**：`useSpirits.total`

### 4. 交互绑定（按 PRD §2.4）

- 假搜索框点击 → `uni.navigateTo({ url: '/pages-spirit/list/index?focus=1' })`，[app/src/pages-spirit/list/index.vue](app/src/pages-spirit/list/index.vue) 后续读 query 自动聚焦输入框
- 主题切换 icon → `toggle()` 三套轮转，`uni.showToast({ title: '已切换到 ' + label })`
- Banner → `uni.navigateTo({ url: '/pages-me/about/index' })`
- 4 宫格各自跳转 list / type-matchup / hatch-predict / favorites
- 热门卡点击 → `/pages-spirit/detail/index?id=...`
- 反馈卡 → `/pages-me/feedback/index`

### 5. 埋点补全

[app/src/types/event.ts](app/src/types/event.ts) 第 7-31 行追加：

```ts
| 'home_banner_click'
| 'home_quick_tool_click'
| 'home_hot_spirit_click'
| 'home_recent_spirit_click'
| 'home_search_focus'
```

各交互处调用 `analytics.track(...)`，`page_view` 事件已有。

### 6. 状态设计（PRD §2.5）

- 首次进入：spirits 加载中显示骨架屏（4 个矩形脉冲），4 宫格与 NavBar 立即可用
- 弱网失败：热门用本地 fallback（spirit.service 已有 mock 兜底），失败也不报错
- 无 history：「最近查看」整模块 `v-if` 隐藏（不显示空块）

---

## 视觉装饰具体做法（无插画也要有插画感）

Hero 区背景：

```scss
.home__hero {
  background:
    radial-gradient(circle at 85% -20%, #FFE9A1 0%, transparent 55%),
    radial-gradient(circle at 0% 110%, #FFD3B5 0%, transparent 50%),
    linear-gradient(180deg, #FFFCF3 0%, #FFF8E1 100%);
  &::before {  /* 右上大圆光晕 */
    content: ''; position: absolute; top: -80rpx; right: -80rpx;
    width: 280rpx; height: 280rpx; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,201,60,0.45), transparent 70%);
  }
  &::after {  /* 左下浮动小圆点 */
    content: ''; position: absolute; bottom: 40rpx; left: 60rpx;
    width: 16rpx; height: 16rpx; border-radius: 50%;
    background: #FF7A5A; box-shadow: 60rpx -40rpx 0 #7EC8FF, 100rpx 30rpx 0 #FFC93C;
  }
}
```

Banner 渐变：

```scss
.home__banner {
  background: linear-gradient(135deg, #FFC93C 0%, #FF7A5A 100%);
  color: #FFFFFF;
}
```

4 宫格图标：用纯 CSS 圆形容器 + Unicode 字符（避免引入图标包），后续可平替为 SVG。

---

## 文件清单


| 类型  | 文件                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------- |
| 新增  | [app/src/theme/manifests/theme-c.json](app/src/theme/manifests/theme-c.json)                                   |
| 改   | [app/src/theme/engine.ts](app/src/theme/engine.ts)（注册 themeC + 默认主题）                                           |
| 改   | [app/src/stores/ui.ts](app/src/stores/ui.ts)（默认值 + 三套轮转）                                                       |
| 改   | [app/src/pages.json](app/src/pages.json)（tabBar/globalStyle 改为暖色）                                              |
| 改   | [app/src/types/event.ts](app/src/types/event.ts)（追加 5 个 home 事件名）                                              |
| 重写  | [app/src/pages/home/index.vue](app/src/pages/home/index.vue)                                                   |
| 改   | [app/src/components/spirit-card/index.vue](app/src/components/spirit-card/index.vue)（加 `compact` prop 适配横滑窄卡）  |
| 改   | [app/src/pages-spirit/list/index.vue](app/src/pages-spirit/list/index.vue)（onLoad 读 `focus=1` 自动聚焦搜索框，1-2 行小改） |


---

## 验收

- H5 与 mp-weixin 双端首页能完整渲染 7 个区块
- 默认进入即洛克日暖色，点击主题图标可在 themeC/A/B 三套之间轮转，刷新后保持
- 4 宫格 4 个入口都能正确跳转
- 热门精灵区能拉到真实接口图（弱网回落 mock）
- 无 history 时「最近查看」自动隐藏
- `pnpm type-check` 通过

