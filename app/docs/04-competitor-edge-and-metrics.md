# 04 · 竞品超越点 + 埋点事件表

> 本文件回答两个问题：**我们要在哪 5 个点上赢竞品？这些赢的点如何用数据来证明？**

---

## 一、竞品格局速览

当前玩家可选的洛克王国辅助类产品：

| 类型 | 代表 | 强项 | 短板 |
|---|---|---|---|
| 官方小程序 | 游戏官方 | 活动、公告权威 | 工具弱、界面陈旧 |
| WIKI 站 | Bilibili/非官方 WIKI | 资料全 | 移动端差、无工具 |
| 助手类小程序 | 多家第三方 | 图鉴、克制入口 | 做得杂、更新慢、体验粗糙 |
| 视频博主 | Bilibili/抖音 | 攻略、带节奏 | 无工具入口 |

我们的定位**不是在每个维度都赢**，而是在用户最常用的工具链上做"体验明显更好"。

---

## 二、5 个竞品超越点（赢在哪）

### 超越点 1 · 搜索更快、更聪明

**现状**：多数竞品搜索只支持中文精确匹配，无拼音、无模糊、无历史、无热门。

**我们的做法**：

- **本地搜索**：首批精灵 JSON 本地化，输入后 ≤ 100ms 返回
- **拼音支持**：首字母（"dm"）+ 全拼（"dimo"）+ 异名（"小蓝"）
- **模糊匹配**：编辑距离 ≤ 2 的兜底结果（"迪模" → "迪莫"）
- **搜索历史**：本地 20 条，可编辑
- **无结果体验**：不给空页，给"最近热门"+"换关键词建议"
- **三期 AI 兜底**：自然语言搜索（"最强的水系"、"速度最快的龙")

**成功标准**：

- 每 DAU 搜索次数 ≥ 3（验证门槛指标 4）
- 搜索无结果率 ≤ 8%

### 超越点 2 · 图鉴信息结构更清晰，详情页更漂亮

**现状**：多数竞品详情页是"堆信息"，用户要自己找重点。

**我们的做法**：

- **视觉层级清晰**：主视觉区（立绘 + 属性）→ 快捷工具 → 资料分 Tab
- **Canvas 雷达图**（非 echarts 重库，体积小、动效流畅）
- **属性主色渐变背景**（每只精灵有独特的观感氛围）
- **空态隐藏 vs 空块**：没有的数据直接隐藏，不展示"—"或空表
- **可信徽章**（蓝绿黄三级）

**成功标准**：

- 人均精灵详情浏览数 ≥ 4（验证门槛指标 5）
- 详情页平均停留 ≥ 25 秒
- 详情页跳出率 < 40%

### 超越点 3 · 孵蛋真的能用（而不是"只告诉你规则"）

**现状**：多数竞品孵蛋页面是"文字说明 + 图示"，不具备"反查"能力。

**我们的做法**：

- **输入 → 结果** 的计算器形态
- 基于首批精灵的 size/weight 真实数据
- 相似度 + 置信度展示
- 结果可一键跳精灵详情
- 明确标注支持范围（避免用户冷不丁输入冷门精灵失望）
- MVP-B 起加"同乘开关"、"历史记录"、"反向查父母"

**成功标准**：

- 孵蛋功能使用率 ≥ 10%（验证门槛指标 8）
- 孵蛋页→ 精灵详情转化率 ≥ 50%

### 超越点 4 · 分享卡"脱离产品也有内容价值"

**现状**：多数竞品没有分享卡；有的只是"带二维码的截图"。

**我们的做法**：

- 专业美术的海报模板（3:5 竖版，适合朋友圈）
- 核心数据可视化（种族值 mini 雷达图）
- 属性主色与卡片氛围联动
- 低调水印 + 二维码 + 一句话口号
- 扫码/点击 → 直达对应精灵详情（带 UTM）

**成功标准**：

- 分享触发率 ≥ 5%（验证门槛指标 7）
- 分享入口回访 → 新用户转化率 ≥ 15%
- 分享海报保存到相册比例 ≥ 30%（H5 端）

### 超越点 5 · 数据更新及时、可信

**现状**：多数竞品不展示更新时间、不展示数据来源，用户不知道数据"新不新"。

