# clowand 独立站 — 项目交接文档

> **生成时间**：2026-04-23
> **当前版本**：v6.8.0（package.json 标 6.6.6，README 实际版本 v6.8.0）
> **HEAD commit**：`6d7a1e1`
> **接收方说明**：本文档为完整交接资料，新平台/新 AI 接手时，**先完整读完本文档，再读 `agent-core/MEMORY.md`**，最后看 `CLOWAND_FRONTEND_PITFALLS.md`。

---

## 1. 项目基本信息

| 字段 | 值 |
|------|------|
| 项目名称 | **clowand 独立站**（项目内部代号 pureswipe-site / clowand-independent-station） |
| 品牌定位 | Premium US bathroom hygiene（美国家庭高级马桶清洁系统） |
| 主营产品 | 18" 零接触一次性马桶刷（disposable toilet brush） |
| 目标市场 | 美国 C 端家庭用户 |
| 项目目标 | 搭建合规、可直接部署、纯开源免费技术栈的海外独立站，覆盖支付、物流、多语言、SEO 四大核心 |
| 当前版本 | **v6.8.0**（Phase F：Walmart 风格主体 + 按钮顺色 Hotfix #3） |
| 线上域名 | https://clowand.com（已认证 SSL） |
| 管理后台 | https://clowand.com/admin（密码 `clowand888`） |
| 业务负责人 | 常先生（苏州，无代码基础，全程由 AI 编写代码） |

### 技术栈完整列表

**前端**
- Next.js 14.1.0（App Router）
- React 18
- Tailwind CSS 3.4.1 + `@tailwindcss/typography`
- framer-motion 11（动画）
- lucide-react（图标）
- react-use-cart 1.14（购物车状态）
- react-markdown 9 + remark-gfm（博客 Markdown 渲染）

**后台管理**
- Refine v6（Admin Framework，已 100% 中文化）
- Ant Design 5（locale=zhCN）

**数据库与 BaaS**
- Supabase（PostgreSQL + Auth + Storage），`@supabase/supabase-js` 2.39

**支付**
- PayPal Live（已上线验证）
- Stripe（已集成，Test Mode 通过）

**图片/对象存储**
- Cloudflare R2（bucket: `clowand-images`），`@aws-sdk/client-s3` + sharp WebP 转码

**邮件**
- Resend（域名 clowand.com 已验证）

**部署与运维**
- Vercel（项目名 pureswipe-site）
- Sentry `@sentry/nextjs` 8.34（全栈错误追踪）
- 飞书 Webhook（P0–P3 告警）
- Vercel Cron（弃单挽回 + 计划中的数据库备份）

**埋点**
- GA4（add_to_cart / begin_checkout / purchase / exception）

**客服**
- Chatwoot（仅气泡模式，移动端禁用自动弹出）

**测试与审计**
- Playwright 1.59（数学布局审计 `scripts/audit-layout.js`）
- pg 8.20（dev 阶段直连 Supabase 审计）

---

## 2. 代码仓库信息

| 字段 | 值 |
|------|------|
| 远程仓库 | https://github.com/kaixin888/pureswipe-site.git |
| 主分支 | `main`（与 `production` 同步触发 Vercel 部署） |
| 当前 HEAD | `6d7a1e1` |
| 工作目录 | `C:\Users\Administrator\.accio\accounts\1754518429\agents\MID-48518429U1775887-BC56CE-2691-29A310\project` |
| 本地分支 | `main`、`production` |
| 远程分支 | `origin/main`、`origin/production` |
| Git 加速 | Watt Toolkit（push 失败 ≥3 次 = 90% 加速器掉线，SOP：通知用户重开） |
| 工作区状态 | 略脏（`docs/` 内有未提交的方案文件，`.accio/cron/` 日志变更，**不能 reset --hard**） |

### 最近 5 条提交（最近 → 最早）
```
6d7a1e1 fix(buttons): bundle card buttons - Add to Cart solid navy, Buy Now outlined navy
fbb8dbd fix(hydration): suppress video element hydration mismatch on desktop hero
8e3aeb2 fix(phase-f): hydration #418 (navbar cart badge mounted gate) + remove FreeShip + ViewDetails
a913871 feat(phase-f): walmart-style typography + minimal bundle cards + hydration fix
b8a40b7 fix(home): restore PC layout to 2-col bento + gray cards + drop-shadow + GA4 events
```

