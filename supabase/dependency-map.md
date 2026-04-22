核心表

users: id, email, name, role, password_hash, is_active, created_at
inquiries: id, customer, product, supplier, spec, supplier_deadline, status, can_make, lead_time, moq, raw_material, supplier_price, remarks, margin, from_product_id, created_at, updated_at
documents: id, product, doc_type, file_url, file_size, tags
suppliers: id, name, company, email, phone, line_id, whatsapp, specialty, role, salutation, created_at
customers: id, name, company, email, phone, country, industry, notes, review_days, last_reviewed_at, created_at
products: id, product_code, product_name, supplier_id, unit, cost_price, currency, review_days, last_reviewed_at, notes, created_at, updated_at, is_active, min_stock_qty, stock_qty
samples: id, product_name, spec, supplier_id, from_inquiry_id, from_product_id, stock_qty, unit, notes, created_at
sample_requests_in: id, sample_id, supplier_id 可能有但前端主要用不到, requested_date, received_date, qty, cost, cost_currency, status, notes, created_at
sample_shipments_out: id, sample_id, customer_id, shipped_date, tracking_no, qty, status, feedback, created_at
tasks: id, title, ref_module, ref_id, supplier_id, customer_id, due_date, priority, status, notes, auto_generated, created_at, updated_at
quote_headers: id, inquiry_id, customer, supplier, version, status, notes, source, created_at
quote_items: id, header_id, product, spec, product_id, supplier_id, cost_price, cost_currency, customs_fee_pct, apply_customs, margin_pct, moq, lead_time
orders: id, customer, customer_id, supplier_id, quote_header_id, order_date, expected_delivery, actual_delivery, transport_method, tracking_no, currency, notes, status, total_amount, created_at, updated_at
order_items: id, order_id, product_name, spec, qty, unit, unit_price, currency
purchase_orders: id, source, supplier_id, accounting_no, expected_delivery, currency, notes, remark, status, approved_by, approved_at, created_at
purchase_order_items: id, purchase_order_id, product_name, spec, qty, unit, unit_price, currency
settings: key-value 型，至少有 default_cost_currency, default_quote_currency, default_customs_fee_pct, default_margin_pct
目前最重要的 schema 對齊點

purchase_orders 前端現在以 supplier_id 為主，不應再假設有 supplier
purchase_orders 前端現在不應再假設有 ref_id
orders 仍同時使用 customer 字串與 customer_id
quote_headers 仍同時使用 customer / supplier 字串，不是純 id 關聯
users.password_hash 現在其實是被前端當登入密碼比對，安全性上很弱，但 schema 依賴確實存在
