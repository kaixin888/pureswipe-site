# CLOWAND_FRONTEND_PITFALLS.md
# Clowand 前端设计与质量规范 (Huashu Design 增强版)

本档记录了项目开发过程中发现的视觉陷阱、布局问题及对应的解决方案。所有前端代码变更必须遵循以下 5 维度评审标准。

## 1. 五维度专家评审标准 (5D Review)

在提交任何 UI 代码前，必须进行以下自查：

- **哲学一致性 (Philosophy Consistency)**: 遵循 Clowand 的 "Premium US Hygiene" 定性。使用 Inter 字体，保持极简、高对比度的专业感。
- **视觉层级 (Visual Hierarchy)**: 重点操作（如 Buy Now）必须具有最高对比度。避免在一个页面出现多个同等级的视觉焦点。
- **细节执行 (Detail Execution)**: 
    - 文本必须使用 `text-wrap: pretty`（支持浏览器时）。
    - 严禁使用固定高度 `h-X` 处理文本容器，必须使用 `min-h-` 或灵活 Padding。
    - 颜色使用 Tailwind 标准色，严禁硬编码 Hex。
- **功能性 (Functionality)**: 移动端点击区域不小于 44px。确保所有按钮在 Loading 状态下禁用。
- **创新性 (Innovativeness)**: 避免 "AI Slop"（如过度的紫色渐变或通用 Emoji）。优先使用 Lucide 图标或本地化的品牌资产。

## 2. 品牌资产协议 (Brand Spec Protocol)

涉及品牌色、Logo 或第三方图标时，强制执行以下流程：

1. **问**: 确认是否有官方提供的品牌指南。
2. **搜**: 优先搜索官方 `brand` 或 `press` 页面获取资产。
3. **下载**: **严禁引用外部图片链接**。所有图标必须下载至 `public/images/trust/` 或 `public/images/brand/`。
4. **提取**: 使用工具从 SVG/截图提取准确色值，记录在 `tailwind.config.js` 中。
5. **固化**: 所有 HTML 引用必须通过 CSS 变量或 Tailwind 类名，确保一处修改全站同步。

## 3. 已知陷阱与禁令 (Anti-Patterns)

- **[MANDATORY] Layout Audit**: 每次推送前必须运行 `npm run audit <preview_url>`。如果脚本报错 `SH > CH`，严禁部署。
- **[BANNED] 外部图片直链**: 禁止使用 `upload.wikimedia.org` 等外部链接作为 UI 组件（如支付图标）。
- **[BANNED] 文本容器固定高度**: 严禁在 `RecentSales`, `BlogProducts` 等动态内容组件上使用 `h-10`, `h-40` 等，防止文字“腰斩”。
- **[BANNED] 顺色设计**: 背景与文字必须保持至少 4.5:1 的对比度。特别是页脚和博客详情页。
- **[BANNED] 自动弹出弹窗**: 移动端 Chatwoot 严禁自动弹出，仅保留气泡模式。
- **[BANNED] 标题紧凑行高**: 严禁对 Italic（斜体）主标题使用 `leading-none` 或 `leading-[0.95]`，必须使用 `leading-tight` 或至少 `1.1` 的行高，并配合 `pt-2/pt-4` 以免字母顶部被削。

## 4. 迭代流程要求

- **开工前**: 列出 assumptions (假设) 和 placeholders (占位符)。
- **交付前**: 必须进行 `npm run build` 验证，并附带截图证据。
- **故障处理**: 每个 Bug 最多重试 3 次，失败则需向上反馈并记录在此。
