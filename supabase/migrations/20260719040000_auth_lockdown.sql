-- JOY CHIN RLS lockdown migration.
-- Apply only after every active public.users row has an auth_id and the
-- Supabase Auth frontend has been deployed and verified.

begin;

do $$
begin
  if exists(select 1 from public.users where is_active=true and auth_id is null) then
    raise exception 'Cannot enable lockdown: active users remain unlinked to Supabase Auth';
  end if;
end;
$$;

-- Remove legacy permissive policies before creating the replacement set.
do $$
declare p record;
begin
  for p in
    select schemaname,tablename,policyname
    from pg_policies where schemaname='public'
  loop
    execute format('drop policy if exists %I on %I.%I',p.policyname,p.schemaname,p.tablename);
  end loop;
end;
$$;

revoke usage on schema public from anon;
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

grant usage on schema public to authenticated;
grant usage,select on all sequences in schema public to authenticated;

-- Internal staff keep the current operational feature set. Authorization for
-- costs, approvals, settings, logs, and users is tightened separately below.
do $$
declare t text;
begin
  foreach t in array array[
    'complaints','customers','documents','hs_codes','inquiries','inventory_logs',
    'inventory_movements','inventory_transactions','inventory_lots',
    'order_documents','order_items','orders','procurement_shortfalls','products',
    'purchase_document_events','purchase_order_items','purchase_order_order_links',
    'purchase_orders','quote_changes','quote_headers','quote_items','quotes',
    'receiving_allocations','receiving_batch_items','receiving_batches',
    'sample_requests_in','sample_shipments_out','samples','shipment_documents',
    'shipment_items','shipment_orders','shipment_purchase_orders','shipments',
    'supplier_group_members','supplier_groups','suppliers','tasks','inquiry_attachments'
  ]
  loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security',t);
      execute format('grant select,insert,update,delete on table public.%I to authenticated',t);
      execute format(
        'create policy internal_staff_access on public.%I for all to authenticated using (public.app_is_internal()) with check (public.app_is_internal())',
        t
      );
    end if;
  end loop;
end;
$$;

alter table public.users enable row level security;
revoke all on table public.users from authenticated;
grant select(id,email,name,role,is_active,created_at,group_id,linked_company,auth_id,auth_email)
  on public.users to authenticated;
create policy users_select_self_or_manager on public.users
  for select to authenticated
  using (auth_id=(select auth.uid()) or public.app_is_manager());

alter table public.user_groups enable row level security;
grant select,insert,update,delete on public.user_groups to authenticated;
create policy user_groups_read_internal on public.user_groups
  for select to authenticated using (public.app_is_internal());
create policy user_groups_manage_manager on public.user_groups
  for all to authenticated using (public.app_is_manager()) with check (public.app_is_manager());

alter table public.settings enable row level security;
grant select,insert,update,delete on public.settings to authenticated;
create policy settings_read_internal on public.settings
  for select to authenticated using (public.app_is_internal());
create policy settings_manage_authorized on public.settings
  for all to authenticated
  using (public.app_has_permission('view_settings'))
  with check (public.app_has_permission('view_settings'));

alter table public.activity_logs enable row level security;
grant select,insert on public.activity_logs to authenticated;
create policy activity_logs_insert_signed_in on public.activity_logs
  for insert to authenticated
  with check (user_id=public.app_profile_id());
create policy activity_logs_read_authorized on public.activity_logs
  for select to authenticated
  using (public.app_has_permission('view_logs'));

-- Supplier portal: read only its own company, inquiries, POs and shipments.
create policy suppliers_external_self on public.suppliers
  for select to authenticated
  using (public.app_user_role()='supplier' and company=public.app_linked_company());
create policy inquiries_external_supplier on public.inquiries
  for select to authenticated
  using (public.app_user_role()='supplier' and supplier=public.app_linked_company());
create policy purchase_orders_external_supplier on public.purchase_orders
  for select to authenticated
  using (
    public.app_user_role()='supplier' and exists(
      select 1 from public.suppliers s
      where s.id=purchase_orders.supplier_id and s.company=public.app_linked_company()
    )
  );
create policy purchase_order_items_external_supplier on public.purchase_order_items
  for select to authenticated
  using (
    public.app_user_role()='supplier' and exists(
      select 1 from public.purchase_orders po join public.suppliers s on s.id=po.supplier_id
      where po.id=purchase_order_items.po_id and s.company=public.app_linked_company()
    )
  );
create policy shipment_purchase_orders_external_supplier on public.shipment_purchase_orders
  for select to authenticated
  using (
    public.app_user_role()='supplier' and exists(
      select 1 from public.purchase_orders po join public.suppliers s on s.id=po.supplier_id
      where po.id=shipment_purchase_orders.purchase_order_id and s.company=public.app_linked_company()
    )
  );
create policy shipments_external_supplier on public.shipments
  for select to authenticated
  using (
    public.app_user_role()='supplier' and exists(
      select 1
      from public.shipment_purchase_orders spo
      join public.purchase_orders po on po.id=spo.purchase_order_id
      join public.suppliers s on s.id=po.supplier_id
      where spo.shipment_id=shipments.id and s.company=public.app_linked_company()
    )
  );
