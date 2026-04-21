# 06 · API 契约 + 技术栈 + 目录结构 + 错误码 + 鉴权流程

> 本文件是前端和 Go 后端的"接口合同"。Phase 0 以此为准评审；Phase 1 开始实现。契约变更必须走 PR + 双方签字。

---

## 一、技术栈总览

### 1.1 前端

| 项目 | 选型 | 版本 | 备注 |
|---|---|---|---|
| 跨端框架 | uni-app | 3.x | CLI 模式，非 HBuilder X 依赖 |
| 语言 | TypeScript | 5.x | 严格模式 |
| 视图 | Vue | 3.x | Composition API + `<script setup>` |
| 构建 | Vite | 5.x | 通过 `@dcloudio/vite-plugin-uni` 驱动 |
| 状态 | Pinia | 2.x | 替换原项目 Vuex |
| UI 组件 | uview-plus | latest | 基础组件兜底，定制化业务组件自研 |
| HTTP | axios + `axios-miniprogram-adapter` | latest | 复用原项目经验 |
| 样式 | Sass | - | 全局 `@/uni.scss` 变量 |
| 日期 | dayjs | latest | |
| 拼音 | pinyin-pro | latest | 搜索拼音支持 |
| 画布 | 原生 Canvas | - | 雷达图、分享卡（不依赖 echarts） |
| 测试 | Vitest | latest | 单元测试 |
| 类型检查 | vue-tsc | latest | |
| 代码风格 | ESLint + Prettier | latest | |

### 1.2 后端（Go）

> 由伙伴实现，以下是建议与契约需求。最终技术选型由后端决定，但必须满足对外契约。

| 项目 | 建议选型 | 备注 |
|---|---|---|
| 语言 | Go | 1.22+ |
| Web 框架 | Gin 或 Fiber | 建议 Gin，生态更成熟 |
| ORM | GORM | 辅助 `sqlc` 做复杂查询 |
| DB | PostgreSQL | 15+ · 主库 |
| 缓存 | Redis | 7+ · 热点数据、Session、限流 |
| 鉴权 | 自研 JWT | 见第五章 |
| 配置 | Viper | |
| 日志 | Zap | 结构化日志 |
| 监控 | Prometheus + Grafana | 二期上 |
| OSS / CDN | 阿里云 / 腾讯云 OSS + CDN | 存放精灵立绘、主题包、静态 JSON |
| 内容审核 | 微信安全 API + 云厂商内容审核 | 二期上 |
| 部署 | Docker + K8s 或轻量 systemd | 二期视规模升级 |

---

## 二、前端目录结构

