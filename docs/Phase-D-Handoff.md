# Clowand 独立站 — Phase D 交付纪要

> **致产品经理**：本文档为编程助手与团队负责人本次会话的完整纪要，包含决策记录、改动清单、验收路径与遗留事项。可直接作为发布说明 / 周报附件。

---

## 1. 项目背景

| 项 | 内容 |
|---|---|
| 项目 | clowand 跨境电商独立站（美国市场，主营家居一次性马桶刷） |
| 域名 | https://clowand.com |
| 技术栈 | Next.js 14.1.0 (App Router, JS) + Supabase + Refine v6 + Antd + Tailwind |
| 部署 | Vercel（push `main` 自动部署，约 90 秒） |
| 当前线上版本 | v6.6.10 → **v6.6.11 (Phase D)** |
| Git 远程 | https://github.com/kaixin888/pureswipe-site.git |

---

## 2. 本次会话目标

执行 **Phase D：营销基座与自动化**，三项并行：

1. **D-1 Google Shopping Feed 加固** — 对接 Google Merchant Center (GMC)
2. **D-2 弃单挽回系统升级** — 1 小时自动邮件 + CTR 优化
3. **D-3 商品页 SEO 自动 Meta** — 基于 `alt_text` 自动生成 SEO 标签

---

## 3. 关键约束（贯穿全程）

| # | 约束 | 原因 |
|---|---|---|
| 1 | 严禁回滚到 v6.6.6 | 尊重 v6.6.8 现状（方案 A） |
| 2 | 保持 `localePrefix: 'as-needed'`，**不引入 next-intl** | 用户明令保护现有 SEO |
| 3 | 不修改前台导航逻辑 | 历史已有 SiteChrome 修复，避免连锁回归 |
| 4 | 本地 `npm run build` 必须通过才能 push | 部署前置闸门 |
| 5 | CRLF/LF 行结尾敏感 | Windows 环境下 edit 工具易破文件，复杂改动用 `write` 整文件 |
| 6 | 严禁伪造 build 日志、伪造 commit hash | 证据驱动协议 |

---

## 4. 摸底数据（动手前的现状核查）

### 4.1 Google Feed（升级前）

- 文件：`app/api/feed/google/route.js` （43 行）
- ✅ 有：`g:id / g:title / g:description / g:link / g:image_link / g:condition / g:availability / g:price / g:brand / g:google_product_category`
- ❌ 缺（GMC 必需 / 推荐）：
  - `g:mpn`（厂家货号）
  - `g:identifier_exists`（无 GTIN 时必填 `no`）
  - `g:shipping`（运费节点）
  - `g:sale_price`（折扣价）
  - `g:additional_image_link`（多图）
  - `g:item_group_id`（变体分组）
  - `g:product_type`（站内分类树）
  - `g:mobile_link`（移动端 URL）
  - CDATA 包裹 description（防 XML 注入）
  - 价格强制 `.toFixed(2)`

### 4.2 弃单 Cron（升级前）

- 文件：`app/api/cron/abandoned-cart/route.js` （67 行）
- 配置：`vercel.json` 已注册 `0 * * * *`（每小时整点）
- ✅ 有：`CRON_SECRET` 鉴权、Resend API、Supabase 查 `Pending + abandoned_email_sent=false + < 1h ago`、`abandoned_email_sent=true` 防重发
- ❌ 缺：CTR 优化（单条标题）、运行结果可观测性（无飞书告警）

### 4.3 商品页 SEO（升级前）

- 文件：`app/products/[id]/page.js`
- 标记：`'use client'`（**Client Component**）
- ❌ **完全没有 `generateMetadata`** → 商品详情页 SEO 标签全靠 root layout 默认值，搜索结果展示惨淡

### 4.4 Supabase `products` 表实测字段

```
id, name, price, description, image_url, stock, status, created_at,
asin, extra_images, bullets, rating, review_count, tag, popular,
seo_title, seo_description, alt_text
```

> **关键发现**：`seo_title / seo_description / alt_text` 三个 SEO 字段已在 schema 中，前台已用，但商品页元数据**从未消费过它们** — 这正是 D-3 的修复目标。
>
> **未发现**：`sale_price` 字段不存在 → Feed 中前向兼容设计（数据库加列后自动启用）。

---

## 5. 决策记录