**我们的做法**：

- 全局数据版本号 `YYYY.MM.PATCH` 显性展示
- 每条核心字段可查来源（P2 级别）
- 更新日志（"本次新增 12 只精灵，修正 3 处数据"）
- 承诺 2 周一次常规更新 + 48 小时修错
- 用户纠错入口
- 精灵详情顶部"最近更新 3 天前"小标签

**成功标准**：

- 用户纠错反馈月均 ≥ 30 条（说明用户在关注）
- 采纳率 ≥ 50%
- "关于页"访问率（含数据版本）≥ 5% / 月活

---

## 三、埋点事件总表

### 3.1 事件命名规范

- 格式：`<domain>_<object>_<action>`
  - 例：`spirit_detail_view`、`share_card_generate`
- 属性命名：snake_case，字段语义清晰
- 所有事件自动带公共属性（见 3.2）

### 3.2 公共属性（所有事件自动附带）

| 属性名 | 类型 | 说明 |
|---|---|---|
| `event_id` | string | UUID，前端生成 |
| `event_name` | string | 事件名 |
| `timestamp` | int64 | 毫秒级时间戳 |
| `user_id` | string | 静默登录后产生的 userId |
| `session_id` | string | 本次会话 ID（进入应用后生成，30min 空闲重置） |
| `channel` | string | `mp-weixin` / `h5` |
| `platform` | string | `ios` / `android` / `pc` |
| `app_version` | string | 前端发布版本 |
| `data_version` | string | 当前使用的数据版本号 |
| `network` | string | `wifi` / `4g` / `5g` / `offline` |
| `theme` | string | 当前主题 |
| `referer_page` | string | 上一个页面（埋点跳转链路用） |

### 3.3 事件明细表

#### 生命周期

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 1 | `app_launch` | 应用启动 | `cold=true/false, launch_ms` | DAU 计算、启动耗时 | P0 |
| 2 | `app_foreground` | 从后台切回前台 | - | 使用时长 | P0 |
| 3 | `app_background` | 切到后台 | `session_duration_sec` | 会话时长 | P0 |
| 4 | `page_view` | 进入任何页面 | `page, from_page` | 页面访问量、路径漏斗 | P0 |
| 5 | `page_leave` | 离开页面 | `page, view_duration_sec` | 页面停留 | P0 |

#### 鉴权

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 6 | `auth_silent_login_start` | 发起静默登录 | `channel` | 静默登录链路 | P0 |
| 7 | `auth_silent_login_success` | 静默登录成功 | `channel, is_new, user_id` | 新用户 / 活跃 | P0 |
| 8 | `auth_silent_login_fail` | 静默登录失败 | `channel, error_code, error_msg` | 失败率报警 | P0 |
| 9 | `auth_token_refresh` | Token 刷新 | `result` | Token 健康度 | P0 |

#### 搜索

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 10 | `search_input_focus` | 搜索框聚焦 | `source=home/list` | 搜索意愿 | P0 |
| 11 | `search_submit` | 搜索提交（输入触发或回车） | `query, result_count, source` | 搜索次数（核心指标 4） | P0 |
| 12 | `search_no_result` | 搜索无结果 | `query, source` | 无结果率 | P0 |
| 13 | `search_history_click` | 点击搜索历史 | `query, rank` | 历史价值 | P0 |
| 14 | `search_history_clear` | 清空历史 | `item_count` | 隐私偏好 | P0 |
| 15 | `search_result_click` | 点击搜索结果 | `query, spirit_id, rank` | 搜索效果 | P0 |

