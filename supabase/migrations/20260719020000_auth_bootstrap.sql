-- JOY CHIN authentication bootstrap migration.
-- Apply before migrating legacy public.users accounts to Supabase Auth.
-- This stage is additive and intentionally does not change the current RLS
-- policies, so the existing site remains available during account linking.

begin;

alter table public.users
  add column if not exists auth_id uuid references auth.users(id) on delete set null,
  add column if not exists auth_email text;

create unique index if not exists users_auth_id_uidx
  on public.users(auth_id) where auth_id is not null;
create unique index if not exists users_auth_email_uidx
  on public.users(lower(auth_email)) where auth_email is not null;

create or replace function public.app_profile_id()
returns bigint
language sql
stable
security definer
set search_path=public,auth
as $$
  select u.id
  from public.users u
  where u.auth_id=(select auth.uid()) and u.is_active=true
  limit 1
$$;

create or replace function public.app_user_role()
returns text
language sql
stable
security definer
set search_path=public,auth
as $$
  select case when u.role='assistant' then 'user' else u.role end
  from public.users u
  where u.auth_id=(select auth.uid()) and u.is_active=true
  limit 1
$$;

create or replace function public.app_linked_company()
returns text
language sql
stable
security definer
set search_path=public,auth
as $$
  select u.linked_company
  from public.users u
  where u.auth_id=(select auth.uid()) and u.is_active=true
  limit 1
$$;

create or replace function public.app_is_internal()
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select coalesce(public.app_user_role() in ('admin','manager','user'),false)
$$;

create or replace function public.app_is_manager()
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select coalesce(public.app_user_role() in ('admin','manager'),false)
$$;

create or replace function public.app_has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select coalesce(
    case
      when (case when u.role='assistant' then 'user' else u.role end) in ('admin','manager') then true
      else coalesce((g.permissions->>p_permission)::boolean,false)
    end,
    false
  )
  from public.users u
  left join public.user_groups g on g.id=u.group_id
  where u.auth_id=(select auth.uid()) and u.is_active=true
  limit 1
$$;

revoke all on function public.app_profile_id() from public,anon;
revoke all on function public.app_user_role() from public,anon;
revoke all on function public.app_linked_company() from public,anon;
revoke all on function public.app_is_internal() from public,anon;
revoke all on function public.app_is_manager() from public,anon;
revoke all on function public.app_has_permission(text) from public,anon;
grant execute on function public.app_profile_id() to authenticated,service_role;
grant execute on function public.app_user_role() to authenticated,service_role;
grant execute on function public.app_linked_company() to authenticated,service_role;
grant execute on function public.app_is_internal() to authenticated,service_role;
grant execute on function public.app_is_manager() to authenticated,service_role;
grant execute on function public.app_has_permission(text) to authenticated,service_role;

commit;