```
loka-spirit-helper/
├── docs/                         # 从 loka-planning/ 迁入
├── public/                       # 静态资源（H5）
├── mock/                         # 本地 mock 数据（CDN JSON 的 mirror）
│   ├── spirits.json
│   ├── type-matchup.json
│   └── egg-groups.json
├── scripts/                      # 构建脚本
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json                # 路由（主包）
│   ├── manifest.json             # 平台配置
│   ├── uni.scss                  # 全局 SCSS 变量
│   ├── pages/                    # 主包 TabBar 页
│   │   ├── home/
│   │   ├── discover/
│   │   └── me/
│   ├── pages-spirit/             # 图鉴分包
│   │   ├── list/
│   │   └── detail/
│   ├── pages-tools/              # 工具分包
│   │   ├── index/                # 工具主页
│   │   ├── type-matchup/
│   │   └── hatch-predict/
│   ├── pages-me/                 # 我的子页面分包
│   │   ├── favorites/
│   │   ├── history/
│   │   ├── appearance/
│   │   ├── feedback/
│   │   └── about/
│   ├── components/               # 通用业务组件
│   │   ├── nav-bar/
│   │   ├── tab-bar/
│   │   ├── spirit-card/
│   │   ├── type-selector/
│   │   ├── radar-chart/
│   │   ├── share-card/
│   │   └── ...
│   ├── composables/              # Composition 复用
│   │   ├── useTheme.ts
│   │   ├── useFavorite.ts
│   │   ├── useSpirits.ts
│   │   ├── useSearch.ts
│   │   ├── useSilentLogin.ts
│   │   ├── useAnalytics.ts
│   │   └── useDataSync.ts
│   ├── stores/                   # Pinia
│   │   ├── user.ts
│   │   ├── data.ts
│   │   ├── favorites.ts
│   │   ├── history.ts
│   │   └── ui.ts
│   ├── http/                     # API 客户端
│   │   ├── request.ts            # axios 封装 + 签名
│   │   ├── interceptors.ts
│   │   ├── endpoints.ts          # 端点常量
│   │   └── services/             # 按领域分服务
│   │       ├── auth.service.ts
│   │       ├── spirit.service.ts
│   │       ├── favorite.service.ts
│   │       ├── tool.service.ts
│   │       ├── feedback.service.ts
│   │       ├── analytics.service.ts
│   │       └── meta.service.ts
│   ├── theme/                    # 主题引擎
│   │   ├── engine.ts             # 注入 CSS 变量
│   │   ├── manifests/
│   │   │   ├── theme-a.json
│   │   │   └── theme-b.json
│   │   └── tokens.ts             # Token 类型
│   ├── types/                    # TS 类型定义（从 02-data-model 抽取）
│   │   ├── spirit.ts
│   │   ├── user.ts
│   │   ├── api.ts
│   │   └── event.ts
│   ├── utils/
│   │   ├── env.ts                # 平台/设备检测（复用 pt_mall 经验）
│   │   ├── storage.ts
│   │   ├── debounce.ts
│   │   ├── pinyin.ts
│   │   └── format.ts
│   └── config/
│       ├── index.ts              # 环境配置加载
│       ├── dev.ts
│       └── prod.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 三、API 契约

### 3.1 基础约定

- **协议**：HTTPS
- **风格**：REST + JSON
- **版本**：URL 路径 `/v1/`
- **编码**：UTF-8
- **时间**：ISO 8601（如 `2026-04-20T10:00:00Z`）
- **ID**：统一 UUID v4（Go 侧建议用 `google/uuid`）

### 3.2 请求格式

#### Headers

```
Content-Type: application/json
Authorization: Bearer <accessToken>        # 静默登录后必带
X-App-Channel: mp-weixin|h5
X-App-Version: 1.0.0
X-Data-Version: 2026.04.3
X-Device-Id: <uuid>                         # 每设备唯一
X-Request-Id: <uuid>                        # 每请求唯一，排障用
X-Ts: 1713600000000                         # 毫秒时间戳（签名用）
X-Sign: <hmac-sha256>                       # 防篡改签名（详见 5.x）
Accept-Language: zh-CN
```

#### Body

- GET：query 参数，数组用 `?types=fire&types=water`
- POST：JSON body，顶层一律为对象

### 3.3 响应格式

所有成功响应统一结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": { /* 业务数据 */ },
  "requestId": "..."
}
```

失败响应：

```json
{
  "code": 40001,
  "message": "invalid argument: size out of range",
  "data": null,
  "requestId": "..."
}
```

- **HTTP 状态码** 表示传输层状态（200/401/500...）
- **业务 code** 表示业务层状态（0 = 成功，非 0 = 失败，详见错误码表）
- 前端统一在拦截器里处理：HTTP 200 + code != 0 → 抛业务异常

### 3.4 分页

所有列表接口统一分页结构：

**请求**：

```
GET /v1/spirits?page=1&pageSize=20&sort=no&order=asc
```

**响应 data**：

```json
{
  "list": [...],
  "page": 1,
  "pageSize": 20,
  "total": 187,
  "hasMore": false
}
```

### 3.5 幂等

- 幂等 POST 需带 `Idempotency-Key` 头（UUID）
- 后端缓存响应 15 分钟，同 key 重放返回相同结果
- MVP-A 有这个需求的接口：`POST /v1/favorites`（避免重复收藏）

---

## 四、接口清单（MVP-A）

### 4.1 鉴权

#### POST /v1/auth/silent-login

静默登录，获取 accessToken。

**请求**：

```json
{
  "channel": "mp-weixin",
  "code": "wx_login_code",          // 小程序时必填
  "deviceId": "uuid-h5-device"       // H5 时必填
}
```