create policy shipment_items_external_supplier on public.shipment_items
  for select to authenticated
  using (
    public.app_user_role()='supplier' and exists(
      select 1 from public.purchase_orders po join public.suppliers s on s.id=po.supplier_id
      where po.id=shipment_items.po_id and s.company=public.app_linked_company()
    )
  );

-- Customer portal: read only the linked customer company's own workflow.
create policy customers_external_self on public.customers
  for select to authenticated
  using (public.app_user_role()='customer' and company=public.app_linked_company());
create policy inquiries_external_customer on public.inquiries
  for select to authenticated
  using (
    public.app_user_role()='customer' and (
      customer=public.app_linked_company() or exists(
        select 1 from public.customers c
        where c.id=inquiries.customer_id and c.company=public.app_linked_company()
      )
    )
  );
create policy orders_external_customer on public.orders
  for select to authenticated
  using (
    public.app_user_role()='customer' and exists(
      select 1 from public.customers c
      where c.id=orders.customer_id and c.company=public.app_linked_company()
    )
  );
create policy order_items_external_customer on public.order_items
  for select to authenticated
  using (
    public.app_user_role()='customer' and exists(
      select 1 from public.orders o join public.customers c on c.id=o.customer_id
      where o.id=order_items.order_id and c.company=public.app_linked_company()
    )
  );
create policy order_documents_external_customer on public.order_documents
  for select to authenticated
  using (
    public.app_user_role()='customer' and exists(
      select 1 from public.orders o join public.customers c on c.id=o.customer_id
      where o.id=order_documents.order_id and c.company=public.app_linked_company()
    )
  );
create policy sample_shipments_external_customer on public.sample_shipments_out
  for select to authenticated
  using (
    public.app_user_role()='customer' and exists(
      select 1 from public.customers c
      where c.id=sample_shipments_out.customer_id and c.company=public.app_linked_company()
    )
  );
create policy samples_external_customer on public.samples
  for select to authenticated
  using (
    public.app_user_role()='customer' and (
      exists(
        select 1 from public.inquiries i
        where i.id=samples.from_inquiry_id and (
          i.customer=public.app_linked_company() or exists(
            select 1 from public.customers c
            where c.id=i.customer_id and c.company=public.app_linked_company()
          )
        )
      ) or exists(
        select 1 from public.sample_shipments_out so join public.customers c on c.id=so.customer_id
        where so.sample_id=samples.id and c.company=public.app_linked_company()
      )
    )
  );
create policy shipment_purchase_orders_external_customer on public.shipment_purchase_orders
  for select to authenticated
  using (
    public.app_user_role()='customer' and exists(
      select 1
      from public.purchase_order_order_links pol
      join public.orders o on o.id=pol.order_id
      join public.customers c on c.id=o.customer_id
      where pol.purchase_order_id=shipment_purchase_orders.purchase_order_id
        and c.company=public.app_linked_company()
    ) or public.app_user_role()='customer' and exists(
      select 1 from public.purchase_orders po
      join public.orders o on o.id=coalesce(po.customer_order_id,po.ref_order_id)
      join public.customers c on c.id=o.customer_id
      where po.id=shipment_purchase_orders.purchase_order_id
        and c.company=public.app_linked_company()
    )
  );
create policy shipments_external_customer on public.shipments
  for select to authenticated
  using (
    public.app_user_role()='customer' and exists(
      select 1
      from public.shipment_purchase_orders spo
      join public.purchase_order_order_links pol on pol.purchase_order_id=spo.purchase_order_id
      join public.orders o on o.id=pol.order_id
      join public.customers c on c.id=o.customer_id
      where spo.shipment_id=shipments.id and c.company=public.app_linked_company()
    ) or public.app_user_role()='customer' and exists(
      select 1 from public.shipment_purchase_orders spo
      join public.purchase_orders po on po.id=spo.purchase_order_id
      join public.orders o on o.id=coalesce(po.customer_order_id,po.ref_order_id)
      join public.customers c on c.id=o.customer_id
      where spo.shipment_id=shipments.id and c.company=public.app_linked_company()
    )
  );

-- Private document buckets: only staff can mutate files. Linked customers and
-- suppliers may read files belonging to their own orders/shipments.
drop policy if exists "allow all" on storage.objects;
create policy joychin_documents_internal on storage.objects
  for all to authenticated
  using (bucket_id in ('order-docs','shipment-docs') and public.app_is_internal())
  with check (bucket_id in ('order-docs','shipment-docs') and public.app_is_internal());
create policy joychin_order_documents_customer_read on storage.objects
  for select to authenticated
  using (
    bucket_id='order-docs' and public.app_user_role()='customer' and exists(
      select 1 from public.orders o join public.customers c on c.id=o.customer_id
      where o.id=split_part(storage.objects.name,'/',1)
        and c.company=public.app_linked_company()
    )
  );