| 议题 | 候选 | 决定 | 依据 |
|---|---|---|---|
| Feed description 包裹方式 | CDATA / xmlEscape | **CDATA + 转义 `]]>`** | 商品描述含 emoji / 破折号易破 XML，CDATA 最稳；同时防 CDATA 嵌套破坏 |
| `identifier_exists` 取值 | yes（要求 GTIN）/ no | **no** | 自有品牌无 UPC/EAN，`asin` 走 `mpn` 即可；GMC 接受此组合 |
| 弃单邮件主题策略 | 单条固定 / A/B 平台 / 轮换 | **3 条按日轮换** | 无外部 A/B 平台前提下最简单的 CTR 防疲劳方案；`Date.now()/86400000 % 3` 实现 |
| SEO Meta 实现位置 | 改 page.js 拆 server / 新增 layout | **新增 `[id]/layout.js`** | page.js 是 client，零改动 = 零回归风险；layout 包裹是 Next 14 App Router 标准做法 |
| Meta description 来源优先级 | 单一来源 / 兜底链 | **`seo_description → description → alt_text`** | 三段兜底，`alt_text` 通常含 SEO 关键词 |
| JSON-LD 注入位置 | `<head>` / `<body>` | **layout 顶层 `<script>` 标签** | App Router 中 layout 是最早渲染层，Google 抓取无延迟 |
| 是否额外安装 `@edgestore/*` | 装 / 不装 | **不装**（沿用前两次会话决定） | 已用 `@aws-sdk/client-s3 + sharp` 直连 R2，无需重复造轮子 |

---

## 6. 改动清单（commit `12a12ec`）

### 6.1 D-1 Google Feed 加固

**文件**：`app/api/feed/google/route.js`（43 行 → 113 行）

**新增能力**：
- `<g:mpn>` 用 `product.asin` 兜底为 `CLW-{id前8位}`
- `<g:identifier_exists>no</g:identifier_exists>`
- `<g:shipping>` 嵌套节点（US Free Standard Shipping）
- `<g:product_type>Home > Bathroom > Toilet Cleaning</g:product_type>`
- `<g:item_group_id>` 用 `product.tag` 作变体分组
- `<g:additional_image_link>` 解析 `extra_images` JSON 字段，最多 10 张
- `<g:mobile_link>` 与 `<g:link>` 同 URL（响应式站点）
- `<g:custom_label_0>` 装载 `alt_text` → 给 GMC Smart Shopping 关键词路由
- `<g:sale_price>` **前向兼容**（`product.sale_price` 不存在时静默跳过）
- 价格 `.toFixed(2)` 强制 2 位小数
- CDATA 包裹 + 转义 `]]>` 防 XML 注入
- `Cache-Control: public, s-maxage=3600, stale-while-revalidate=600`

### 6.2 D-2 弃单 Cron CTR 优化

**文件**：`app/api/cron/abandoned-cart/route.js`（67 行 → 122 行）

**新增能力**：
- 3 条标题按日轮换（CTR 防疲劳）：
  1. `You left something behind, {{name}} 🛒`
  2. `Still thinking it over? Your cart is waiting`
  3. `{{name}}, your Clowand kit is one click away`
- 飞书 Webhook 摘要（成功 / 失败计数 + UTC 时间戳）
- 零工作时静默（`abandonedOrders.length === 0` 不发飞书消息防 spam）
- 异常路径告警：`⚠️ [弃单挽回] Cron 失败: {error}`
- Webhook 失败 try/catch 吞掉，**永不阻塞主流程**

### 6.3 D-3 商品页 SEO 自动 Meta（新增）

**文件**：`app/products/[id]/layout.js`（**新建**，142 行）

**实现**：
- `generateMetadata({ params })` 异步函数，从 Supabase 拉商品数据
- title 优先级：`seo_title → "{name} | Clowand"`
- description 优先级：`seo_description → description → alt_text`，HTML 标签去除 + 160 字符截断
- OG: `type / url / title / description / siteName / images[1200x1200/alt]`
- Twitter: `summary_large_image` card
- Canonical URL：`https://clowand.com/products/{id}`
- Robots：`index: true, follow: true`
- 商品不存在时：`robots: { index: false }` 防止僵尸页被索引
- **JSON-LD Product Schema** 注入（脱离 metadata API，直接写 `<script type="application/ld+json">`）：
  - `Product` 主体（name / image / description / sku / mpn / brand）
  - `Offer` 嵌套（price / priceCurrency / availability / itemCondition / seller）
  - `AggregateRating` 嵌套（仅在 `rating + review_count` 都存在时输出）

**page.js 完全未动** → 零交互逻辑回归风险。

---

## 7. 构建 & 部署证据

### 7.1 本地 Build

```
✓ Generating static pages (37/37)
   Finalizing page optimization ...
   Collecting build traces ...
```

完整日志：`build_phase_d.log`

### 7.2 路由变化

| 路由 | 改动前 | 改动后 | 说明 |
|---|---|---|---|
| `/products/[id]` | ● Static | λ Dynamic | layout 中 `generateMetadata` 走 Supabase 实时拉数据 |
| `/api/feed/google` | λ Dynamic | λ Dynamic | 配 `s-maxage=3600` 边缘缓存 1 小时 |
| `/api/cron/abandoned-cart` | λ Dynamic | λ Dynamic | 维持原状 |

