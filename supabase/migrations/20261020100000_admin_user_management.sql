
-- BEMS: Secure admin user management

-- List users, their emails, roles and account statuses.
create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  full_name text,
  email text,
  account_status text,
  roles text[],
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
     or not public.has_role('admin'::public.app_role) then
    raise exception 'Access denied';
  end if;

  return query
  select
    p.id,
    p.full_name::text,
    u.email::text,
    p.account_status::text,
    coalesce(
      array_agg(distinct ur.role::text)
        filter (where ur.role is not null),
      array[]::text[]
    ),
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.user_roles ur on ur.user_id = p.id
  group by
    p.id, p.full_name, u.email,
    p.account_status, p.created_at
  order by p.created_at desc;
end;
$$;

-- Suspend or reactivate another user's account.
create or replace function public.admin_set_user_status(
  target_user_id uuid,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
     or not public.has_role('admin'::public.app_role) then
    raise exception 'Access denied';
  end if;

  if target_user_id is null
     or target_user_id = auth.uid() then
    raise exception 'You cannot change your own account status';
  end if;

    if new_status is null
     or new_status not in ('active', 'suspended') then
    raise exception 'Invalid account status';
    end if;

    if exists (
    select 1
    from public.user_roles
    where user_id = target_user_id
      and role = 'admin'::public.app_role
  ) then
    raise exception 'Changing another administrator requires a separate procedure';
  end if;

  update public.profiles
  set account_status = new_status::public.account_status,
      updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

-- Restrict execution to signed-in users.
revoke all on function public.admin_list_users() from public, anon;
revoke all on function public.admin_set_user_status(uuid, text)
  from public, anon;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_user_status(uuid, text)
  to authenticated;
