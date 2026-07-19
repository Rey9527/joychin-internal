# JOY CHIN PSA — Developer Handover Document

## Project Overview

Internal business management system for JOY CHIN PSA Incorporation Co., Ltd. (離型紙 / Release Paper distributor based in Thailand). Single-file HTML application with Supabase as the backend database.

## Current Stack

- **Frontend:** Single-file HTML (index.html), vanilla JS, no framework
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (auto-deploy from GitHub)
- **Repository:** git@github.com:Rey9527/joychin-internal.git
- **Version:** v0.14.0 (Beta)

## Completed Modules

- Supabase Auth login & user management (admin / manager / user / supplier / customer)
- PostgreSQL RLS company isolation and private Storage policies
- Unified inventory transaction ledger, mixed-receiving allocation and shortfall carry-forward
- Cost-field masking and write protection for products, quotations and inquiries
- Inquiry management (詢價) with supplier message templates, private attachments and contact timeline
- Quotation management (報價) with cost/markup/customs calculation, version history via `quote_changes`
- Order management (訂單) from quotation or manual entry, including accepted-item selection
- Automatic supplier-split purchase orders after accepted quotation conversion
- Purchase order management (採購單) with shopping-cart style flow, supplier-based filtering
- Sample management (樣品) with incoming/outgoing tracking and inventory
- Product catalog (產品目錄) with cost tracking, review reminders, stock level monitoring
- Customer management with periodic review reminders
- Supplier management with LINE group ID field for future bot integration
- Task tracking (工作追蹤) with auto-generated reminders from stale records
- Technical document library
- Dashboard (儀表板) — partially complete, see Pending Features

## Pending Features

### High Priority

- Dashboard completion: customer order volume chart, weekly activity monitor (orders + inventory updates), email report to manager
- PDF output for quotations and purchase orders (to send to customers/suppliers)
- Email sending via Resend API (API key stored in Supabase Edge Function secrets as `RESEND_API_KEY`)
- Weekly automated email report to manager using Supabase pg_cron + Edge Function + Resend

### Medium Priority

- LINE Bot integration: auto-send follow-up messages to supplier LINE groups based on overdue tasks. `suppliers` table has `line_group_id` field ready
- Assistant weekly checklist interface: simplified view for assistant to update inventory/orders, with manager approval dashboard
- Migration from single HTML file to React Vite for maintainability

### Low Priority

- Continue completing untranslated strings in the existing Chinese / English / Thai language switcher.

## Database Tables

See `dependency-map.md` for full column list. Key tables:

- `users`, `inquiries`, `quote_headers`, `quote_items`, `quote_changes`
- `orders`, `order_items`
- `purchase_orders`, `purchase_order_items`
- `samples`, `sample_requests_in`, `sample_shipments_out`
- `products`, `customers`, `suppliers`, `tasks`, `documents`, `settings`

## Known Issues & Technical Debt

- Single HTML file is now 5000+ lines, making AI-assisted edits increasingly inefficient. Migration to React Vite recommended.
- `orders` table mixes `customer` (text) and `customer_id` (bigint) — should be unified to `customer_id` only
- `quote_headers` uses `customer` and `supplier` as text fields, not foreign keys — causes issues for dashboard analytics
- Legacy login has been migrated to Supabase Auth; `password_hash` is cleared by the lockdown migration after linkage validation.
- `purchase_orders` previously assumed `ref_id` and `supplier` text columns — now uses `supplier_id` correctly
- Some existing `order_items` and `quote_items` records have null `product_id`, `width_m`, or `customer_pricing_unit` due to historical data before these fields were added

## Pricing Logic

- **Formula:** `final_price = cost_price × (1 + customs_fee_pct/100) × (1 + margin_pct/100)`
- **New flow:** user inputs `final_price` directly, system back-calculates `margin_pct`
- **Pricing unit:** m² or m (stored as `pricing_unit` and `customer_pricing_unit`)
- **Width conversion:** width stored as `width_m` (meters), displayed as mm in UI (× 1000)
- **Order amount:** `unit_price × width_m × qty` (if m²) or `unit_price × qty` (if m)

## Resend Email Setup

- Account created at resend.com
- API Key stored in Supabase Edge Function Secrets as `RESEND_API_KEY`
- DNS setup (SPF/DKIM for joy-paper.com) pending — needs IT to configure
- In the meantime, Resend sandbox mode can send to verified emails only

## LINE Bot Plan

- Each supplier has a dedicated LINE group
- `suppliers.line_group_id` stores the LINE group ID
- Plan: LINE Messaging API + Supabase Edge Function webhook
- Auto-send follow-up messages based on overdue tasks in `tasks` table
- Weekly summary format: `@supplier_name 您好，以下是目前待確認項目：[list]`

## Recommended Next Steps for Engineer

1. Migrate to React Vite, keeping Supabase as-is
2. Continue role regression tests whenever RLS policies or external portals change
3. Build Edge Function for weekly email report (pg_cron trigger → query orders/products `updated_at` → Resend)
4. Build Edge Function for LINE Bot webhook
5. Fix foreign key consistency in `orders` and `quote_headers` tables
6. Add PDF generation for quotations and purchase orders (recommend using a library like `@react-pdf/renderer` or Puppeteer)