> **路由 Static → Dynamic 是有意为之**，目的是让商品上架/改价后 SEO Meta 即时生效；通过 OG 抓取通常 1 次/天，性能影响可忽略。

### 7.3 Git Commit

| Commit | 内容 |
|---|---|
| `12a12ec` | feat(seo+ops): Phase D — GMC feed hardening, abandoned-cart CTR rotate, auto product Meta + JSON-LD |

Push: `6b64ce0..12a12ec → main`，Vercel 自动部署触发。

---

## 8. 验收路径（产品 / 测试可直接照做）

### 8.1 Google Shopping Feed

打开：https://clowand.com/api/feed/google

**应看到**：
- `<g:mpn>` 节点
- `<g:identifier_exists>no</g:identifier_exists>`
- `<g:shipping>` 嵌套（含 `<g:country>US</g:country>`）
- 多个 `<g:additional_image_link>`（如商品有 extra_images）
- `<g:custom_label_0>` 含 alt_text

**进阶验收**：将 URL 提交到 GMC → Products → Feeds → 检查"问题"标签页应显著减少。

### 8.2 商品页 SEO Meta

任意商品页右键 → 查看源代码（示例 URL：https://clowand.com/products/d00dbb8b-c1fe-4996-9a69-736b1b6cfe5b）

**应看到**：
- `<title>...</title>` 显示商品名而非默认站名
- `<meta name="description" content="...">`（≤ 160 字符）
- `<meta property="og:image" content="...">`
- `<link rel="canonical" href="https://clowand.com/products/{id}">`
- `<script type="application/ld+json">{"@context":"https://schema.org/","@type":"Product",...</script>`

**Google 官方校验**：
- 复制商品 URL 到 [Google Rich Results Test](https://search.google.com/test/rich-results)
- 应识别为 **Product** 类型，且无 Critical Error

### 8.3 弃单挽回 Cron

- **下个整点**（如 14:00）Vercel Cron 触发
- 若有 `Pending > 1h` 且 `abandoned_email_sent = false` 的订单：
  - 客户收到一封 Resend 邮件（标题三选一）
  - 飞书告警：`🛒 [弃单挽回] YYYY-MM-DD HH:MM UTC\n检测: N 单 (>1h Pending)\n成功: X | 失败: Y`
  - 该订单 `abandoned_email_sent` 标记为 `true`，下次不再重复发送

---

## 9. 已知遗留与下一步

| # | 项 | 优先级 | 说明 |
|---|---|---|---|
| 1 | Supabase `products` 表加 `sale_price` 列 | 中 | Feed 已前向兼容，DBA 加列后立即输出 `<g:sale_price>` |
| 2 | Refine 后台 `<Table.Column title>` 列头中文化 | 低 | products / orders / posts 列表头仍是英文；上版本菜单已中文化 |
| 3 | 任务 3：Hero 文案 + Bento Grid | 待确认 | "The End of the Dirty Toilet Brush." / "Never Touch the Mess Again." + Bundles 区改 Bento Grid `rounded-[3rem]` + 斜体标题 `py-10 + overflow-visible` |
| 4 | 弃单邮件 A/B 数据回收 | 低 | 当前轮换策略仅按日切换，未做开信率回流分析；可后续接 Resend Webhook |

---

## 10. 给产品经理的 5 个观察建议

1. **GMC 提交时机** — Feed 已就绪，建议本周内在 GMC 后台新建 Feed Source 拉取，预审通过约 24-72 小时。
2. **JSON-LD 富结果生效周期** — Google 重新抓取 + 进入 SERP 通常 1-2 周；可借 Search Console 的"网址检查"工具手动请求重新抓取主力商品。
3. **弃单标题文案** — 当前 3 条均为英文 + 美国本土语境，若未来扩日 / 德 / 法语市场，需加 i18n 切片。
4. **商品 alt_text 字段使用率** — 强烈建议运营在新品上架时**强制填写 alt_text**，因为它已被 SEO Meta + GMC `custom_label_0` 双路消费。
5. **下一阶段建议** — 如 Phase D 验收通过，建议优先评估"任务 3 Hero 文案 + Bento Grid"；前者属于品牌叙事升级，转化提升立竿见影。

---

## 11. 联系与维护

| 角色 | 责任 |
|---|---|
| 团队负责人（TL） | 唯一对编程助手下指令的接口 |
| 编程助手（本会话） | 代码 / 部署 / 构建验证 |
| Ops-Sentinel | 巡检 + Vercel/Sentry 告警 → 飞书 |
| 产品经理（您） | 验收 + 业务决策 + 优先级排序 |

---

> **文档版本**：v1.0 · 2026-04-22
> **覆盖 Commit**：`12a12ec`
> **本地 Build 日志**：`build_phase_d.log`
