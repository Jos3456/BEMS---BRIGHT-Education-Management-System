-- BEMS performance tracking foundation
-- Apply after the existing profiles and user_roles tables have been created.
-- This migration deliberately does not assume that school classes exist: assessments
-- can be associated with a subject/course name and an academic period, fitting tutoring
-- as well as conventional school settings.

create table if not exists public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  curriculum_name text,
  level_name text,
  starts_on date,
  ends_on date,
  is_active boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint academic_periods_date_order check (
    starts_on is null or ends_on is null or starts_on <= ends_on
  )
);

create table if not exists public.grade_scales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  curriculum_name text,
  level_name text,
  description text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.grade_scale_rules (
  id uuid primary key default gen_random_uuid(),
  grade_scale_id uuid not null references public.grade_scales(id) on delete cascade,
  grade_label text not null,
  min_percentage numeric(5,2) not null,
  max_percentage numeric(5,2) not null,
  comment text,
  sort_order integer not null default 0,
  constraint grade_scale_rules_percentage_range check (
    min_percentage >= 0 and max_percentage <= 100 and min_percentage <= max_percentage
  ),
  constraint grade_scale_rules_unique_label unique (grade_scale_id, grade_label)
);

create table if not exists public.learning_assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assessment_type text not null default 'assignment'
    check (assessment_type in ('quiz', 'assignment', 'cat', 'exam', 'project', 'practice', 'other')),
  subject_name text not null,
  course_name text,
  academic_period_id uuid references public.academic_periods(id) on delete set null,
  grade_scale_id uuid references public.grade_scales(id) on delete set null,
  teacher_id uuid not null references auth.users(id) on delete restrict,
  max_score numeric(10,2) not null check (max_score > 0),
  assessment_date date,
  due_date date,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed')),
  results_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_assessments_date_order check (
    assessment_date is null or due_date is null or assessment_date <= due_date
  )
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.learning_assessments(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete restrict,
  score numeric(10,2) check (score >= 0),
  teacher_feedback text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  graded_by uuid references auth.users(id) on delete set null,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_results_one_per_learner unique (assessment_id, learner_id)
);

-- Guardian links are intentionally not self-service writable. A separate, secure
-- invitation/acceptance workflow must create or revoke links; direct client inserts
-- would let a user attach themselves to another learner.
create table if not exists public.guardian_student_links (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked')),
  linked_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  constraint guardian_student_links_not_self check (guardian_id <> learner_id),
  constraint guardian_student_links_unique unique (guardian_id, learner_id)
);