**响应 data**：

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "abc123...",
  "expiresIn": 7200,
  "user": {
    "id": "uuid",
    "isNew": true,
    "channel": "mp-weixin"
  }
}
```

#### POST /v1/auth/refresh

Token 刷新。

**请求**：

```json
{ "refreshToken": "abc123..." }
```

**响应**：同静默登录

#### POST /v1/auth/bind-device （预留，MVP-A 不实现）

把匿名 deviceId 账号并到已登录账号。

---

### 4.2 精灵资料

#### GET /v1/spirits

精灵列表（支持分页 + 过滤 + 排序）。

**Query 参数**：

| 参数 | 类型 | 说明 |
|---|---|---|
| `page` | number | 默认 1 |
| `pageSize` | number | 默认 20，上限 100 |
| `types[]` | string | 属性筛选（多选） |
| `form` | string | `normal` / `shiny` / `glory` |
| `eggGroup` | string | 蛋组 id |
| `season` | string | `s1` / `s2` / `all` |
| `sort` | string | `no` / `name` / `stats_total` / `hp` / `atk` / `def` / `matk` / `mdef` / `spd` |
| `order` | string | `asc` / `desc` |
| `q` | string | 搜索关键词（MVP-A 前端本地搜，此参数保留给二期服务端搜索） |

**响应 data.list 元素**：简化版 Spirit（见 4.3 详情的 summary 子集）

#### GET /v1/spirits/:id

精灵详情。

**响应 data**：完整 Spirit 对象（见 `02-data-model`）

#### GET /v1/spirits/search

搜索（二期上线服务端搜索，MVP-A 前端用本地数据不调此接口）。

**Query**：`q, limit`

---

### 4.3 收藏

#### GET /v1/favorites

我的收藏列表。

**Query**：

| 参数 | 说明 |
|---|---|
| `targetType` | `SPIRIT`（默认）/ 未来扩展 |
| `page, pageSize` | 分页 |

**响应 data.list 元素**：

```json
{
  "id": "fav_uuid",
  "targetType": "SPIRIT",
  "targetId": "spirit_uuid",
  "target": { /* 精灵 summary 快照，便于前端展示 */ },
  "createdAt": "2026-04-20T10:00:00Z"
}
```

#### POST /v1/favorites

新增收藏（幂等，重复返回已存在记录）。

**请求**：

```json
{
  "targetType": "SPIRIT",
  "targetId": "spirit_uuid"
}
```

**响应 data**：favorite 对象

#### DELETE /v1/favorites/:id

取消收藏。

**响应 data**：`{ "deleted": true }`

#### POST /v1/favorites:batchDelete

批量取消。

**请求**：

```json
{ "ids": ["fav1", "fav2"] }
```

**响应 data**：`{ "deletedCount": 2 }`

---

### 4.4 工具

#### GET /v1/tools/type-matchup

属性克制查询。

**Query**：

| 参数 | 说明 |
|---|---|
| `attacker` | 攻击方单属性 |
| `defender[]` | 防御方属性（1-2 个） |

**响应 data**：

```json
{
  "attacker": "fire",
  "defenders": ["grass", "water"],
  "multiplier": 1.0,
  "detail": [
    { "attacker": "fire", "defender": "grass", "multiplier": 2.0 },
    { "attacker": "fire", "defender": "water", "multiplier": 0.5 }
  ],
  "label": "一般",
  "advice": "对水系效果一般"
}
```

> MVP-A 前端可以直接用本地 `type-matchup.json` 计算，此接口作为兜底或后续扩展（如"阵容克制分析"）。

#### POST /v1/tools/hatch/predict

孵蛋反查。

**请求**：

```json
{ "size": 0.6, "weight": 12.5 }
```

**响应 data**：

```json
{
  "input": { "size": 0.6, "weight": 12.5 },
  "candidates": [
    {
      "spiritId": "uuid",
      "spiritNo": 1,
      "spiritName": "迪莫",
      "confidence": 0.92,
      "reason": "尺寸接近 (0.6m vs 0.6m)、重量接近 (12.5kg vs 12kg)",
      "thumbnail": "https://..."
    }
  ],
  "dataVersion": "2026.04.3"
}
```

> MVP-A 前端可以直接本地计算。此接口保留给二期（考虑"同乘""进化链反查"等复杂规则时后移到服务端）。

---

### 4.5 元数据 / 数据同步

#### GET /v1/meta/data-version

**响应 data**：

```json
{
  "global": "2026.04.3",
  "publishedAt": "2026-04-20T10:00:00Z",
  "baseUrl": "https://cdn.loka-helper.com/data/v2026.04.3/",
  "modules": {
    "spirits":     { "file": "spirits.json",     "etag": "a7f3", "size": 215000 },
    "typeMatchup": { "file": "type-matchup.json","etag": "9c21", "size":  12000 },
    "eggGroups":   { "file": "egg-groups.json",  "etag": "b5e0", "size":   8000 }
  }
}
```

#### GET /v1/meta/changelog

**Query**：`limit=10`

**响应 data**：

```json
{
  "list": [
    {
      "version": "2026.04.3",
      "publishedAt": "2026-04-20T10:00:00Z",
      "changes": [
        { "type": "add", "target": "spirit", "name": "叶冕魔力猫", "note": "新增异色形态" }
      ]
    }
  ]
}
```

#### GET /v1/meta/feature-flags

灰度开关下发（MVP-A P2 级功能用）。

**响应 data**：

```json
{
  "features": {
    "share_card_v1": true,
    "theme_b": true,
    "hatch_predict_v1": true,
    "detail_animation": false,
    "onboarding_60s": false
  }
}
```

---

### 4.6 反馈

#### POST /v1/feedback

用户提交反馈。

**请求**：

```json
{
  "targetType": "spirit",
  "targetId": "uuid",
  "type": "error",                       // error / missing / suggestion / other
  "description": "体重应该是 0.4kg 而不是 0.5kg",
  "images": ["https://oss.../img1.jpg"]  // 可选，通过 OSS 预签名上传
}
```

**响应 data**：`{ "id": "fb_uuid", "status": "pending" }`

#### POST /v1/feedback/uploadToken

获取 OSS 预签名上传地址。

**请求**：`{ "filename": "feedback.jpg", "contentType": "image/jpeg" }`

**响应 data**：`{ "uploadUrl": "https://...", "publicUrl": "https://..." }`

---

### 4.7 埋点

#### POST /v1/analytics/events

批量上报事件。

**请求**：

```json
{
  "events": [
    {
      "eventId": "uuid",
      "eventName": "spirit_detail_view",
      "timestamp": 1713600000000,
      "sessionId": "uuid",
      "properties": {
        "spirit_id": "uuid",
        "source": "list"
      }
    }
  ],
  "common": {
    "channel": "mp-weixin",
    "platform": "ios",
    "appVersion": "1.0.0",
    "dataVersion": "2026.04.3",
    "theme": "themeA",
    "network": "wifi"
  }
}
```

**响应 data**：

```json
{
  "accepted": 10,
  "rejected": [
    { "eventId": "uuid-bad", "reason": "invalid_event_name" }
  ]
}
```

- 大小限制：单次 ≤ 200KB
- 为防刷，后端接收后放消息队列异步落库

---

## 五、鉴权与签名

### 5.1 Token 流程

1. 前端冷启动 → 调 `/v1/auth/silent-login` → 拿到 `accessToken + refreshToken`
2. 所有业务请求带 `Authorization: Bearer <accessToken>`
3. `accessToken` 过期（后端判 401 + code=40101）→ 前端 axios 拦截器自动调 `/v1/auth/refresh`
4. `refreshToken` 过期 → 回退到静默登录

### 5.2 JWT 规范

```json
{
  "iss": "loka-helper",
  "sub": "<userId>",
  "iat": 1713600000,
  "exp": 1713607200,
  "channel": "mp-weixin"
}
```

- 签名算法：HS256（后端持 secret）
- 密钥轮换：每季度一次（后端维护 kid）

### 5.3 请求签名（可选但推荐）

参考 pt_mall 的做法，对敏感 POST 接口做签名：

```
X-Sign = HMAC_SHA256(secret, `${method}\n${path}\n${ts}\n${bodyHash}`)
```

- `method`：GET/POST
- `path`：不含 query
- `ts`：`X-Ts` 头
- `bodyHash`：body JSON 的 SHA256
- `secret`：前端硬编码一个 appSecret（可识别篡改，但不提供完全安全，仍依赖 HTTPS）

MVP-A 可以**先不实现签名**，上线前再加（不影响契约）。

### 5.4 CSRF 防护

- H5 端默认 SameSite Cookie 或直接走 Authorization 头，不用 Cookie
- 小程序端不涉及

---

## 六、错误码规范

### 6.1 格式

5 位数字：`ABCCC`

- `A`：大类（1-9）
- `B`：子类（0-9）
- `CCC`：具体错误（000-999）

### 6.2 大类

| 大类 | 含义 |
|---|---|
| 0xxxx | 成功（`0` 即成功，无具体子码） |
| 1xxxx | 通用错误 |
| 2xxxx | 客户端错误 |
| 3xxxx | 业务错误 |
| 4xxxx | 鉴权错误 |
| 5xxxx | 资源错误 |
| 9xxxx | 服务端内部错误 |

### 6.3 MVP-A 常用错误码

| 码 | HTTP | 说明 | 处理建议 |
|---|---|---|---|
| `0` | 200 | 成功 | - |
| `10001` | 500 | 服务内部错误 | 提示"服务出错，请稍后重试" |
| `10002` | 503 | 服务暂不可用（维护中） | 提示"系统维护中" |
| `20001` | 400 | 参数错误 | 提示具体参数 |
| `20002` | 400 | 参数校验失败 | 提示具体字段 |
| `20003` | 413 | 请求体过大 | 分批或压缩 |
| `20004` | 429 | 请求过于频繁 | 退避重试 |
| `30001` | 400 | 业务状态不对 | 具体提示 |
| `30002` | 409 | 资源冲突（如重复收藏） | 幂等处理即可 |
| `40101` | 401 | accessToken 已过期 | 自动 refresh |
| `40102` | 401 | accessToken 无效 | 重新静默登录 |
| `40103` | 401 | refreshToken 已过期 | 重新静默登录 |
| `40301` | 403 | 权限不足 | 提示 |
| `40401` | 404 | 资源不存在 | 具体提示 |
| `40402` | 404 | 精灵不存在 | 返回列表 |
| `50001` | 500 | 数据未就绪（如新版本发布中） | 提示稍后 |
| `90001` | 500 | 未知错误 | 上报 + 提示 |

### 6.4 错误响应 Go 结构（示意）

```go
type Response struct {
  Code      int         `json:"code"`
  Message   string      `json:"message"`
  Data      interface{} `json:"data"`
  RequestId string      `json:"requestId"`
}
```

---

## 七、前端 API Client 约定

### 7.1 axios 封装

```typescript
// src/http/request.ts
import axios, { type AxiosInstance } from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';
import { getConfig } from '@/config';
import { useUserStore } from '@/stores/user';

