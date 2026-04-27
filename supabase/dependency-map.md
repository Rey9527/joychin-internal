# Supabase Dependency Map / Supabase 依賴清單

## Purpose / 用途
This file records the current Supabase tables and important columns used by the HTML app.  
這份文件用來記錄目前 HTML 專案實際依賴的 Supabase 資料表與重要欄位。

It is intended to reduce schema mismatch issues when the frontend is updated.  
它的目的，是在前端持續修改時，減少資料庫欄位不一致造成的問題。

## Main Rule / 主要原則
Before changing a table or column in Supabase, check whether it is referenced by `index.html`.  
在 Supabase 修改任何資料表或欄位前，先確認 `index.html` 是否仍有使用。

## Core Tables / 核心資料表

### users
Used for manual login and user management.  
用於登入與使用者管理。

Important columns / 重要欄位:
- `id`
- `email`
- `name`
- `role`
- `password_hash`
- `is_active`
- `created_at`

### inquiries
Used for inquiry creation, supplier follow-up, and conversion into quotations.  
用於詢價建立、供應商追蹤與送入報價流程。

Important columns / 重要欄位:
- `id`
- `customer`
- `product`
- `supplier`
- `spec`
- `supplier_deadline`
- `status`
- `can_make`
- `lead_time`
- `moq`
- `raw_material`
- `supplier_price`
- `remarks`
- `margin`
- `from_product_id`
- `created_at`
- `updated_at`

### documents
Used for the technical document library.  
用於技術文件庫。

Important columns / 重要欄位:
- `id`
- `product`
- `doc_type`
- `file_url`
- `file_size`
- `tags`

### suppliers
Used across inquiries, products, samples, orders, and purchases.  
用於詢價、產品、樣品、訂單與採購單等模組。

Important columns / 重要欄位:
- `id`
- `name`
- `company`
- `email`
- `phone`
- `line_id`
- `whatsapp`
- `specialty`
- `role`
- `salutation`
- `created_at`

### customers
Used for customer management, filtering, review reminders, and orders.  
用於客戶管理、篩選、回顧提醒與訂單。

Important columns / 重要欄位:
- `id`
- `name`
- `company`
- `email`
- `phone`
- `country`
- `industry`
- `notes`
- `review_days`
- `last_reviewed_at`
- `created_at`

### products
Used for product catalog, quotation items, and inquiry linkage.  
用於產品目錄、報價品項與詢價關聯。

Important columns / 重要欄位:
- `id`
- `product_code`
- `product_name`
- `supplier_id`
- `unit`
- `cost_price`
- `currency`
- `review_days`
- `last_reviewed_at`
- `notes`
- `created_at`
- `updated_at`
- `is_active`
- `min_stock_qty`
- `stock_qty`
- `meters_per_roll`
- `width_m`
- `pricing_unit`

### samples
Used for sample inventory, incoming requests, and outgoing shipments.  
用於樣品庫存、索取與寄送記錄。

Important columns / 重要欄位:
- `id`
- `product_name`
- `spec`
- `supplier_id`
- `from_inquiry_id`
- `from_product_id`
- `stock_qty`
- `unit`
- `notes`
- `created_at`

### sample_requests_in
Used for tracking requests from suppliers and arrival status.  
用於追蹤向供應商索取樣品與到貨狀態。

Important columns / 重要欄位:
- `id`
- `sample_id`
- `requested_date`
- `received_date`
- `qty`
- `cost`
- `cost_currency`
- `status`
- `notes`
- `created_at`

### sample_shipments_out
Used for sample shipments to customers and feedback tracking.  
用於寄送樣品給客戶與後續回饋追蹤。

Important columns / 重要欄位:
- `id`
- `sample_id`
- `customer_id`
- `shipped_date`
- `tracking_no`
- `qty`
- `status`
- `feedback`
- `created_at`

### tasks
Used for manual tasks and auto-generated reminders.  
用於手動工作追蹤與系統自動建立提醒。

