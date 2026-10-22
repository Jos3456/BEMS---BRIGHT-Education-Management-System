
-- 1. Read the current user's account status safely.
-- This allows the login page to detect suspension without exposing
-- other users' profiles.

create or replace function public.current_account_status()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.account_status::text
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_account_status()
  from public, anon;

grant execute on function public.current_account_status()
  to authenticated;


-- 2. Store learning resource details in the database.
create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),

  title text not null
    check (char_length(btrim(title)) between 2 and 180),

  category text not null check (
    category in (
      'notes',
      'revision_papers',
      'past_papers',
      'textbooks',
      'videos',
      'worksheets',
      'presentations',
      'other'
    )
  ),

  description text not null default ''
    check (char_length(description) <= 3000),

  curriculum text not null default 'General'
    check (char_length(curriculum) <= 100),

  subject text not null default ''
    check (char_length(subject) <= 120),

  education_level text not null default ''
    check (char_length(education_level) <= 120),

  file_path text not null unique,
  file_name text not null
    check (char_length(file_name) between 1 and 255),

  file_size bigint not null
    check (file_size > 0 and file_size <= 52428800),

  mime_type text not null
    check (char_length(mime_type) <= 150),

  status text not null default 'draft'
    check (status in ('draft', 'published')),

  created_by uuid not null
    references auth.users(id) on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_resources_status_category_idx
  on public.learning_resources(status, category);

create index if not exists learning_resources_curriculum_subject_idx
  on public.learning_resources(curriculum, subject);


-- 3. Protect the resource records.
alter table public.learning_resources enable row level security;

revoke all on public.learning_resources from anon;

grant select, insert, update, delete
  on public.learning_resources to authenticated;

drop policy if exists "Admins manage learning resources"
  on public.learning_resources;

create policy "Admins manage learning resources"
on public.learning_resources
for all to authenticated
using (
  public.is_active_user()
  and public.has_role('admin'::public.app_role)
)
with check (
  public.is_active_user()
  and public.has_role('admin'::public.app_role)
);

drop policy if exists "Active users read published learning resources"
  on public.learning_resources;

create policy "Active users read published learning resources"
on public.learning_resources
for select to authenticated
using (
  public.is_active_user()
  and status = 'published'
);


-- 4. Create a private storage bucket.
-- 50 MiB maximum file size. Only listed file types are accepted.
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'learning-resources',
  'learning-resources',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- 5. Storage permissions: active admins manage files.
drop policy if exists "Admins upload learning resource files"
  on storage.objects;

create policy "Admins upload learning resource files"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'learning-resources'
  and public.is_active_user()
  and public.has_role('admin'::public.app_role)
);

drop policy if exists "Admins update learning resource files"
  on storage.objects;

create policy "Admins update learning resource files"
on storage.objects
for update to authenticated
using (
  bucket_id = 'learning-resources'
  and public.is_active_user()
  and public.has_role('admin'::public.app_role)
)
with check (
  bucket_id = 'learning-resources'
  and public.is_active_user()
  and public.has_role('admin'::public.app_role)
);

drop policy if exists "Admins delete learning resource files"
  on storage.objects;

create policy "Admins delete learning resource files"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'learning-resources'
  and public.is_active_user()
  and public.has_role('admin'::public.app_role)
);

drop policy if exists "Active users read published resource files"
  on storage.objects;

create policy "Active users read published resource files"
on storage.objects
for select to authenticated
using (
  bucket_id = 'learning-resources'
  and public.is_active_user()
  and (
    public.has_role('admin'::public.app_role)
    or exists (
      select 1
      from public.learning_resources r
      where r.file_path = storage.objects.name
        and r.status = 'published'
    )
  )
);