const instance: AxiosInstance = axios.create({
  baseURL: getConfig().apiBaseUrl,
  timeout: 15_000,
  adapter: mpAdapter,
});

instance.interceptors.request.use((config) => {
  const user = useUserStore();
  config.headers['Authorization'] = user.accessToken ? `Bearer ${user.accessToken}` : undefined;
  config.headers['X-App-Channel'] = getPlatform();
  config.headers['X-App-Version'] = APP_VERSION;
  config.headers['X-Device-Id'] = user.deviceId;
  config.headers['X-Request-Id'] = uuid();
  config.headers['X-Data-Version'] = useDataStore().version;
  config.headers['X-Ts'] = Date.now();
  return config;
});

instance.interceptors.response.use(
  async (res) => {
    const body = res.data;
    if (body.code === 0) return body.data;
    if (body.code === 40101) {
      await useUserStore().refreshToken();
      return instance.request(res.config);
    }
    if (body.code === 40102 || body.code === 40103) {
      await useUserStore().silentLogin();
      return instance.request(res.config);
    }
    throw new BizError(body.code, body.message, body.requestId);
  },
  (err) => {
    // 网络异常、超时等
    throw new NetworkError(err);
  }
);

export default instance;
```

### 7.2 Service 层约定

每个领域一个 service 文件：

```typescript
// src/http/services/spirit.service.ts
import request from '../request';
import type { Spirit, Paginated } from '@/types/spirit';