Important columns / 重要欄位:
- `id`
- `title`
- `ref_module`
- `ref_id`
- `supplier_id`
- `customer_id`
- `due_date`
- `priority`
- `status`
- `notes`
- `auto_generated`
- `created_at`
- `updated_at`

### quote_headers
Used for quotation summary records.  
用於報價單主檔。

Important columns / 重要欄位:
- `id`
- `inquiry_id`
- `customer`
- `supplier`
- `version`
- `status`
- `notes`
- `source`
- `created_at`

### quote_items
Used for quotation line items and price calculations.  
用於報價品項與價格計算。

Important columns / 重要欄位:
- `id`
- `header_id`
- `product`
- `spec`
- `product_id`
- `supplier_id`
- `cost_price`
- `cost_currency`
- `customs_fee_pct`
- `apply_customs`
- `margin_pct`
- `moq`
- `lead_time`
- `final_price`
- `width_m`
- `pricing_unit`

### orders
Used for confirmed orders and order status workflow.  
用於客戶訂單與訂單狀態流程。

Important columns / 重要欄位:
- `id`
- `customer`
- `customer_id`
- `supplier_id`
- `quote_header_id`
- `order_date`
- `expected_delivery`
- `actual_delivery`
- `transport_method`
- `tracking_no`
- `currency`
- `notes`
- `status`
- `total_amount`
- `created_at`
- `updated_at`
- `source`
- `approval_status`
- `approved_by`
- `approved_at`

### order_items
Used for order line items.  
用於訂單品項明細。

Important columns / 重要欄位:
- `id`
- `order_id`
- `product_name`
- `spec`
- `qty`
- `unit`
- `unit_price`
- `currency`
- `width_m`
- `pricing_unit`

### purchase_orders
Used for purchase workflow and approval flow.  
用於採購流程與審批流程。

Important columns / 重要欄位:
- `id`
- `source`
- `supplier_id`
- `accounting_no`
- `expected_delivery`
- `currency`
- `notes`
- `remark`
- `status`
- `approved_by`
- `approved_at`
- `created_at`

### purchase_order_items
Used for purchase order line items.  
用於採購單品項明細。

Important columns / 重要欄位:
- `id`
- `purchase_order_id`
- `product_name`
- `spec`
- `qty`
- `unit`
- `unit_price`
- `currency`
- `ref_order_id`
- `received_qty`
- `rolls_qty`
- `width_m`
- `pricing_unit`

### settings
Used for default quotation and cost-related configuration.  
用於報價與成本的預設值設定。

Expected keys / 主要 key:
- `default_cost_currency`
- `default_quote_currency`
- `default_customs_fee_pct`
- `default_margin_pct`

## Known Alignment Notes / 已知對齊注意事項

### purchase_orders
The frontend currently uses `supplier_id`.  
前端目前以 `supplier_id` 為主。

Do not assume `purchase_orders.supplier` exists.  
不要再假設 `purchase_orders.supplier` 一定存在。

Do not assume `purchase_orders.ref_id` exists.  
不要再假設 `purchase_orders.ref_id` 一定存在。

### orders
The frontend still mixes `customer` text and `customer_id`.  
前端目前仍同時使用 `customer` 字串與 `customer_id`。

### quote_headers
The frontend still uses `customer` and `supplier` as text fields.  
前端目前仍把 `customer` 與 `supplier` 當字串欄位使用。

### users
The current login flow still depends on `password_hash` at the frontend level.  
目前登入流程仍依賴前端直接使用 `password_hash`。

This is a security concern, but it is still a live dependency.  
這在安全上有風險，但目前仍是實際依賴。

## Recommendation / 建議
When changing schema, update this file together with `supabase/notes.md`.  
之後每次改 schema，請同步更新這份文件與 `supabase/notes.md`。

If a new table or column is added to support the HTML app, record it here.  
如果有新表或新欄位被加入給 HTML 專案使用，也請記錄在這裡。
