-- Customer name backfill for historical snapshot fields.
-- Purpose:
-- 1. Resync orders.customer from customers.company when customer_id exists.
-- 2. Handle common [TEST] prefix rename cases for inquiries.customer.
-- 3. Cascade the resulting inquiry customer name into quote_headers.customer.
--
-- Run this in Supabase SQL Editor after verifying the affected rows.

begin;

-- 1) Orders are the safest table to backfill because they carry customer_id.
update public.orders o
set customer = c.company
from public.customers c
where o.customer_id = c.id
  and coalesce(o.customer, '') <> coalesce(c.company, '');

-- 2a) If the inquiry still has the old plain name, but the current customer master
--     now uses a [TEST] prefix, update the inquiry snapshot to match.
update public.inquiries i
set customer = c.company
from public.customers c
where c.company like '[TEST] %'
  and i.customer = regexp_replace(c.company, '^\[TEST\]\s*', '')
  and i.customer <> c.company;

-- 2b) Reverse case: if the inquiry has [TEST] prefix but the customer master does not.
update public.inquiries i
set customer = c.company
from public.customers c
where i.customer like '[TEST] %'
  and regexp_replace(i.customer, '^\[TEST\]\s*', '') = c.company
  and i.customer <> c.company;

-- 3) Quote headers usually inherit customer text from inquiries.
update public.quote_headers q
set customer = i.customer
from public.inquiries i
where q.inquiry_id = i.id
  and coalesce(q.customer, '') <> coalesce(i.customer, '');

commit;
