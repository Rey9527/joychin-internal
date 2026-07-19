-- JOY CHIN operational traceability foundation
-- Review in a non-production project before applying. This migration does not
-- change users.password_hash or the current login flow.

begin;

alter table public.inquiries
  add column if not exists inquiry_group_id text,
  add column if not exists customer_id bigint references public.customers(id),
  add column if not exists customer_is_unregistered boolean not null default false,
  add column if not exists requested_qty numeric,
  add column if not exists requested_unit text,
  add column if not exists is_development boolean not null default false,
  add column if not exists target_price numeric,
  add column if not exists target_currency text,
  add column if not exists source_channel text,
  add column if not exists source_reference text,
  add column if not exists asked_at timestamptz,
  add column if not exists promised_reply_date date;

alter table public.products
  add column if not exists inventory_unit text not null default 'roll',
  add column if not exists kg_per_m numeric,
  add column if not exists conversion_note text,
  add column if not exists stock_updated_at timestamptz;

create index if not exists inquiries_group_idx on public.inquiries(inquiry_group_id);
create index if not exists inquiries_customer_id_idx on public.inquiries(customer_id);

create table if not exists public.inquiry_attachments (
  id bigint generated always as identity primary key,
  inquiry_id text not null references public.inquiries(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  source_channel text,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_document_events (
  id bigint generated always as identity primary key,
  purchase_order_id text not null references public.purchase_orders(id) on delete cascade,
  event_type text not null check (event_type in ('downloaded','sent','resent')),
  event_at timestamptz not null default now(),
  user_id bigint references public.users(id),
  user_name text,
  channel text,
  note text
);
create index if not exists purchase_document_events_po_idx
  on public.purchase_document_events(purchase_order_id,event_at desc);

create table if not exists public.receiving_batches (
  id bigint generated always as identity primary key,
  received_on date not null default current_date,
  supplier_id bigint references public.suppliers(id),
  delivery_note_no text,
  status text not null default 'unidentified'
    check (status in ('unidentified','partially_matched','matched','closed')),
  exterior_condition text not null default 'unchecked'
    check (exterior_condition in ('unchecked','ok','damaged')),
  photo_urls text[] not null default '{}',
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receiving_batch_items (
  id bigint generated always as identity primary key,
  receiving_batch_id bigint not null references public.receiving_batches(id) on delete cascade,
  purchase_order_item_id bigint references public.purchase_order_items(id),
  product_id bigint references public.products(id),
  product_name text not null,
  received_qty numeric not null check (received_qty > 0),
  received_unit text not null,
  accepted_qty numeric not null default 0 check (accepted_qty >= 0),
  damaged_qty numeric not null default 0 check (damaged_qty >= 0),
  match_status text not null default 'unidentified'
    check (match_status in ('unidentified','matched','needs_review')),
  notes text,
  created_at timestamptz not null default now(),
  check (accepted_qty + damaged_qty <= received_qty)
);

create table if not exists public.procurement_shortfalls (
  id bigint generated always as identity primary key,
  purchase_order_item_id bigint not null references public.purchase_order_items(id),
  supplier_id bigint references public.suppliers(id),
  product_id bigint references public.products(id),
  product_name text not null,
  shortage_qty numeric not null check (shortage_qty > 0),
  unit text not null,
  status text not null default 'carry_forward'
    check (status in ('carry_forward','added_to_next_po','waived','resolved')),
  carried_to_po_item_id bigint references public.purchase_order_items(id),
  reason text,
  created_by text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists procurement_shortfalls_open_idx
  on public.procurement_shortfalls(supplier_id,status);

create table if not exists public.inventory_lots (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id),
  supplier_id bigint references public.suppliers(id),
  receiving_batch_item_id bigint references public.receiving_batch_items(id),
  lot_code text,
  original_qty numeric not null,
  remaining_qty numeric not null,
  unit text not null,
  weight_kg numeric,
  width_m numeric,
  length_m numeric,
  status text not null default 'available'
    check (status in ('available','reserved','quarantine','consumed','disposed')),
  notes text,
  created_at timestamptz not null default now(),
  check (remaining_qty >= 0)
);

create table if not exists public.inventory_transactions (
  id bigint generated always as identity primary key,
  occurred_on date not null default current_date,
  movement_type text not null check (movement_type in (
    'supplier_receipt','customer_shipment','customer_return','supplier_return',
    'sample_in','sample_out','free_issue','company_use','scrap',
    'stocktake_gain','stocktake_loss','opening_balance','reversal'
  )),
  product_id bigint references public.products(id),
  sample_id bigint references public.samples(id),
  lot_id bigint references public.inventory_lots(id),
  quantity numeric not null check (quantity <> 0),
  unit text not null,
  base_quantity numeric,
  base_unit text,
  customer_id bigint references public.customers(id),
  supplier_id bigint references public.suppliers(id),
  order_id text references public.orders(id),
  purchase_order_id text references public.purchase_orders(id),
  receiving_batch_id bigint references public.receiving_batches(id),
  status text not null default 'posted' check (status in ('draft','posted','reversed')),
  needs_link_review boolean not null default false,
  note text,
  reversal_of bigint references public.inventory_transactions(id),
  created_by text,
  created_at timestamptz not null default now(),
  check (product_id is not null or sample_id is not null),
  check (movement_type <> 'customer_shipment' or customer_id is not null)
);
create index if not exists inventory_transactions_date_idx
  on public.inventory_transactions(occurred_on desc,created_at desc);
create index if not exists inventory_transactions_product_idx
  on public.inventory_transactions(product_id,occurred_on desc);
create index if not exists inventory_transactions_customer_idx
  on public.inventory_transactions(customer_id,occurred_on desc);

create table if not exists public.receiving_allocations (
  id bigint generated always as identity primary key,
  receiving_batch_item_id bigint not null references public.receiving_batch_items(id) on delete cascade,
  purchase_order_item_id bigint references public.purchase_order_items(id),
  accepted_qty numeric not null default 0 check (accepted_qty >= 0),
  damaged_qty numeric not null default 0 check (damaged_qty >= 0),
  base_quantity numeric,
  base_unit text,
  inventory_transaction_id bigint references public.inventory_transactions(id),
  note text,
  created_by text,
  created_at timestamptz not null default now(),
  check (accepted_qty + damaged_qty > 0)
);

comment on table public.inventory_transactions is
  'Append-only operational stock ledger. Incorrect entries are reversed, not deleted.';
comment on table public.procurement_shortfalls is
  'Supplier short deliveries retained for optional carry-forward to the next PO.';

create or replace function public.post_inventory_transaction(
  p_occurred_on date,
  p_movement_type text,
  p_product_id bigint,
  p_quantity numeric,
  p_unit text,
  p_base_quantity numeric,
  p_base_unit text,
  p_customer_id bigint default null,
  p_supplier_id bigint default null,
  p_order_id text default null,
  p_purchase_order_id text default null,
  p_note text default null,
  p_created_by text default null,
  p_allow_negative boolean default false
) returns public.inventory_transactions
language plpgsql
as $$
declare
  v_before numeric;
  v_after numeric;
  v_direction integer;
  v_tx public.inventory_transactions;
begin
  if p_quantity <= 0 or p_base_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;
  if p_movement_type = 'customer_shipment' and p_customer_id is null then
    raise exception 'Customer is required for customer shipment';
  end if;

  -- Customer returns are quarantined. Record the physical return but do not
  -- increase available stock until a later inspection/transfer is posted.
  if p_movement_type = 'customer_return' then
    insert into public.inventory_transactions(
      occurred_on,movement_type,product_id,quantity,unit,base_quantity,base_unit,
      customer_id,supplier_id,order_id,purchase_order_id,status,needs_link_review,
      note,created_by
    ) values (
      p_occurred_on,p_movement_type,p_product_id,p_quantity,p_unit,p_base_quantity,
      p_base_unit,p_customer_id,p_supplier_id,p_order_id,p_purchase_order_id,
      'draft',true,coalesce(p_note,'')||case when p_note is null then '' else ' · ' end||'客戶退貨待處理／隔離',p_created_by
    ) returning * into v_tx;
    return v_tx;
  end if;

  v_direction := case when p_movement_type in (
    'customer_shipment','supplier_return','sample_out','free_issue',
    'company_use','scrap','stocktake_loss'
  ) then -1 else 1 end;

  select coalesce(stock_qty,0) into v_before
  from public.products where id = p_product_id for update;
  if not found then raise exception 'Product not found'; end if;

  v_after := v_before + (v_direction * p_base_quantity);
  if v_after < 0 and not p_allow_negative then
    raise exception 'Insufficient inventory: current %, result %',v_before,v_after;
  end if;

  insert into public.inventory_transactions(
    occurred_on,movement_type,product_id,quantity,unit,base_quantity,base_unit,
    customer_id,supplier_id,order_id,purchase_order_id,needs_link_review,note,created_by
  ) values (
    p_occurred_on,p_movement_type,p_product_id,v_direction*p_quantity,p_unit,
    v_direction*p_base_quantity,p_base_unit,p_customer_id,p_supplier_id,
    p_order_id,p_purchase_order_id,
    (p_movement_type='customer_shipment' and p_order_id is null),p_note,p_created_by
  ) returning * into v_tx;

  update public.products
  set stock_qty=v_after,stock_updated_at=now(),updated_at=now()
  where id=p_product_id;
  return v_tx;
end;
$$;

create or replace function public.allocate_receiving_item(
  p_receiving_batch_item_id bigint,
  p_purchase_order_item_id bigint,
  p_accepted_qty numeric,
  p_damaged_qty numeric,
  p_base_quantity numeric,
  p_base_unit text,
  p_note text default null,
  p_created_by text default null,
  p_allow_over_receipt boolean default false
) returns public.receiving_allocations
language plpgsql
as $$
declare
  v_item public.receiving_batch_items%rowtype;
  v_batch public.receiving_batches%rowtype;
  v_po_item public.purchase_order_items%rowtype;
  v_po public.purchase_orders%rowtype;
  v_tx public.inventory_transactions%rowtype;
  v_allocation public.receiving_allocations%rowtype;
  v_already numeric;
  v_new_received numeric;
  v_item_completed boolean;
begin
  if coalesce(p_accepted_qty,0) < 0 or coalesce(p_damaged_qty,0) < 0
     or coalesce(p_accepted_qty,0) + coalesce(p_damaged_qty,0) <= 0 then
    raise exception 'Accepted or damaged quantity is required';
  end if;

  select * into v_item from public.receiving_batch_items
  where id=p_receiving_batch_item_id for update;
  if not found then raise exception 'Receiving item not found'; end if;
  select * into v_batch from public.receiving_batches where id=v_item.receiving_batch_id for update;
  select * into v_po_item from public.purchase_order_items where id=p_purchase_order_item_id for update;
  if not found then raise exception 'Purchase order item not found'; end if;
  select * into v_po from public.purchase_orders where id=v_po_item.po_id;
  if v_batch.supplier_id is not null and v_po.supplier_id is not null
     and v_batch.supplier_id <> v_po.supplier_id then
    raise exception 'Receiving supplier does not match purchase order supplier';
  end if;

  select coalesce(sum(accepted_qty+damaged_qty),0) into v_already
  from public.receiving_allocations where receiving_batch_item_id=v_item.id;
  if v_already + p_accepted_qty + p_damaged_qty > v_item.received_qty then
    raise exception 'Allocation exceeds physical received quantity';
  end if;

  v_new_received := coalesce(v_po_item.received_qty,0) + p_accepted_qty;
  if v_new_received > coalesce(v_po_item.qty,0) and not p_allow_over_receipt then
    raise exception 'Receipt exceeds purchase quantity and requires manager approval';
  end if;
  if p_accepted_qty > 0 and (p_base_quantity is null or p_base_quantity <= 0 or p_base_unit is null) then
    raise exception 'Inventory conversion quantity and unit are required';
  end if;

  if p_accepted_qty > 0 then
    select * into v_tx from public.post_inventory_transaction(
      v_batch.received_on,'supplier_receipt',v_po_item.product_id,p_accepted_qty,
      v_item.received_unit,p_base_quantity,p_base_unit,null,coalesce(v_batch.supplier_id,v_po.supplier_id),
      null,v_po_item.po_id,coalesce(p_note,'混單到貨配對入庫'),p_created_by,false
    );
    update public.purchase_order_items set received_qty=v_new_received where id=v_po_item.id;
  end if;

  insert into public.receiving_allocations(
    receiving_batch_item_id,purchase_order_item_id,accepted_qty,damaged_qty,
    base_quantity,base_unit,inventory_transaction_id,note,created_by
  ) values (
    v_item.id,v_po_item.id,p_accepted_qty,p_damaged_qty,
    case when p_accepted_qty>0 then p_base_quantity end,
    case when p_accepted_qty>0 then p_base_unit end,
    case when p_accepted_qty>0 then v_tx.id end,p_note,p_created_by
  ) returning * into v_allocation;

  update public.receiving_batch_items
  set purchase_order_item_id=v_po_item.id,
      product_id=v_po_item.product_id,
      accepted_qty=accepted_qty+p_accepted_qty,
      damaged_qty=damaged_qty+p_damaged_qty,
      match_status=case
        when accepted_qty+p_accepted_qty+damaged_qty+p_damaged_qty >= received_qty then 'matched'
        else 'needs_review' end
  where id=v_item.id;

  select not exists(
    select 1 from public.receiving_batch_items bi
    where bi.receiving_batch_id=v_batch.id
      and bi.accepted_qty+bi.damaged_qty < bi.received_qty
  ) into v_item_completed;
  update public.receiving_batches
  set status=case when v_item_completed then 'matched' else 'partially_matched' end,
      updated_at=now()
  where id=v_batch.id;

  if p_accepted_qty>0 and not exists(
    select 1 from public.purchase_order_items poi
    where poi.po_id=v_po_item.po_id and coalesce(poi.received_qty,0)<coalesce(poi.qty,0)
  ) then
    update public.purchase_orders set status='received',actual_delivery=v_batch.received_on,updated_at=now()
    where id=v_po_item.po_id;
  end if;

  return v_allocation;
end;
$$;

create or replace function public.carry_shortfall_to_purchase(
  p_shortfall_id bigint,
  p_purchase_order_id text,
  p_created_by text default null
) returns public.purchase_order_items
language plpgsql
as $$
declare
  v_short public.procurement_shortfalls%rowtype;
  v_target_po public.purchase_orders%rowtype;
  v_source_item public.purchase_order_items%rowtype;
  v_new_item public.purchase_order_items%rowtype;
begin
  select * into v_short from public.procurement_shortfalls
  where id=p_shortfall_id for update;
  if not found or v_short.status <> 'carry_forward' then
    raise exception 'Shortfall is no longer available';
  end if;
  select * into v_target_po from public.purchase_orders
  where id=p_purchase_order_id for update;
  if not found then raise exception 'Target purchase order not found'; end if;
  if v_target_po.status in ('cancelled','completed','received') then
    raise exception 'Target purchase order can no longer accept items';
  end if;
  if v_short.supplier_id is not null and v_target_po.supplier_id <> v_short.supplier_id then
    raise exception 'Shortfall supplier does not match target purchase order';
  end if;
  select * into v_source_item from public.purchase_order_items
  where id=v_short.purchase_order_item_id;

  insert into public.purchase_order_items(
    po_id,product_id,product_name,spec,qty,unit,unit_price,currency,amount,
    notes,rolls_qty,width_m,pricing_unit,ref_order_id,received_qty
  ) values (
    v_target_po.id,v_short.product_id,v_short.product_name,v_source_item.spec,
    v_short.shortage_qty,v_short.unit,v_source_item.unit_price,
    coalesce(v_source_item.currency,v_target_po.currency),
    case when v_source_item.unit_price is null then null else v_source_item.unit_price*v_short.shortage_qty end,
    '短交自動帶入 #SHORT-'||v_short.id,v_source_item.rolls_qty,
    v_source_item.width_m,v_source_item.pricing_unit,v_source_item.ref_order_id,0
  ) returning * into v_new_item;

  update public.procurement_shortfalls
  set status='added_to_next_po',carried_to_po_item_id=v_new_item.id,
      resolved_at=now(),reason=coalesce(reason,'')||case when reason is null then '' else ' · ' end||'已帶入 '||v_target_po.id
  where id=v_short.id;
  return v_new_item;
end;
$$;

commit;
