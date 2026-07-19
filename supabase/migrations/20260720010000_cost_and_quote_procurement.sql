-- Cost-field authorization and quote-to-procurement workflow.

begin;

alter table public.order_items
  add column if not exists supplier_id bigint references public.suppliers(id),
  add column if not exists supplier_cost numeric(14,4),
  add column if not exists supplier_currency text;

create or replace function public.app_list_products()
returns setof jsonb
language sql
stable
security definer
set search_path=public,auth
as $$
  select case
    when public.app_has_permission('view_cost') then to_jsonb(p)
    else to_jsonb(p) || jsonb_build_object('cost_price',null)
  end
  from public.products p
  where public.app_is_internal()
  order by p.product_name
$$;

create or replace function public.app_list_quote_items()
returns setof jsonb
language sql
stable
security definer
set search_path=public,auth
as $$
  select case
    when public.app_has_permission('view_cost') then to_jsonb(qi)
    else to_jsonb(qi) || jsonb_build_object(
      'cost_price',null,'cost_currency',null,'customs_fee_pct',null,
      'apply_customs',null,'margin_pct',null
    )
  end
  from public.quote_items qi
  where public.app_is_internal()
  order by qi.id
$$;

create or replace function public.app_list_inquiries()
returns setof jsonb
language sql
stable
security definer
set search_path=public,auth
as $$
  select case
    when public.app_has_permission('view_cost') then to_jsonb(i)
    else to_jsonb(i) || jsonb_build_object('supplier_price',null,'margin',null)
  end
  from public.inquiries i
  where public.app_is_internal()
  order by i.created_at desc
$$;

revoke all on function public.app_list_products() from public,anon;
revoke all on function public.app_list_quote_items() from public,anon;
revoke all on function public.app_list_inquiries() from public,anon;
grant execute on function public.app_list_products() to authenticated;
grant execute on function public.app_list_quote_items() to authenticated;
grant execute on function public.app_list_inquiries() to authenticated;

-- Prevent direct REST selection of inquiry cost columns. The application reads
-- the full/masked JSON shape from app_list_inquiries instead.
revoke select on public.inquiries from authenticated;
grant select(
  id,customer,product,spec,supplier,supplier_deadline,status,can_make,lead_time,
  moq,raw_material,remarks,doc_sent,created_at,supplier_email,last_contacted,
  supplier_cc,from_product_id,inquiry_group_id,customer_id,
  customer_is_unregistered,requested_qty,requested_unit,is_development,
  target_price,target_currency,source_channel,source_reference,asked_at,
  promised_reply_date
) on public.inquiries to authenticated;

create or replace function public.app_set_product_stock(
  p_product_id bigint,
  p_new_quantity numeric,
  p_note text default null
) returns numeric
language plpgsql
security definer
set search_path=public,auth
as $$
declare v_product public.products%rowtype;
begin
  if not public.app_is_internal() then raise exception 'Internal account required'; end if;
  if p_new_quantity<0 then raise exception 'Stock quantity cannot be negative'; end if;
  update public.products
  set stock_qty=p_new_quantity,stock_updated_at=now(),updated_at=now()
  where id=p_product_id returning * into v_product;
  if not found then raise exception 'Product not found'; end if;
  return v_product.stock_qty;
end;
$$;