#### 图鉴 / 精灵

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 16 | `spirit_list_filter_type_select` | 选择属性筛选 | `types=[]` | 筛选使用 | P0 |
| 17 | `spirit_list_filter_form_select` | 选择形态筛选 | `form` | 筛选使用 | P0 |
| 18 | `spirit_list_filter_egg_select` | 选择蛋组筛选 | `egg_group` | 筛选使用 | P0 |
| 19 | `spirit_list_sort_change` | 排序切换 | `sort_by, order` | 排序偏好 | P0 |
| 20 | `spirit_card_click` | 点击精灵卡片 | `spirit_id, source, rank` | 详情入口来源 | P0 |
| 21 | `spirit_card_long_press` | 长按精灵卡 | `spirit_id, action` | 快捷菜单使用 | P1 |
| 22 | `spirit_detail_view` | 进入精灵详情 | `spirit_id, source` | 核心指标 5 | P0 |
| 23 | `spirit_detail_stay` | 详情页离开时 | `spirit_id, duration_sec` | 停留时长 | P0 |
| 24 | `spirit_portrait_zoom` | 立绘放大 | `spirit_id` | 视觉兴趣 | P1 |
| 25 | `spirit_tab_switch` | 详情 Tab 切换 | `spirit_id, tab` | Tab 偏好 | P0 |
| 26 | `spirit_matchup_entry` | 从详情进克制 | `spirit_id, from=type_tag/cta` | 深度使用 | P1 |
| 27 | `spirit_evolution_click` | 点击进化链 | `from_id, to_id` | 进化链关注 | P0 |

#### 收藏

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 28 | `favorite_toggle` | 切换收藏态 | `spirit_id, to, source=detail/card` | 核心指标 6 | P0 |
| 29 | `favorite_list_view` | 进入收藏页 | `item_count` | 收藏留存 | P0 |
| 30 | `favorite_item_click` | 点击收藏项 | `spirit_id, rank` | 收藏再访 | P0 |
| 31 | `favorite_batch_delete` | 批量取消收藏 | `count` | 管理行为 | P0 |

#### 孵蛋

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 32 | `hatch_predict_submit` | 反查提交 | `size, weight, result_count` | 核心指标 8 | P1 |
| 33 | `hatch_predict_no_result` | 反查无结果 | `size, weight` | 数据补全引导 | P1 |
| 34 | `hatch_result_card_click` | 点击候选卡 | `spirit_id, rank, confidence` | 孵蛋效果 | P1 |
| 35 | `hatch_input_invalid` | 输入非法 | `field, value` | 输入教育 | P1 |

#### 克制

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 36 | `matchup_attacker_select` | 选择攻击属性 | `type` | 使用链路 | P1 |
| 37 | `matchup_defender_select` | 选择防御属性 | `types=[]` | 使用链路 | P1 |
| 38 | `matchup_result_show` | 结果展示 | `attacker, defenders, multiplier` | 使用价值 | P1 |
| 39 | `matchup_type_list_click` | 点击属性列表项 | `type` | 反向查询偏好 | P1 |

#### 分享

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 40 | `share_entry_click` | 点击分享按钮 | `source, spirit_id?` | 分享意愿 | P1 |
| 41 | `share_channel_select` | 选择分享渠道 | `channel, spirit_id?` | 渠道偏好 | P1 |
| 42 | `share_card_generate` | 海报生成 | `spirit_id, generate_ms, file_size_kb` | 核心指标 7 | P1 |
| 43 | `share_card_save_album` | 保存到相册 | `spirit_id` | 保存率 | P1 |
| 44 | `share_card_cancel` | 取消分享 | `source, reason?` | 流失点 | P1 |
| 45 | `share_entry_visit` | 外部回到产品 | `spirit_id, utm_source, utm_medium` | 分享回流 | P1 |

#### 主题

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 46 | `theme_change` | 切换主题 | `from, to` | 主题偏好 | P0 |
| 47 | `dark_mode_change` | 切换暗色模式 | `mode=system/light/dark` | 暗色偏好 | P0 |

#### 数据与反馈

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 48 | `data_sync_start` | 启动数据同步 | `local_version, remote_version` | 数据链路 | P0 |
| 49 | `data_sync_success` | 数据同步成功 | `modules_updated=[], bytes, ms` | 性能 | P0 |
| 50 | `data_sync_fail` | 数据同步失败 | `error_code, error_msg` | 失败报警 | P0 |
| 51 | `feedback_submit` | 提交反馈 | `target_type, type, with_image` | 反馈活跃 | P1 |
| 52 | `data_source_view` | 查看数据来源 | `spirit_id, field` | 可信度使用 | P2 |

#### 首页