export const spiritService = {
  list(params: ListParams): Promise<Paginated<SpiritSummary>> {
    return request.get('/v1/spirits', { params });
  },
  detail(id: string): Promise<Spirit> {
    return request.get(`/v1/spirits/${id}`);
  },
};
```

### 7.3 Composables 调用约定

```typescript
// src/composables/useSpirits.ts
export function useSpirits() {
  const spirits = ref<SpiritSummary[]>([]);
  const loading = ref(false);

  async function load(params: ListParams) {
    loading.value = true;
    try {
      const res = await spiritService.list(params);
      spirits.value = res.list;
    } finally {
      loading.value = false;
    }
  }

  return { spirits, loading, load };
}
```

---

## 八、限流与防刷

### 8.1 后端限流

| 接口 | 单用户限流 | 全局限流 |
|---|---|---|
| `POST /v1/auth/silent-login` | 10/min | - |
| `POST /v1/favorites` | 60/min | - |
| `POST /v1/feedback` | 5/min | - |
| `POST /v1/analytics/events` | 120/min | - |
| 其他 GET | 300/min | 依实例 |

Redis + 固定窗口/漏桶。

### 8.2 前端防抖

- 搜索输入：300ms 节流
- 收藏按钮：点击后禁用 500ms
- 反馈提交：点击后禁用直到返回

---

## 九、环境与配置

### 9.1 环境变量（前端）

```
VITE_APP_ENV=dev|staging|prod
VITE_API_BASE_URL=https://api.loka-helper.com
VITE_CDN_BASE_URL=https://cdn.loka-helper.com
VITE_ANALYTICS_ENABLED=true
VITE_FEATURE_FLAG_ENDPOINT=/v1/meta/feature-flags
```

### 9.2 多环境

| 环境 | API | CDN | 用途 |
|---|---|---|---|
| dev | https://dev-api... | dev-cdn... | 本地开发 |
| staging | https://staging-api... | staging-cdn... | 内测 |
| prod | https://api... | cdn... | 线上 |

---

## 十、后端数据库规划（建议给 Go 伙伴参考）

### 10.1 核心表

```sql
-- 用户
CREATE TABLE users (
  id UUID PRIMARY KEY,
  channel TEXT NOT NULL,              -- mp-weixin / h5
  openid TEXT,
  unionid TEXT,
  device_id TEXT,
  nickname TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ,
  UNIQUE (channel, openid),
  UNIQUE (channel, device_id)
);