create table if not exists public.learner_reports (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete restrict,
  academic_period_id uuid references public.academic_periods(id) on delete set null,
  title text not null default 'Learning report',
  summary text,
  strengths text,
  areas_to_improve text,
  teacher_comment text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_assessments_teacher_idx
  on public.learning_assessments (teacher_id, created_at desc);
create index if not exists learning_assessments_period_subject_idx
  on public.learning_assessments (academic_period_id, subject_name);
create index if not exists assessment_results_learner_idx
  on public.assessment_results (learner_id, status);
create index if not exists guardian_student_links_guardian_idx
  on public.guardian_student_links (guardian_id, status);
create index if not exists guardian_student_links_learner_idx
  on public.guardian_student_links (learner_id, status);
create index if not exists learner_reports_learner_period_idx
  on public.learner_reports (learner_id, academic_period_id, status);

alter table public.academic_periods enable row level security;
alter table public.grade_scales enable row level security;
alter table public.grade_scale_rules enable row level security;
alter table public.learning_assessments enable row level security;
alter table public.assessment_results enable row level security;
alter table public.guardian_student_links enable row level security;
alter table public.learner_reports enable row level security;

-- Academic periods and grading rules are readable to signed-in users; only admins
-- may manage them. Grade boundaries remain configurable rather than hard-coded.
drop policy if exists "Signed-in users can read academic periods" on public.academic_periods;
create policy "Signed-in users can read academic periods"
  on public.academic_periods for select to authenticated
  using (true);

drop policy if exists "Admins manage academic periods" on public.academic_periods;
create policy "Admins manage academic periods"
  on public.academic_periods for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists "Signed-in users can read active grade scales" on public.grade_scales;
create policy "Signed-in users can read active grade scales"
  on public.grade_scales for select to authenticated
  using (is_active or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists "Admins manage grade scales" on public.grade_scales;
create policy "Admins manage grade scales"
  on public.grade_scales for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists "Signed-in users can read grade scale rules" on public.grade_scale_rules;
create policy "Signed-in users can read grade scale rules"
  on public.grade_scale_rules for select to authenticated
  using (exists (
    select 1 from public.grade_scales gs
    where gs.id = grade_scale_id and (
      gs.is_active or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
    )
  ));

drop policy if exists "Admins manage grade scale rules" on public.grade_scale_rules;
create policy "Admins manage grade scale rules"
  on public.grade_scale_rules for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

-- Teachers manage only assessments they created. Admins may oversee all assessments.
drop policy if exists "Users read published assessments or their own" on public.learning_assessments;
create policy "Users read published assessments or their own"
  on public.learning_assessments for select to authenticated
  using (
    teacher_id = auth.uid()
    or status = 'published'
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Teachers create their own assessments" on public.learning_assessments;
create policy "Teachers create their own assessments"
  on public.learning_assessments for insert to authenticated
  with check (
    teacher_id = auth.uid()
    and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'teacher')
  );

drop policy if exists "Teachers update their own assessments and admins manage all" on public.learning_assessments;
create policy "Teachers update their own assessments and admins manage all"
  on public.learning_assessments for update to authenticated
  using (
    teacher_id = auth.uid()
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  )
  with check (
    teacher_id = auth.uid()
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Admins delete assessments" on public.learning_assessments;
create policy "Admins delete assessments"
  on public.learning_assessments for delete to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

-- Results are visible to the learner, an actively linked guardian, the assessment's
-- owning teacher, or an admin. Learners/guardians only see published results.
drop policy if exists "Authorized users read assessment results" on public.assessment_results;
create policy "Authorized users read assessment results"
  on public.assessment_results for select to authenticated
  using (
    (learner_id = auth.uid() and status = 'published')
    or exists (
      select 1 from public.guardian_student_links gl
      where gl.guardian_id = auth.uid() and gl.learner_id = assessment_results.learner_id and gl.status = 'active'
        and assessment_results.status = 'published'
    )
    or exists (
      select 1 from public.learning_assessments a
      where a.id = assessment_id and a.teacher_id = auth.uid()
    )
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Teachers enter results for their own assessments" on public.assessment_results;
create policy "Teachers enter results for their own assessments"
  on public.assessment_results for insert to authenticated
  with check (
    exists (
      select 1 from public.learning_assessments a
      where a.id = assessment_id and a.teacher_id = auth.uid()
    )
    and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'teacher')
    and (score is null or score <= (select a.max_score from public.learning_assessments a where a.id = assessment_id))
  );

drop policy if exists "Teachers update results for their own assessments" on public.assessment_results;
create policy "Teachers update results for their own assessments"
  on public.assessment_results for update to authenticated
  using (
    exists (select 1 from public.learning_assessments a where a.id = assessment_id and a.teacher_id = auth.uid())
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  )
  with check (
    exists (select 1 from public.learning_assessments a where a.id = assessment_id and a.teacher_id = auth.uid())
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Admins delete assessment results" on public.assessment_results;
create policy "Admins delete assessment results"
  on public.assessment_results for delete to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

-- The link table can be read only by either participant or admins. No public client
-- policy permits creating/revoking links; implement that through a validated invite
-- acceptance flow or an audited admin operation.
drop policy if exists "Participants and admins read guardian links" on public.guardian_student_links;
create policy "Participants and admins read guardian links"
  on public.guardian_student_links for select to authenticated
  using (
    guardian_id = auth.uid()
    or learner_id = auth.uid()
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Admins manage guardian links" on public.guardian_student_links;
create policy "Admins manage guardian links"
  on public.guardian_student_links for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

-- Teachers own reports they create; learners and linked guardians see published reports.
drop policy if exists "Authorized users read learner reports" on public.learner_reports;
create policy "Authorized users read learner reports"
  on public.learner_reports for select to authenticated
  using (
    (learner_id = auth.uid() and status = 'published')
    or exists (
      select 1 from public.guardian_student_links gl
      where gl.guardian_id = auth.uid() and gl.learner_id = learner_reports.learner_id and gl.status = 'active'
        and learner_reports.status = 'published'
    )
    or created_by = auth.uid()
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Teachers create their own learner reports" on public.learner_reports;
create policy "Teachers create their own learner reports"
  on public.learner_reports for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'teacher')
  );

drop policy if exists "Teachers update their own learner reports and admins manage all" on public.learner_reports;
create policy "Teachers update their own learner reports and admins manage all"
  on public.learner_reports for update to authenticated
  using (
    created_by = auth.uid()
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  )
  with check (
    created_by = auth.uid()
    or exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
  );

drop policy if exists "Admins delete learner reports" on public.learner_reports;
create policy "Admins delete learner reports"
  on public.learner_reports for delete to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

-- Keep updated_at current when the application updates these records.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_assessments_set_updated_at on public.learning_assessments;
create trigger learning_assessments_set_updated_at
before update on public.learning_assessments
for each row execute function public.set_updated_at();

drop trigger if exists assessment_results_set_updated_at on public.assessment_results;
create trigger assessment_results_set_updated_at
before update on public.assessment_results
for each row execute function public.set_updated_at();

drop trigger if exists learner_reports_set_updated_at on public.learner_reports;
create trigger learner_reports_set_updated_at
before update on public.learner_reports
for each row execute function public.set_updated_at();