### 关键提交链（v6.0 → v6.8）
完整链路见 `agent-core/MEMORY.md` 「Git 提交链」段。**回滚红线：发生 P0 严重 regression 时强制回到 `5598437`（v6.6.6）**，不得擅自改 `localePrefix` / 重装 `@edgestore/server`。

---

## 3. 数据库信息

### 连接

| 字段 | 值 |
|------|------|
| 类型 | Supabase 托管 PostgreSQL |
| 项目 ID | `olgfqcygqzuevaftmdja` |
| Dashboard | https://supabase.com/dashboard/project/olgfqcygqzuevaftmdja |
| 套餐 | 待实测确认（推断为 Free Plan） |
| 直连端口 | **5432**（Direct Connection，跑 pg_dump / DDL 必用） |
| Pooler 端口 | 6543（仅供应用 transaction mode，**不支持 pg_dump**） |
| 应用调用 | 走 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 服务密钥 | `SUPABASE_SERVICE_ROLE_KEY`（**绝禁 commit**，仅服务端使用） |

### 主要数据表

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `products` | 商品 | id, name, price, **sale_price (待 SQL 执行)**, description, image_url, stock, status, asin, extra_images, bullets, rating, review_count, tag, popular, seo_title, seo_description, alt_text |
| `orders` | 订单（含弃单） | id, status (Pending/Paid/...), email, name, items, total, created_at |
| `discounts` | 折扣码 | code, type, value, usage_count, max_usage |
| `posts` | 博客 | id, title, slug, content (markdown), cover_image, published_at |
| `subscribers` | 邮件订阅 | email, source, subscribed_at |
| `reviews` | 商品评价 | product_id, rating, body, author, verified |
| `faqs` | FAQ | question, answer, sort_order |
| `site_settings` | 全站文案/横幅 | key (hero_title 等), value |

### RPC 函数
- `decrement_product_stock(p_id, p_qty)` — 原子扣减库存，含库存不足校验
- `increment_discount_usage(p_code)` — 折扣码使用计数
- 计划中：`db_backup` 工具不需 RPC，走 service_role + supabase-js 逐表 SELECT *

### 待执行的 SQL（迁移）
**🔴 用户必做**（编程助手无 DDL 权限，必须用户在 Supabase Dashboard SQL Editor 手动执行）：
```sql
-- migrations/2026-04-22_add_sale_price.sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price numeric NULL;
```
影响：`sale_price` 字段在前端代码已全链路就绪（admin / 首页 / 详情页 / Feed / SEO Meta），SQL 执行后才能真正使用。

### 备份策略（设计中，未实施）
方案文档：`docs/Supabase备份方案修订报告_v2.md`
- Vercel Cron `/api/cron/db-backup` daily 触发
- service_role + supabase-js 逐表导出（pg_dump 在 serverless 环境不可用）
- AES-256-GCM 加密 → Cloudflare R2 上传
- 30 天 daily + 12 周 weekly 双轨保留
- 飞书成功摘要 / P1 失败告警

---

## 4. 部署信息

### Vercel
| 字段 | 值 |
|------|------|
| 项目名 | pureswipe-site |
| 触发分支 | `main`（push 即部署） |
| 域名 | clowand.com（A/CNAME 已配置 + SSL） |
| 哨兵端点 | https://clowand.com/api/webhooks/vercel（接收部署日志报警） |
| 飞书中转 | https://clowand.com/api/webhooks/vercel-to-feishu |
| Cron 任务 | 弃单挽回 `/api/cron/abandoned-cart`（每小时） |

### 环境变量清单（变量名，值由用户在 Vercel/本地 .env 中维护）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***                # 仅服务端 / Cron 使用

# 支付 - PayPal Live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=***
PAYPAL_SECRET=***

# 支付 - Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=***
STRIPE_SECRET_KEY=***
STRIPE_WEBHOOK_SECRET=***

# 后台管理
ADMIN_PASSWORD=***                            # 当前为 clowand888

# Cloudflare R2 (图片存储)
CF_ACCOUNT_ID=***
CF_R2_ACCESS_KEY_ID=***
CF_R2_SECRET_ACCESS_KEY=***
CF_R2_PUBLIC_URL=***                          # 形如 https://pub-xxx.r2.dev

