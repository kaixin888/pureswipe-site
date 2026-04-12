# clowand 后台系统 2.0 (Refine) 需求说明书 (PRD)

## 1. 订单管理模块 - 一键导出 Excel (CSV) 字段模版
为了适配美国主流物流商（USPS, FedEx, UPS）的批量打单系统，导出文件必须包含以下核心字段：

| 字段名称 (Header) | 说明 | 数据来源 (Supabase) |
| :--- | :--- | :--- |
| **Order ID** | 订单号 (CW-xxxxxx) | orders.order_id |
| **Recipient Name** | 收货人姓名 | orders.shipping_name |
| **Email** | 客户邮箱 | orders.customer_email |
| **Shipping Address 1** | 详细地址行 1 | orders.shipping_address1 |
| **Shipping Address 2** | 详细地址行 2 (如有) | orders.shipping_address2 |
| **City** | 城市 | orders.shipping_city |
| **State** | 州 (2位简写，如 CA, NY) | orders.shipping_state |
| **Zip Code** | 邮编 (5位) | orders.shipping_zip |
| **Country** | 国家 (USA) | orders.shipping_country |
| **Phone Number** | 联系电话 | orders.customer_phone |
| **Product SKU** | 商品编码 (CW-START, CW-FAM, CW-REF-48) | orders.product_sku |
| **Quantity** | 数量 | orders.quantity |
| **Total Amount** | 支付总额 (含运费) | orders.total_amount |
| **Order Date** | 下单时间 (YYYY-MM-DD HH:MM) | orders.created_at |
| **Payment Status** | 支付状态 (Paid, Pending) | orders.payment_status |

---

## 2. 数据看板 (Dashboard) 布局设计
看板必须能让常先生在进站 3 秒内看清生意好坏，指标必须实时从 Supabase 聚合。

### 第一行：核心运营指标 (Real-time Metrics)
- **今日销售额 (Today's GMV)**: 今日已支付订单总额。
- **今日订单数 (Today's Orders)**: 今日新增订单总量。
- **转化率 (CR)**: 订单数 / 独立访客数 (从 site_stats 表获取)。
- **客单价 (AOV)**: 总销售额 / 总订单数。

### 第二行：趋势分析 (Sales Trend)
- **7日销售趋势图**: 折线图/柱状图，展示过去 7 天的每日营收波动。

### 第三行：商品表现 (Top Products)
- 列表形式展示销量前三的套装及其对应的 GMV。

---

## 3. 技术实施要求 (给编程助手 @编程助手)
- **数据一致性**: Refine 必须通过 `supabase-data-provider` 直接操作现有的 `orders` 表，不允许做中间转换。
- **批量操作**: 订单列表页需具备“全选 -> 批量导出 CSV”的功能。
- **状态联动**: 在 Refine 后台修改订单状态为 `Shipped` 并填入单号后，前台用户必须能立即通过 `Track Order` 页面查到。

---
**版本**: v2.0
**负责人**: 产品经理
**日期**: 2026-04-12