| # | 事件名 | 触发点 | 关键属性 | 用途 | 阶段 |
|---|---|---|---|---|---|
| 53 | `home_banner_click` | Banner 点击 | `banner_id, target` | Banner 效果 | P0 |
| 54 | `home_quick_tool_click` | 4 宫格点击 | `tool` | 工具入口偏好 | P0 |
| 55 | `home_hot_spirit_click` | 热门精灵点击 | `spirit_id, rank` | 热门效果 | P0 |
| 56 | `home_recent_spirit_click` | 最近查看点击 | `spirit_id, rank` | 历史价值 | P0 |

---

## 四、关键漏斗

### 4.1 搜索漏斗

```
search_input_focus
   ↓ (输入转化率)
search_submit
   ↓ (结果有效率 · 1 - no_result_rate)
search_result_click
   ↓ (转化率)
spirit_detail_view
```

**目标**：`search_submit → search_result_click` ≥ 65%

### 4.2 分享漏斗（P1）

```
share_entry_click
   ↓ (渠道选择率)
share_channel_select
   ↓ (生成率，仅海报渠道)
share_card_generate
   ↓ (保存率)
share_card_save_album
   ↓ (回流率，依赖外部打开)
share_entry_visit
```

**目标**：`share_card_generate → share_entry_visit` ≥ 10%

### 4.3 详情 → 收藏漏斗

```
spirit_detail_view
   ↓ (收藏率)
favorite_toggle (to=on)
   ↓ (后续再访率)
favorite_list_view → favorite_item_click
```

**目标**：`spirit_detail_view → favorite_toggle(to=on)` ≥ 8%

### 4.4 孵蛋使用漏斗（P1）

```
page_view (hatch_predict)
   ↓ (提交率)
hatch_predict_submit
   ↓ (结果可用率)
hatch_result_card_click
   ↓ (到详情转化)
spirit_detail_view (source=hatch)
```

**目标**：`hatch_predict_submit → hatch_result_card_click` ≥ 50%

---

## 五、看板指标（MVP-A 必备）

### 5.1 日报看板

每日 09:00 推送（飞书机器人）：

| 指标 | 目标 | 当前值 | 趋势 |
|---|---|---|---|
| DAU | ≥ 500 | - | - |
| 新增用户 | - | - | - |
| 次日留存 | ≥ 30% | - | - |
| 7 日留存 | ≥ 12% | - | - |
| 每 DAU 搜索次数 | ≥ 3 | - | - |
| 人均精灵详情浏览数 | ≥ 4 | - | - |
| 收藏率 | ≥ 20% | - | - |
| 分享触发率 | ≥ 5% | - | - |
| 孵蛋使用率 | ≥ 10% | - | - |
| 搜索无结果率 | ≤ 8% | - | - |

### 5.2 事件量看板

- Top 10 最常触发的事件
- 核心事件 24 小时趋势曲线
- 错误事件（`*_fail`）报警

---

## 六、上报策略

### 6.1 前端批量上报

- 事件先进入内存队列
- 达到 20 条 或 5 秒间隔 触发上报
- 网络失败指数退避重试（2s / 4s / 8s / 16s，最多 4 次）
- 离线期间持久化到本地（上限 200 条），恢复后补传

### 6.2 上报接口

`POST /v1/analytics/events`（详见 `06-api-contract-and-tech-stack.md`）

- 请求体：事件数组
- 响应：`{ accepted: n, rejected: [...] }`

### 6.3 事件采样

- MVP-A **不采样**（量小，全量跑）
- 后续按需做：`page_view` 等高频事件可 10% 采样；核心指标事件保持全量

---

## 七、隐私与合规

- 埋点数据不得包含：手机号、身份证、精确位置、明文支付信息
- 事件保留 90 天滚动
- 用户请求删除账号时，相关 `user_id` 匿名化
- 隐私政策里明确说明"收集行为数据用于产品改进"

---

## 八、评审 checklist

- [ ] 5 个超越点是否有明确的可验证指标
- [ ] 事件表是否覆盖验证门槛的 7+1 指标
- [ ] 公共属性是否由前端封装统一注入
- [ ] 后端 `/v1/analytics/events` 契约是否明确
- [ ] 看板（飞书日推 or 简单网页）在 Phase 2 末是否能上线
- [ ] 漏斗分析是否有数据库索引支持（`session_id + user_id + event_name + timestamp`）

---

## 附：本文件版本

- v1.0 · 2026-04-21 · Phase 0 初稿