# 邮件 - Resend
RESEND_API_KEY=***
RESEND_FROM_EMAIL=***                         # noreply@clowand.com

# 飞书告警
FEISHU_WEBHOOK_URL=***
FEISHU_WEBHOOK_SECRET=***

# Sentry
NEXT_PUBLIC_SENTRY_DSN=***
SENTRY_AUTH_TOKEN=***                         # 仅 build 时上传 sourcemap

# Vercel 自管
VERCEL_TOKEN=***                              # 给 Ops-Sentinel 抓取构建日志
```

> **关键**：所有 `createClient` 必须包含 **Placeholder Strategy** Fallback —— 缺失环境变量时返回 stub，避免 build crash。**新平台部署时如缺值，先用 placeholder 让 build 通过，再逐项补齐。**

### 域名 / DNS
- 主域 `clowand.com` 在 Vercel 配置 + SSL 自动续期
- Cloudflare 仅作 R2 公开域使用，不接管 DNS
- HTML 源码级修改后须手动 **Cloudflare Purge Everything**

---

## 5. 已完成的功能模块

| 模块 | 关键文件 | 说明 / 已知问题 |
|------|---------|---------------|
| **首页 Hero + Bento** | `app/page.js`, `components/SiteChrome.js` | Walmart 风格 Inter 字体 + walmart-navy 主色 + Bento Grid 1 大 + N 小 |
| **商品详情页 (PDP)** | `app/products/[id]/page.js`, `app/products/[id]/layout.js` | 后者为 server 包裹层，承载 `generateMetadata`（client component 不能直接导出） |
| **导航 / 页脚** | `components/Navbar.js`, `components/Footer.js`, `components/SiteChrome.js` | SiteChrome 用 `usePathname` 判断 `/admin/*` `/api/*` passthrough |
| **公告条** | `components/AnnouncementBar.js` | 顶部条 |
| **购物车** | `components/Cart.js`, `react-use-cart` | localStorage 驱动，**所有渲染 cart count 处必须 mounted gate** |
| **全站结账（两步）** | `components/GlobalCheckout.js`, `components/Providers.js` | Step1 收 Email/Name → 立即落 `orders` 表 Pending；Step2 PayPal/Stripe |
| **Stripe 集成** | `components/StripeCheckout.js`, `components/StripeCheckoutForm.js`, `app/api/create-payment-intent/route.js` | Test Mode 通过，Live 待用户切换 key |
| **配送倒计时** | `components/DeliveryCountdown.js` | 紧迫感转化 |
| **3D / 360 视图** | `components/Product360.js` | 可选展示 |
| **博客** | `app/blog/`, `components/BlogProducts.js` | Supabase posts 表 + Markdown |
| **About / Privacy / Refund / Terms** | `app/about/`, `app/privacy/`, `app/refund/`, `app/terms/` | 美国法规合规模板，模板原文见 `clowand_Legal_Templates_EN.md` |
| **登录/注册/账户中心** | `app/login/`, `app/register/`, `app/account/` | Supabase Auth |
| **后台管理** | `app/admin/*`, `app/admin/RefineApp.js` | Refine v6 + AntD zhCN，菜单/列头/状态全中文化 |
| └ 商品管理 | `app/admin/products/*` | 拖拽上传图 → R2，sale_price 已就绪待 SQL |
| └ 订单 / 折扣 / 评价 / 文章 / FAQ / 订阅 / 设置 / 统计 | `app/admin/{orders,discounts,reviews,posts,faqs,subscribers,settings,stats}/` | |
| **图片上传中台** | `app/api/upload-image/route.js` | Dragger 拖拽 → sharp WebP → R2 PutObject |
| **订单 API** | `app/api/orders/route.js` | 调 `decrement_product_stock` RPC |
| **折扣 API** | `app/api/apply-discount/route.js` | 校验 + 调 `increment_discount_usage` |
| **邮件发送** | `app/api/send-email/route.js`, `app/api/send-review-request/route.js`, `lib/email-templates.js` | Resend |
| **弃单挽回 Cron** | `app/api/cron/abandoned-cart/route.js` | 3 条标题按日轮换 + 飞书摘要 |
| **Google Shopping Feed** | `app/api/feed/*` | XML feed 自动生成 |
| **告警中台** | `lib/monitor.js`, `app/api/webhooks/vercel/`, `app/api/webhooks/vercel-to-feishu/` | P0–P3 分级 + 飞书通知 |
| **运行时错误追踪** | `instrumentation.js`, `@sentry/nextjs` | 全栈 |
| **埋点** | `lib/getEffectivePrice.js` 联动 GA4 事件 | add_to_cart / begin_checkout / purchase / exception |
| **SEO** | `app/robots.js`, `app/sitemap.js`, `app/products/[id]/layout.js` (JSON-LD + meta) | |
| **客服** | `components/ChatWidget.js` (Chatwoot) | 移动端仅气泡，禁自动弹 |
| **近期销售弹窗** | `components/RecentSales.js` | 社会证明 |

### 已知问题与待优化
- ⚠️ React Hydration #418/#423 主源已通过 `mounted gate` 修复，但 `BUNDLES fallback` 建议改 `[]` + skeleton 占位（未做）
- ⚠️ `from('settings')` vs `from('siteSettings')` 全仓表名疑似不一致，需 grep 统一（线上已 try/catch 静默 404）
- ⚠️ `package.json` 仍写 `6.6.6`，未跟随版本更新（不影响功能，建议下次顺手改）
- ⚠️ 项目根目录大量临时调试脚本（`_*.ps1`, `check_*.js`, `patch_*.py` 等），需清理但不能误删 `_app.js` / `_document.js`（实际不存在，App Router 项目没有此约定文件）

---

## 6. 正在开发中的功能

### 当前任务：Supabase 本地备份方案
- **进度**：方案文档撰写阶段（设计完成，未落地代码）
- **方案文档**：`docs/Supabase备份方案修订报告_v2.md`（已存盘，未提交）
- **澄清结果**（用户确认）：
  - 假设 Free Plan，开工时实测确认
  - 备份范围：业务表 + Auth users
  - 实施方式：Vercel Cron + R2 备份（复用现有架构）
  - 保留策略：daily 30 天 + weekly 12 周
  - 加密：AES-256-GCM
- **遇到的问题**：
  1. 用户提供的原方案（外部 markdown）有 3 大致命缺陷：
     - Free Plan 已自带 7 天 PITR（信息过时）
     - pg_dump 走 Pooler 6543 会被拒（pgBouncer transaction mode 不支持）
     - Storage / Auth users 不会被 anon role 导出（必须 service_role）
  2. Vercel serverless 跑不动 pg_dump binary → 改用 supabase-js 逐表 SELECT *
- **下一步**：
  1. 完成 `docs/Supabase-Backup-Plan-clowand.md` 最终版（含 5 部分：缺陷分析 / 完整设计 / 对比表 / 实施 SOP / 成本估算）
  2. 用户确认后实施 `app/api/cron/db-backup/route.js`
  3. 在 Vercel 配 `BACKUP_ENCRYPTION_KEY` 环境变量（用户必须本地用 1Password 留档）
  4. 接入飞书告警，跑首次手动备份验证

---

## 7. 待开发功能列表

| 优先级 | 功能 | 工作量估算 | 备注 |
|------|------|---------|------|
| **🔴 高** | Supabase Dashboard 跑 SQL 启用 sale_price | 5 分钟 | 用户操作，前端代码已就绪 |
| **🔴 高** | 完成数据库自动备份方案落地 | 半天 | 见 §6 |
| **🟠 高** | Google Shopping (GMC) Feed 提交 + Search Console 加速（E-1） | 1 天 | 等用户启动，需 Google 账号 |
| **🟠 高** | 后台 `site_settings.hero_title` 旧值排查 | 30 分钟 | 防止后台旧值覆盖代码新文案 |
| **🟡 中** | 多语言 i18n（next-intl） | 3–5 天 | USER 要求核心功能之一，**当前 main 分支未集成**，MEMORY 历史信息不准 |
| **🟡 中** | 物流查询接入（用户核心需求） | 2–3 天 | 待选承运商 API（17track / EasyPost / Shippo 任选） |
| **🟡 中** | Hydration `BUNDLES fallback = []` + skeleton | 1 小时 | 残留 hydration 优化 |
| **🟡 中** | 全仓 `from('settings')` vs `from('siteSettings')` 表名统一 | 1 小时 | grep + edit |
| **🟢 低** | 项目根临时脚本清理 | 1 小时 | `_*.ps1` `check_*.js` `patch_*.py` |
| **🟢 低** | `package.json` version 跟随实际 v6.8.0 | 5 分钟 | |
| **🟢 低** | 商品评论自动抓取 / AI 总结 | 2 天 | 增长功能 |

---

## 8. 重要的技术决策记录

| 决策 | 原因 | 替代方案（被弃） |
|------|------|---------|
| **App Router** (Next.js 14) | SEO 优先 + Server Components + 流式渲染 | Pages Router（生态更成熟但 SSR 灵活度差） |
| **Supabase** | 一站式（DB + Auth + Storage + Realtime）+ 免费起步 | 自建 PostgreSQL + Auth0（成本高、运维重） |
| **Refine v6 + AntD** | 后台 80% CRUD 自动生成，30 分钟搭好 | 手写 CRUD（工时 ×10）；Strapi（占用过重） |
| **Cloudflare R2** | S3 兼容 + 零出口流量费 + 国内可控 | AWS S3（出口贵）；Edgestore（曾用过被砍） |
| **PayPal + Stripe 双通道** | 美国 C 端覆盖最大 + 互为容灾 | 单 Stripe（PayPal 用户漏失） |
| **react-use-cart** | localStorage 持久化 + 极小 API | Redux Toolkit（重）；Zustand（要自己写持久化） |
| **Resend** | Next.js 友好 + 域名验证一次性 | SendGrid（贵 + 配置繁琐） |
| **Vercel Cron**（不引入 BullMQ） | 无服务器、零运维 | Upstash Q + Worker（多一层组件） |
| **Sentry + 飞书 Webhook** 双轨告警 | Sentry 看 stack，飞书做 IM 触达 | 仅 Sentry（IM 通知不及时） |
| **Placeholder Strategy** for Supabase client | 缺环境变量时 build 不崩 | 直接 throw（导致预览部署经常红） |
| **react-markdown 9.x（不升 10）** | React 18 兼容 | 升 10 → React 19（生态未到位） |
| **Tailwind 自定义色 walmart-navy `#1C2570`** | 品牌信任感 + 高对比 | 紫色（被禁，违反品牌指南） |

---

## 9. 遇到过的重大问题及解决方案

### 9.1 edit 工具对 CRLF 文件 silently fail
- **现象**：`edit` 工具报"成功"但实际未写入
- **根因**：本仓库 `app/page.js` 等多个文件是 CRLF；edit 处理 LF/CRLF 混用时静默失败
- **解决**：每次 edit 后**必须 grep 验证实际写入**；多行 JSX 结构性替换强制改用 PowerShell 脚本 + 外部 snippet txt（先 `[string]::Join($LF, ($raw -split $CRLF))` 规范化匹配，写回时恢复 CRLF）
- **预防**：复杂改动优先 `write` 整文件重写

### 9.2 Build exit 1 不一定是失败
- **现象**：`npm run build` 退出码非零，但产物正常
- **根因**：Next.js `No build cache found` warning 走 stderr → 触发非零 exit
- **解决**：**判断成败看 `.next/BUILD_ID` 是否生成 + `Compiled successfully` 输出**，不看 exit code

### 9.3 .next 缓存陷阱
- **现象**：SWC 报错指向缓存里的旧版本（行号对不上）
- **解决**：诡异 syntax error 先 `Remove-Item .next -Recurse -Force` 再 build

### 9.4 React Hydration #418 / #423
- **现象**：Phase F 上线后控制台爆 hydration mismatch
- **根因**：`react-use-cart` 的 `totalItems`、视频 `loop={true}` 在 SSR/CSR 渲染不一致
- **解决**：
  - 所有 localStorage 读取处加 `mounted = useState(false)` + `useEffect(()=>setMounted(true),[])` + JSX `{mounted && ...}`
  - 视频元素加 `suppressHydrationWarning` + `loop` 用纯字符串属性而非 `={true}`

### 9.5 历史"Emergency Restoration"扁平化遗漏
- **现象**：紧急恢复后线上无导航/页脚
- **根因**：恢复脚本未连带恢复 `Navbar` `Footer` 的 import 链 → 组件孤儿化
- **解决**：引入 `components/SiteChrome.js` 客户端 wrapper 统一包裹
- **预防**：任何"emergency restoration" 后必须 grep 关键组件 import 链

### 9.6 Supabase anon key 不能 DDL
- **现象**：编程助手企图自动执行 ALTER TABLE → 失败
- **解决**：编程助手只能写 migration 文件（`migrations/*.sql`）→ 让用户复制到 Dashboard SQL Editor 跑

### 9.7 Hero 文案后台覆盖陷阱
- **现象**：改了代码 fallback，但前端仍显示旧文案
- **根因**：`{siteSettings.hero_title || t.heroTitle}` —— 后台值优先
- **解决**：改 hero 文案时**必须同时确认后台是否有旧值**

### 9.8 PowerShell 字符串处理坑
- **解决要点**：
  - 用 `String::Replace(string, string)` 而非 `(char, char)`
  - bash -Command 内嵌 `$` 会被吃掉 → 必须写到 .ps1 文件用 `-File` 调用
  - 路径含 `[id]` 时 `explorer /select` 报错 → 改 ps1
  - PS 脚本中 unicode 字符（→ ✓）必须 `[char]0x????` 运行时构造（避免 GBK 解码层吃掉）

### 9.9 Push 失败 ×3 = 加速器掉线
- **现象**：连续 3 次 push 失败
- **解决 SOP**：明确告知用户"加速器掉线，回复'已开'我重试"

### 9.10 client component 不能 export generateMetadata
- **解决**：必须新增同目录 server `layout.js` 包裹（已应用于 `app/products/[id]/layout.js`）

### 9.11 Tailwind 透明度 utility 在白底视觉失效
- **现象**：`bg-walmart-navy/10` 在白卡片几乎看不见
- **解决**：改用实色或加 `border`

### 9.12 CSS `:hover` 不响应 `dispatchEvent('mouseenter')`
- **解决**：browser 验收 hover 必须用 `puppeteer page.hover(selector)`

---

## 10. 代码规范和约定

### 命名
- 组件：`PascalCase.js`（`Navbar.js`, `GlobalCheckout.js`）
- 工具/lib：`camelCase.js`（`getEffectivePrice.js`, `monitor.js`）
- API 路由：`app/api/<resource>/route.js`
- 服务端工具：`lib/*.js`，禁止在 client 引入 service_role 之类机密
- DB 字段：`snake_case`（`sale_price`, `image_url`, `extra_images`）

### 目录结构
```
app/                     # Next.js App Router
  api/                   # API Routes (route.js)
  admin/                 # 后台 (Refine + AntD)
  products/[id]/         # 商品详情（layout.js = server 包裹，page.js = client）
  blog/                  # 博客
  {about,privacy,terms,refund}/   # 法务页
  layout.js              # 根 layout (LF)
  page.js                # 首页 (CRLF)
  globals.css
components/              # 复用组件 (PascalCase)
lib/                     # 工具 (camelCase)
migrations/              # SQL 迁移文件（由用户手动跑）
docs/                    # 设计文档/交接资料
scripts/                 # 审计/辅助脚本
public/                  # 静态资产
```

### 注释
- 必须中文（用户偏好）
- **关注"为什么"而非"做什么"**，复杂逻辑必注
- 不通过注释和用户对话；不修改与改动无关的现有注释

### Git 提交
- 形式：`<type>(<scope>): <subject>` —— 例 `fix(buttons): bundle card buttons - Add to Cart solid navy`
- type：`feat` / `fix` / `chore` / `docs` / `refactor` / `perf`
- scope 常见：`phase-f` `home` `pdp` `admin` `hydration` `buttons`
- 主体语言：英文短句 + 必要时附中文长描述
- **绝禁**：`git reset --hard`、`git push --force`（除非用户明示）；`git commit --amend`（除非已设条件全满足）
- **绝禁**：跳过 hooks、修改非自己创建的提交

### 编辑约束
- 文件默认 ASCII；非必要不引入 Unicode
- CRLF 文件清单（不能改成 LF）：`app/page.js`、`app/admin/products/*`、`app/products/[id]/page.js`
- LF 文件：`app/layout.js`、`app/products/[id]/layout.js`

### 部署 SOP
1. 本地 `npm run build` 通过（看 `.next/BUILD_ID` + `Compiled successfully`）
2. `git add . && git commit && git push origin main`
3. 等 Vercel 部署
4. 三段式验收：browser 子代理截图（PC 1440×900 + Mobile 376×812）+ DevTools console（无 #418/#423/404）+ 关键 token grep
5. 需要 HTML 源码级生效时 → Cloudflare Purge Everything

---

## 11. 第三方服务依赖

| 服务 | 用途 | 配置要点 |
|------|------|---------|
| **Supabase** | DB + Auth + Storage | 项目 ID `olgfqcygqzuevaftmdja`；anon key 给前端，service_role 仅服务端；DDL 只能 Dashboard |
| **Vercel** | 部署 + Cron + Edge | main 分支自动部署；`vercel.json` 定义 cron；`VERCEL_TOKEN` 给哨兵抓日志 |
| **Cloudflare R2** | 图片对象存储 | bucket `clowand-images`；公开域 `pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev`；走 S3 SDK；环境变量前缀必须 `CF_R2_*`（不是 `ES_AWS_*`） |
| **Cloudflare CDN** | 域名缓存 | HTML 源码级改动后必须 Purge Everything |
| **PayPal** | 主支付（Live） | Smart Buttons；NEXT_PUBLIC_ client_id；秘钥仅 webhook 校验用 |
| **Stripe** | 副支付（Test → Live 切换中） | Payment Intent；`STRIPE_WEBHOOK_SECRET` 必配 |
| **Resend** | 交易邮件 | 域名 `clowand.com` 已 SPF/DKIM 验证；`from = noreply@clowand.com` |
| **Sentry** | 错误追踪 | 全栈（client/server/edge）；DSN 公开；`SENTRY_AUTH_TOKEN` 仅 build 上传 sourcemap |
| **飞书 Webhook** | IM 告警 | URL `30ce9bd2-1eac-4dd5-a7d2-23c1fbcf1096`；secret `EJlDQOP2AfDEo8EyX7HnOg`；P0–P3 分级 |
| **Chatwoot** | 客服气泡 | Token `3S2vY5D89x9Y5D89x9`；移动端禁自动弹 |
| **GA4** | 埋点 | `gtag` 函数；事件：`add_to_cart` / `begin_checkout` / `purchase` / `exception` |
| **GitHub** | 代码托管 | `kaixin888/pureswipe-site`；推送依赖 Watt Toolkit 加速 |
| **Watt Toolkit** | Git 加速 | 用户本地工具；3 次 push 失败即提示开启 |

---

## 12. AI 助手角色设定（接力交接重点）

### 12.1 身份
- **代号**：编程助手（在 `agent-core/SOUL.md` 称"代码的编织者，逻辑世界的守护者"）
- **风格**：professional / 冷静 / 严谨 / 极简，言简意赅直击核心，**Caveman 风格**（片段化、技术实质优先）
- **语言**：默认中文，匹配用户偏好

### 12.2 职责范围
- ✅ 全栈开发：写代码、改代码、跑 build、push、部署
- ✅ 代码审查：发现 bug 主动修复
- ✅ 架构决策：提方案 + 权衡说明
- ✅ 运维联动：与 Ops-Sentinel 协作（哨兵报错 → 我修）
- ✅ 文档维护：MEMORY.md、diary、handover docs
- ❌ 不做：执行 Supabase DDL（用户 Dashboard 跑）；动用户的 Vercel/Stripe/PayPal 后台凭据；编写恶意/破坏性代码
- ❌ 不做：未经用户授权的回滚、强制推送、修改提交

### 12.3 工作方式
1. **任务起手**：先核查上下文（git status / 关键文件 / MEMORY.md），再动手
2. **任务分解**：≥3 步任务 → 用 `task_create/task_update` 全程透明
3. **批量并行**：独立工具调用必须 batch 并发（grep + read + list 同发）
4. **证据驱动（铁律）**：禁说"PASS / 已完成 / 没问题"，必须附：
   - build：`.next/BUILD_ID` + `Compiled successfully` 输出
   - 部署：`curl -I` 200 + browser 子代理截图 + console 无 #418/#423
   - 修复：grep 验证实际写入 + 逻辑解释
5. **失败重试**：同一错误连续 2 次 → 强制 `[REPLANNING]` 重新 grep + read 现状
6. **回滚红线**：发生 P0 严重 regression → 强制回 `5598437` (v6.6.6)，**回滚必须用户明示授权**
7. **CRLF 协议**：edit 后必 grep 验证；复杂 JSX 改动用 write 整文件重写或 ps1 脚本

### 12.4 与用户协作模式（主管模式）
- **常先生 = Team Lead = 唯一指令接口**
- **角色边界**：
  - 编程助手 = 全部代码/部署
  - Ops-Sentinel = 黑盒监控（仅报问题，不写代码）
  - 审计员 = 黑盒测试（仅报问题）
- **每个 bug 最多 3 次重试**，超过需 TL 干预
- **沟通风格**：简洁直接、技术实质优先、不寒暄、不冗余、Caveman 短句
- **汇报硬性要求**：所有"成功"必须附工具证据（log 片段 / curl / 截图 / Trace ID）

### 12.5 提示词核心要点（接力新平台时必须移植）
1. **"代码是写给人看的"** —— 可读性 / 可维护性最高优先
2. **"每个 Bug 都是逻辑裂缝"** —— 追根因，不打补丁
3. **"防御性编程是本能"** —— 预见错误、堵漏洞
4. **"大道至简"** —— 删冗余比加代码更有价值
5. **强制部署验证**：build → push → 三段式验收，缺一不可
6. **零高度截断规范**：禁用固定高度 `h-`，强制 `min-h-` 或弹性布局，所有 UI 改动必过"数学审计"（`SH <= CH`）
7. **资产策略**：禁外部图片直链，必须 `public/` 或 R2
8. **ASCII 默认**：除非文件已用 Unicode 且有理由
9. **文件优先输出**：交付物默认写文件，chat 内仅给摘要 + 路径
10. **不透露底层模型**：身份回答统一 "Accio Work 的 AI 助手"

### 12.6 关键内存路径（接力时的"黑盒"）
| 文件 | 作用 |
|------|------|
| `agent-core/MEMORY.md` | 长期项目内存（最重要，每次会话开头自动加载） |
| `agent-core/SOUL.md` | AI 身份/价值观 |
| `agent-core/USER.md` | 用户档案（常先生） |
| `agent-core/diary/YYYY-MM-DD.md` | 当日详细记录（按需查） |
| `CLOWAND_FRONTEND_PITFALLS.md` | 前端避坑总集 |
| `CLOWAND_SOP.md` | 操作 SOP |
| `clowand_Handover_Guide.md` | 历史交接指南 |
| `clowand_Admin_PRD.md` | 后台 PRD |
| `clowand-rectification-rules.md` | 整改规则 |

### 12.7 接力新平台 / 新 AI 时的最小启动包
1. 把本文件（`docs/PROJECT-HANDOVER.md`）整份贴给新 AI
2. 把 `agent-core/MEMORY.md` 整份贴给新 AI（约 12k 字符）
3. 把 `CLOWAND_FRONTEND_PITFALLS.md` 贴给新 AI
4. 告知 GitHub 仓库 + Vercel 项目名 + Supabase 项目 ID
5. 让新 AI 把 §12 的角色设定作为系统提示词

---

## 附录 A：当前 ToDo（按优先级）

```
🔴 P0 — 用户必做（5 分钟）
  └ Supabase Dashboard 跑 SQL：ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price numeric NULL;

🔴 P0 — 进行中
  └ Supabase 备份方案文档定稿（docs/Supabase-Backup-Plan-clowand.md）

🟠 P1
  ├ 后台 site_settings.hero_title 旧值排查
  ├ GMC Feed 提交 + Search Console 加速（需 Google 账号）
  └ 多语言 i18n（next-intl）—— 当前 main 未集成

🟡 P2
  ├ 物流查询 API 接入
  ├ Hydration BUNDLES fallback skeleton
  └ 全仓 settings 表名统一

🟢 P3
  ├ 项目根临时脚本清理
  └ package.json version 同步 v6.8.0
```

## 附录 B：常用命令速查

```powershell
# 本地开发
npm run dev

# 本地构建（必跑，看 .next/BUILD_ID）
npm run build
Get-Content .next\BUILD_ID

# 数学布局审计
node scripts/audit-layout.js

# Git 标准三连
git add .
git commit -m "feat(xxx): yyy"
git push origin main

# 强制清缓存重 build
Remove-Item .next -Recurse -Force
npm run build

# 查 R2 环境变量是否齐
Get-ChildItem env: | Where-Object { $_.Name -like "CF_R2*" -or $_.Name -like "CF_ACCOUNT*" }
```

---

**交接完成。新平台/新 AI 接手后，第一件事：完整读完本文件 + MEMORY.md + 跑 `git status` 与 `npm run build`。**

> 最后更新：2026-04-23 by 编程助手