create policy joychin_shipment_documents_external_read on storage.objects
  for select to authenticated
  using (
    bucket_id='shipment-docs' and (
      public.app_user_role()='supplier' and exists(
        select 1 from public.shipment_purchase_orders spo
        join public.purchase_orders po on po.id=spo.purchase_order_id
        join public.suppliers s on s.id=po.supplier_id
        where spo.shipment_id::text=split_part(storage.objects.name,'/',1)
          and s.company=public.app_linked_company()
      ) or public.app_user_role()='customer' and exists(
        select 1 from public.shipment_purchase_orders spo
        join public.purchase_order_order_links pol on pol.purchase_order_id=spo.purchase_order_id
        join public.orders o on o.id=pol.order_id
        join public.customers c on c.id=o.customer_id
        where spo.shipment_id::text=split_part(storage.objects.name,'/',1)
          and c.company=public.app_linked_company()
      )
    )
  );

-- Supplier shipment creation is atomic so RLS never needs a temporary broad
-- INSERT policy while the shipment is not linked to a supplier PO yet.
create or replace function public.supplier_create_shipment(
  p_shipment_no text,
  p_etd date,
  p_eta date,
  p_vessel_name text,
  p_items jsonb
) returns public.shipments
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_company text;
  v_shipment public.shipments%rowtype;
  v_item jsonb;
  v_po_item public.purchase_order_items%rowtype;
begin
  if public.app_user_role()<>'supplier' then raise exception 'Supplier account required'; end if;
  v_company:=public.app_linked_company();
  if v_company is null or jsonb_array_length(coalesce(p_items,'[]'::jsonb))=0 then
    raise exception 'Supplier company and shipment items are required';
  end if;
  if p_etd is null then raise exception 'ETD is required'; end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select poi.* into v_po_item
    from public.purchase_order_items poi
    join public.purchase_orders po on po.id=poi.po_id
    join public.suppliers s on s.id=po.supplier_id
    where poi.id=(v_item->>'po_item_id')::bigint and s.company=v_company;
    if not found then raise exception 'Shipment item is outside the supplier account'; end if;
    if coalesce((v_item->>'qty')::numeric,0)<=0 then raise exception 'Shipment quantity must be positive'; end if;
  end loop;

  insert into public.shipments(shipment_no,status,etd,eta,vessel_name)
  values (p_shipment_no,'planned',p_etd,p_eta,p_vessel_name)
  returning * into v_shipment;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select poi.* into v_po_item from public.purchase_order_items poi
    where poi.id=(v_item->>'po_item_id')::bigint;
    insert into public.shipment_purchase_orders(shipment_id,purchase_order_id)
    values(v_shipment.id,v_po_item.po_id) on conflict(shipment_id,purchase_order_id) do nothing;
    insert into public.shipment_items(
      shipment_id,po_id,po_item_id,product_id,product_name,qty,unit,status
    ) values(
      v_shipment.id,v_po_item.po_id,v_po_item.id,v_po_item.product_id,
      v_po_item.product_name,(v_item->>'qty')::numeric,coalesce(v_po_item.unit,''),'planned'
    );
  end loop;
  return v_shipment;
end;
$$;

create or replace function public.customer_submit_sample_feedback(
  p_sample_shipment_id bigint,
  p_status text,
  p_feedback text
) returns public.sample_shipments_out
language plpgsql
security definer
set search_path=public,auth
as $$
declare v_row public.sample_shipments_out%rowtype;
begin
  if public.app_user_role()<>'customer' then raise exception 'Customer account required'; end if;
  if p_status not in ('approved','rejected','need_revision') then raise exception 'Invalid feedback status'; end if;
  update public.sample_shipments_out so
  set status=p_status,feedback=nullif(trim(p_feedback),'')
  from public.customers c
  where so.id=p_sample_shipment_id and c.id=so.customer_id
    and c.company=public.app_linked_company()
  returning so.* into v_row;
  if not found then raise exception 'Sample shipment is outside the customer account'; end if;
  return v_row;
end;
$$;

revoke all on function public.supplier_create_shipment(text,date,date,text,jsonb) from public,anon;
revoke all on function public.customer_submit_sample_feedback(bigint,text,text) from public,anon;
grant execute on function public.supplier_create_shipment(text,date,date,text,jsonb) to authenticated;
grant execute on function public.customer_submit_sample_feedback(bigint,text,text) to authenticated;

-- Operational RPCs are internal-only through their own role checks/RLS.
revoke all on function public.post_inventory_transaction(date,text,bigint,numeric,text,numeric,text,bigint,bigint,text,text,text,text,boolean) from anon;
revoke all on function public.allocate_receiving_item(bigint,bigint,numeric,numeric,numeric,text,text,text,boolean) from anon;
revoke all on function public.carry_shortfall_to_purchase(bigint,text,text) from anon;
grant execute on function public.post_inventory_transaction(date,text,bigint,numeric,text,numeric,text,bigint,bigint,text,text,text,text,boolean) to authenticated;
grant execute on function public.allocate_receiving_item(bigint,bigint,numeric,numeric,numeric,text,text,text,boolean) to authenticated;
grant execute on function public.carry_shortfall_to_purchase(bigint,text,text) to authenticated;

-- Remove legacy plaintext material only after the Auth linkage guard passes.
update public.users set password_hash=null where auth_id is not null;

commit;
