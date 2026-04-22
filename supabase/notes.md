# Supabase Notes / Supabase 備註

## schema.sql
這個檔案是從 Supabase Schema Visualizer 複製下來的。  
This file was copied from Supabase Schema Visualizer.

它主要用來做目前資料庫結構的參考備份。  
It is mainly used as a reference backup of the current database structure.

由於表格順序、限制條件與相依關係未必完整，這份 SQL 不保證可以直接在新專案執行。  
Because table order, constraints, and dependencies may not be fully valid, this SQL is not guaranteed to run directly in a new project.

## 目前依賴的資料表 / Current App Dependency
這個 HTML 專案目前依賴以下主要資料表：  
The HTML app currently depends on the following main tables:

- users
- inquiries
- documents
- suppliers
- customers
- quote_headers
- quote_items
- settings
- products
- samples
- sample_requests_in
- sample_shipments_out
- tasks
- orders
- order_items
- purchase_orders
- purchase_order_items

## 已知注意事項 / Known Notes
目前前端與資料庫欄位名稱必須保持一致，尤其是採購單相關欄位。  
Frontend and database column names must stay aligned, especially for purchase-order-related fields.

`purchase_orders` 目前應以 `supplier_id` 為主，而不是 `supplier` 字串欄位。  
`purchase_orders` should currently use `supplier_id` instead of a `supplier` text column.

前端曾經假設 `purchase_orders` 有 `ref_id` 或 `supplier` 欄位，但實際 live schema 可能沒有。  
The frontend previously assumed that `purchase_orders` had `ref_id` or `supplier` columns, but the live schema may not.

## 建議做法 / Recommended Practice
之後如果有資料表或欄位調整，建議同步記錄在這個資料夾。  
If tables or columns are changed in the future, record the changes in this folder as well.

建議新增變更記錄檔，例如：  
Suggested change log files, for example:

- `supabase/changes/2026-04-22-purchase-order-fixes.md`
- `supabase/changes/2026-04-22-schema-notes.md`
