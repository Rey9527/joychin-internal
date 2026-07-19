-- Inquiry screenshots, supplier files and auditable contact timeline.

begin;

alter table public.inquiry_attachments
  add column if not exists file_size bigint,
  add column if not exists attachment_kind text not null default 'source'
    check (attachment_kind in ('source','supplier_request','supplier_reply','other'));

create table if not exists public.inquiry_events (
  id bigint generated always as identity primary key,
  inquiry_id text not null references public.inquiries(id) on delete cascade,
  event_type text not null check (event_type in (
    'created','contacted_supplier','supplier_reply','status_changed',
    'details_updated','attachment_added','attachment_removed','note'
  )),
  event_at timestamptz not null default now(),
  channel text,
  title text not null,
  detail text,
  attachment_id bigint references public.inquiry_attachments(id) on delete set null,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists inquiry_events_timeline_idx
  on public.inquiry_events(inquiry_id,event_at desc,id desc);

alter table public.inquiry_events enable row level security;
grant select,insert,update,delete on public.inquiry_events to authenticated;
grant usage,select on sequence public.inquiry_events_id_seq to authenticated;
drop policy if exists inquiry_events_internal_access on public.inquiry_events;
create policy inquiry_events_internal_access on public.inquiry_events
  for all to authenticated
  using (public.app_is_internal()) with check (public.app_is_internal());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'inquiry-attachments','inquiry-attachments',false,15728640,
  array[
    'image/jpeg','image/png','image/webp','application/pdf','text/plain','text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
)
on conflict(id) do update set
  public=false,file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists joychin_inquiry_attachments_internal on storage.objects;
create policy joychin_inquiry_attachments_internal on storage.objects
  for all to authenticated
  using (bucket_id='inquiry-attachments' and public.app_is_internal())
  with check (bucket_id='inquiry-attachments' and public.app_is_internal());

commit;
