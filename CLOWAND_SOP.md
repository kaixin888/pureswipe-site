# 🚀 Clowand 模式：独立站搭建全流程 SOP 手册 (v1.0)

## 0. 核心哲学 (Philosophy)
*   **AI 全流程驱动**：人类只负责提需求和做决策，代码编写、部署、审计全部由 AI 闭环完成。
*   **开源免费优先**：拒绝昂贵的第三方 SaaS 订阅，采用 **Next.js + Supabase + Vercel** 的黄金组合，实现 0 月租成本。
*   **证据链治理**：不相信口头“完成了”，所有交付必须附带部署日志、浏览器截图或代码审计结果。

---

## 第一阶段：基础设施与技术底座 (Foundation)
### 1. 技术栈选择 (Tech Stack)
*   **前端**：Next.js 14 (App Router) + Tailwind CSS（主流、极速、SEO 友好）。
*   **数据库/后端**：Supabase（开源、性能强、自带认证）。
*   **后台管理**：Refine v6 + Ant Design（5分钟生成专业订单/产品管理后台）。
*   **存储**：Cloudflare R2（极廉价的图片存储，替代大额 S3 开销）。

### 2. 开发环境准备
*   **代码托管**：GitHub ( kaixin888 )。
*   **自动化部署**：Vercel（关联 GitHub，代码一推送即自动上线）。
*   **网络加速**：国内开发者强制使用 **Watt Toolkit** 优化 Git 连接。

---

## 第二阶段：核心电商功能开发 (Core Functions)
### 1. 支付链路 (Payments)
*   **Stripe + PayPal**：必须支持 Credit Card 和 PayPal 双通道。
*   **避坑指南**：Stripe 密钥严禁写死在代码里，必须通过 Vercel Environment Variables 注入，防止账号被盗。

### 2. 品牌化邮件系统 (Email)
*   **工具**：Resend（每月 3000 封免费额度）。
*   **SOP**：不要用纯文本邮件。必须编写 HTML 模板（包含 Logo、品牌蓝色调、响应式按钮），提升买家信任度。

---

## 第三阶段：转化率与搜索优化 (CRO & GEO)
### 1. CRO (转化率优化) 三件套
*   **移动端吸底加购 (Sticky Add to Cart)**：滑动过首屏后自动出现，缩短决策路径。
*   **购物车追加销售 (Upsell)**：在购物车内互斥推荐（如买了刷子推荐替换头）。
*   **动态购买提醒 (Recent Sales)**：读取真实订单数据进行弹窗展示。

### 2. GEO (生成式搜索优化) 加固
*   **结构化数据 (Schema.org)**：
    *   首页：`FAQPage`（让 AI 直接回答你的常见问题）。
    *   详情页：`Product` + `Review` + `AggregateRating`（让 Google 搜索结果带星级）。
    *   全站：`BreadcrumbList`（面包屑导航）。

### 3. 性能优化 (LCP)
*   Hero 视频必须带 `poster` (封面图) 和 `preload="auto"`，防止首屏白屏。
*   关键图片开启 `priority={true}`，确保视觉中心第一时间呈现。

---

## 第四阶段：团队治理与避坑协议 (Governance)
### 1. 角色边界
*   **编程助手**：负责写代码、修 Bug、推 Git。
*   **质量审计员**：负责挑刺、验证功能。**严禁执行者自己审计自己**。

### 2. 代码安全
*   **文件编码**：针对 Windows 环境下的 **CRLF** 换行符文件，AI 编辑时必须使用 Python 脚本进行字节级匹配，防止因编码损坏导致构建失败。
*   **语法检测**：推送前必须在本地运行 `npm run build`。如果报错，严禁强行推送。

### 3. 评论区策略
*   **拒绝匿名**：详情页“写评价”按钮点击后弹出“真实性说明”，告知用户评价链接将通过邮件发送。
*   **控评机制**：所有评价默认 `is_published = false`，管理员在后台审核后手动发布。

---

## 5. 每日检查清单 (Checklist)
1.  [ ] **Vercel Deployments**: 是否全绿 (Ready)？如有红标立即查日志。
2.  [ ] **Supabase Logs**: 订单入库是否正常？
3.  [ ] **Stripe Test**: 4242 测试卡是否能跑通全流程？
4.  [ ] **Console**: 浏览器控制台是否有红色 Error？
