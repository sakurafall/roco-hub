# 洛克助手 · Malt Games · 前端工程（Phase 1 骨架）

> uni-app 3 + Vue 3 + TypeScript + Vite + Pinia · 跨端：H5 + 微信小程序
>
> 工程位于 `app/`，与未来 `backend/`（Go）平级；产品文档在 `../docs/`。

---

## 一、当前状态

Phase 1 第 2 步交付物 · 中间档骨架，核心特征：

- 完整目录结构（按 [docs/06 §2](../docs/06-api-contract-and-tech-stack.md)）
- 主题引擎 themeA（晨光）/ themeB（夜枫）切换可用
- HTTP / Pinia / 配置 / 类型 / utils / composables 全部就位
- 7 个 service 文件按 [docs/06 §4.x](../docs/06-api-contract-and-tech-stack.md) 接口签名落位（仅 spirit 有 mock 实现，其他抛 NotImplementedError）
- 首页 Hello World 跑通双端

未做：真实静默登录联调、CDN 同步、埋点上报、PRD 8 大业务页。

---

## 二、环境准备

| 工具 | 版本 |
|---|---|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| 微信开发者工具 | 最新稳定版（用于小程序预览） |

VSCode 推荐安装 `.vscode/extensions.json` 列出的插件（Volar / ESLint / Prettier / uni-helper）。

---

## 三、安装

```bash
cd app
pnpm install
```

> 首次安装后会自动批准 esbuild / core-js / @parcel/watcher / vue-demi 的 postinstall 脚本（已在 `package.json` 声明白名单）。

---

## 四、运行

### 4.1 H5（开发）

```bash
pnpm dev:h5
```

默认在 `http://localhost:5173/` 打开（端口可在 `vite.config.ts` 修改）。

### 4.2 微信小程序（开发）

```bash
pnpm dev:mp-weixin
```

编译产物输出在 `dist/dev/mp-weixin/`，用微信开发者工具：

1. 打开「项目 → 导入项目」
2. 项目目录选择 `app/dist/dev/mp-weixin/`
3. AppId：先用占位 `wx0000000000000000`（仅用于本地编译）；正式联调请到 `src/manifest.json` 替换为你的测试号
4. 注意勾选「不校验合法域名」（开发期）

### 4.3 生产构建

```bash
pnpm build:h5
pnpm build:mp-weixin
```

---

## 五、常用脚本

| 命令 | 说明 |
|---|---|
| `pnpm dev:h5` / `dev:mp-weixin` | 开发 |
| `pnpm build:h5` / `build:mp-weixin` | 生产构建 |
| `pnpm type-check` | vue-tsc 类型检查 |
| `pnpm lint` / `lint:fix` | ESLint 检查 / 修复 |
| `pnpm format` | Prettier 格式化 |
| `pnpm test` | Vitest 单测 |

---

## 六、目录速览

```
src/
├── pages/            # 主包·tabBar 三页
├── pages-spirit/     # 分包·图鉴
├── pages-tools/      # 分包·工具
├── pages-me/         # 分包·我的子页
├── components/       # 通用业务组件
├── composables/      # Composition API 复用
├── stores/           # Pinia 状态
├── http/             # uni.request 封装 + endpoints + 7 个 service
├── theme/            # 主题引擎 + manifest
├── types/            # TS 类型契约
├── utils/            # env/storage/pinyin/format 等
├── config/           # 多环境配置
└── App.vue / main.ts / pages.json / manifest.json / uni.scss
mock/                 # 本地示例数据（CDN JSON 的 mirror）
```

---

## 七、Hello World 验证 checklist

- [ ] `pnpm install` 无报错
- [ ] `pnpm type-check` 通过
- [ ] `pnpm dev:h5` 浏览器看到首页"你好，洛克助手·Malt Games"
- [ ] H5 上点「切换主题」颜色立即变化
- [ ] H5 上首页能显示"共 5 只精灵"
- [ ] `pnpm dev:mp-weixin` 微信开发者工具能编译通过
- [ ] 小程序端 tabBar 三页能切换
- [ ] 小程序端能跳转到 `pages-spirit/list`
- [ ] 「外观设置」页面可视化切换两套主题

---

## 八、下一步

按 [docs/README.md §4 衔接动作](../docs/README.md) 推进：

- 第 3 步：画师合作招募 + 精灵数据录入表格
- 第 4 步：后端 Go 仓库初始化，先上 `/v1/auth/silent-login` 与 `/v1/meta/data-version`
- Phase 1 收尾：把 `useSilentLogin` / `useDataSync` 的 mock 替换为真实接口调用

---

## 九、约定

- 提交：走 PR，至少 1 人评审；commit 信息暂未启用 commitlint
- 代码风格：`pnpm format && pnpm lint` 在提交前自动跑（见 `.husky/pre-commit`）
- 主题：所有颜色/圆角/阴影必须用 `var(--color-xxx)` 形式，禁止硬编码
- 接口：service 方法签名必须与 [docs/06 §4.x](../docs/06-api-contract-and-tech-stack.md) 一致
- 埋点：`useAnalytics().track()` 统一入口，事件名清单见 [docs/04](../docs/04-competitor-edge-and-metrics.md)
