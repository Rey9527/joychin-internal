# Supabase Notes

## schema.sql
This file was copied from Supabase Schema Visualizer.
It is kept as a reference backup of the current database structure.
It may not be directly executable because table order and constraints may not be valid.

## Current app dependency
The HTML app currently depends on these main tables:

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

## Known notes
- purchase_orders in the current app should use `supplier_id`
- some old frontend assumptions used `supplier` or `ref_id`, which may not match the live schema