-- refresh_token 白名单
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 收藏
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
CREATE INDEX idx_fav_user_created ON favorites (user_id, created_at DESC);

-- 精灵（若干期后若把数据迁到 DB）
CREATE TABLE spirits (
  id UUID PRIMARY KEY,
  no INT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,          -- 完整 Spirit 对象
  data_version TEXT NOT NULL,
  trust_level TEXT NOT NULL,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_spirit_no ON spirits (no);

-- 反馈
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  target_type TEXT,
  target_id TEXT,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  images JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 事件（写量大，可拆多表或直接走 ClickHouse）
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  event_name TEXT NOT NULL,
  event_ts BIGINT NOT NULL,
  properties JSONB,
  common JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_events_user_ts ON events (user_id, event_ts);
CREATE INDEX idx_events_name_ts ON events (event_name, event_ts);
```

### 10.2 读写分离建议

- 精灵数据读多写少 → 大规模起来时加 Redis 缓存
- 事件写多读少 → 二期可切 ClickHouse

---

## 十一、发布节奏与流程

### 11.1 环境发布

```
开发 → dev API → 内测
提 PR → code review → merge
staging 自动部署 → QA → 过
打 Tag → prod 部署 → 小程序提审
```

### 11.2 小程序版本

- 版本号 `major.minor.patch`（如 `1.0.0`）
- 微信小程序发布有审核周期（1-3 天）
- 急修走"强制更新" + 版本号公示

### 11.3 灰度

- 通过 `/v1/meta/feature-flags` 下发开关
- 后端维护"灰度用户名单 / 灰度百分比"

---

## 十二、评审 checklist

- [ ] 所有 MVP-A 页面需要的接口是否都在 4.x 章节
- [ ] 错误码设计是否被前后端认同
- [ ] 鉴权流程（尤其 token 刷新）是否覆盖边界场景
- [ ] 数据库表设计是否满足性能预期
- [ ] 埋点批量上报接口是否考虑量级（MVP-A 百万级事件/天）
- [ ] 前端目录结构是否团队认同（特别是 pages-*/ 的分包命名）
- [ ] 限流策略是否被后端认领
- [ ] 多环境配置与切换机制是否清晰

---

## 附：本文件版本

- v1.0 · 2026-04-21 · Phase 0 初稿