create or replace function public.app_post_inventory_transaction(
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
security definer
set search_path=public,auth
as $$
begin
  if not public.app_is_internal() then raise exception 'Internal account required'; end if;
  return public.post_inventory_transaction(
    p_occurred_on,p_movement_type,p_product_id,p_quantity,p_unit,p_base_quantity,
    p_base_unit,p_customer_id,p_supplier_id,p_order_id,p_purchase_order_id,p_note,
    p_created_by,p_allow_negative
  );
end;
$$;

create or replace function public.app_allocate_receiving_item(
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
security definer
set search_path=public,auth
as $$
begin
  if not public.app_is_internal() then raise exception 'Internal account required'; end if;
  return public.allocate_receiving_item(
    p_receiving_batch_item_id,p_purchase_order_item_id,p_accepted_qty,p_damaged_qty,
    p_base_quantity,p_base_unit,p_note,p_created_by,p_allow_over_receipt
  );
end;
$$;

create or replace function public.app_carry_shortfall_to_purchase(
  p_shortfall_id bigint,
  p_purchase_order_id text,
  p_created_by text default null
) returns public.purchase_order_items
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if not public.app_is_internal() or not public.app_has_permission('view_cost') then
    raise exception 'Cost permission is required';
  end if;
  return public.carry_shortfall_to_purchase(p_shortfall_id,p_purchase_order_id,p_created_by);
end;
$$;

revoke all on function public.post_inventory_transaction(date,text,bigint,numeric,text,numeric,text,bigint,bigint,text,text,text,text,boolean) from public,anon,authenticated;
revoke all on function public.allocate_receiving_item(bigint,bigint,numeric,numeric,numeric,text,text,text,boolean) from public,anon,authenticated;
revoke all on function public.carry_shortfall_to_purchase(bigint,text,text) from public,anon,authenticated;
revoke all on function public.app_set_product_stock(bigint,numeric,text) from public,anon;
revoke all on function public.app_post_inventory_transaction(date,text,bigint,numeric,text,numeric,text,bigint,bigint,text,text,text,text,boolean) from public,anon;
revoke all on function public.app_allocate_receiving_item(bigint,bigint,numeric,numeric,numeric,text,text,text,boolean) from public,anon;
revoke all on function public.app_carry_shortfall_to_purchase(bigint,text,text) from public,anon;
grant execute on function public.app_set_product_stock(bigint,numeric,text) to authenticated;
grant execute on function public.app_post_inventory_transaction(date,text,bigint,numeric,text,numeric,text,bigint,bigint,text,text,text,text,boolean) to authenticated;
grant execute on function public.app_allocate_receiving_item(bigint,bigint,numeric,numeric,numeric,text,text,text,boolean) to authenticated;
grant execute on function public.app_carry_shortfall_to_purchase(bigint,text,text) to authenticated;

drop policy if exists internal_staff_access on public.products;
drop policy if exists products_cost_authorized_select on public.products;
drop policy if exists products_internal_insert on public.products;
drop policy if exists products_internal_update on public.products;
drop policy if exists products_manager_delete on public.products;
create policy products_cost_authorized_select on public.products
  for select to authenticated
  using (public.app_is_internal() and public.app_has_permission('view_cost'));
create policy products_internal_insert on public.products
  for insert to authenticated with check (public.app_is_internal());
create policy products_internal_update on public.products
  for update to authenticated using (public.app_is_internal()) with check (public.app_is_internal());
create policy products_manager_delete on public.products
  for delete to authenticated using (public.app_is_manager());

drop policy if exists internal_staff_access on public.quote_items;
drop policy if exists quote_items_cost_authorized_select on public.quote_items;
drop policy if exists quote_items_internal_insert on public.quote_items;
drop policy if exists quote_items_internal_update on public.quote_items;
drop policy if exists quote_items_internal_delete on public.quote_items;
create policy quote_items_cost_authorized_select on public.quote_items
  for select to authenticated
  using (public.app_is_internal() and public.app_has_permission('view_cost'));
create policy quote_items_internal_insert on public.quote_items
  for insert to authenticated with check (public.app_is_internal());
create policy quote_items_internal_update on public.quote_items
  for update to authenticated using (public.app_is_internal()) with check (public.app_is_internal());
create policy quote_items_internal_delete on public.quote_items
  for delete to authenticated using (public.app_is_internal());

create or replace function public.protect_product_cost_fields()
returns trigger
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if not public.app_has_permission('view_cost') and (
    (tg_op='INSERT' and new.cost_price is not null) or
    (tg_op='UPDATE' and (
      new.cost_price is distinct from old.cost_price or
      new.currency is distinct from old.currency or
      new.last_reviewed_at is distinct from old.last_reviewed_at
    ))
  ) then
    raise exception 'Cost permission is required to change product cost fields';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_product_cost_fields_trigger on public.products;
create trigger protect_product_cost_fields_trigger
before insert or update on public.products
for each row execute function public.protect_product_cost_fields();

create or replace function public.protect_quote_cost_fields()
returns trigger
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if not public.app_has_permission('view_cost') and (
    (tg_op='INSERT' and new.cost_price is not null) or
    (tg_op='UPDATE' and (
      new.cost_price is distinct from old.cost_price or
      new.cost_currency is distinct from old.cost_currency or
      new.customs_fee_pct is distinct from old.customs_fee_pct or
      new.apply_customs is distinct from old.apply_customs or
      new.margin_pct is distinct from old.margin_pct
    ))
  ) then
    raise exception 'Cost permission is required to change quote cost fields';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_quote_cost_fields_trigger on public.quote_items;
create trigger protect_quote_cost_fields_trigger
before insert or update on public.quote_items
for each row execute function public.protect_quote_cost_fields();

create or replace function public.protect_inquiry_cost_fields()
returns trigger
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if not public.app_has_permission('view_cost') and (
    (tg_op='INSERT' and (new.supplier_price is not null or new.margin is not null)) or
    (tg_op='UPDATE' and (
      new.supplier_price is distinct from old.supplier_price or
      new.margin is distinct from old.margin
    ))
  ) then
    raise exception 'Cost permission is required to change inquiry cost fields';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_inquiry_cost_fields_trigger on public.inquiries;
create trigger protect_inquiry_cost_fields_trigger
before insert or update on public.inquiries
for each row execute function public.protect_inquiry_cost_fields();

revoke all on function public.protect_product_cost_fields() from public,anon,authenticated;
revoke all on function public.protect_quote_cost_fields() from public,anon,authenticated;
revoke all on function public.protect_inquiry_cost_fields() from public,anon,authenticated;

create or replace function public.create_purchase_orders_for_order(
  p_order_id text,
  p_created_by text default null
) returns jsonb
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_order public.orders%rowtype;
  v_supplier record;
  v_prefix text;
  v_sequence integer;
  v_po_id text;
  v_po_ids jsonb := '[]'::jsonb;
  v_missing integer;
begin
  if not public.app_is_internal() then raise exception 'Internal account required'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if exists(select 1 from public.purchase_order_order_links where order_id=p_order_id) then
    raise exception 'Purchase orders already exist for this order';
  end if;

  perform pg_advisory_xact_lock(hashtext('joychin-purchase-order-number'));
  v_prefix := 'PO-'||to_char(current_date,'YYYYMMDD')||'-';
  select coalesce(max(
    case when substring(id from length(v_prefix)+1) ~ '^[0-9]+$'
      then substring(id from length(v_prefix)+1)::integer else 0 end
  ),0) into v_sequence
  from public.purchase_orders where id like v_prefix||'%';

  for v_supplier in
    select oi.supplier_id,
      coalesce(max(oi.supplier_currency),v_order.currency,'USD') as currency
    from public.order_items oi
    where oi.order_id=p_order_id and oi.supplier_id is not null
    group by oi.supplier_id
    order by oi.supplier_id
  loop
    v_sequence := v_sequence+1;
    v_po_id := v_prefix||lpad(v_sequence::text,3,'0');
    insert into public.purchase_orders(
      id,source,ref_order_id,customer_order_id,supplier_id,status,currency,
      order_date,notes
    ) values (
      v_po_id,'order',p_order_id,p_order_id,v_supplier.supplier_id,'draft',
      v_supplier.currency,current_date,'由客戶接受報價自動拆單'
    );

    insert into public.purchase_order_items(
      po_id,product_id,product_name,spec,qty,unit,unit_price,currency,amount,
      ref_order_id,width_m,pricing_unit,printing,received_qty,notes
    )
    select
      v_po_id,oi.product_id,oi.product_name,oi.spec,oi.qty,oi.unit,
      oi.supplier_cost,coalesce(oi.supplier_currency,v_supplier.currency),
      case when oi.supplier_cost is null then null
        when oi.pricing_unit='m2' and coalesce(oi.width_m,0)>0
          then oi.supplier_cost*oi.qty*oi.width_m
        else oi.supplier_cost*oi.qty end,
      p_order_id,oi.width_m,oi.pricing_unit,oi.printing,0,
      '自動來自訂單 '||p_order_id
    from public.order_items oi
    where oi.order_id=p_order_id and oi.supplier_id=v_supplier.supplier_id;

    insert into public.purchase_order_order_links(purchase_order_id,order_id,qty,note)
    values(v_po_id,p_order_id,null,'報價轉訂單後依供應商自動拆單');
    v_po_ids := v_po_ids||to_jsonb(v_po_id);
  end loop;

  select count(*) into v_missing from public.order_items
  where order_id=p_order_id and supplier_id is null;
  if v_missing>0 and not exists(
    select 1 from public.tasks where ref_module='order' and ref_id=p_order_id
      and source='quote_conversion' and status<>'done'
  ) then
    insert into public.tasks(
      title,source,ref_module,ref_id,priority,status,notes,auto_generated
    ) values (
      '補齊訂單供應商後建立採購單','quote_conversion','order',p_order_id,
      'high','open',v_missing||' 個品項沒有綁定供應商',true
    );
  end if;

  return jsonb_build_object(
    'order_id',p_order_id,'purchase_order_ids',v_po_ids,
    'purchase_order_count',jsonb_array_length(v_po_ids),
    'unassigned_item_count',v_missing,'created_by',p_created_by
  );
end;
$$;

revoke all on function public.create_purchase_orders_for_order(text,text) from public,anon;
grant execute on function public.create_purchase_orders_for_order(text,text) to authenticated;

commit;
