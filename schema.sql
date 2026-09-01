-- KnitBook Supabase schema
-- PRD(데이터 모델) 기준. Supabase SQL Editor에서 바로 실행 가능.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type public.project_status as enum (
      'planned',
      'in_progress',
      'paused',
      'completed'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- updated_at 공통 트리거 함수
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1) public.users — auth.users(id)와 1:1 프로필
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nickname text,
  profile_image text,
  preferred_language text default 'ko',
  preferred_unit text default 'metric',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists users_nickname_idx on public.users (nickname);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

-- 신규 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'nickname',
      split_part(coalesce(new.email, 'user'), '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2) patterns — 사용자별 도안
-- ---------------------------------------------------------------------------
create table if not exists public.patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  pdf_url text,
  cover_image_url text,
  designer text,
  source text,
  category text,
  difficulty smallint check (difficulty is null or (difficulty between 1 and 5)),
  tags text[] not null default '{}',
  notes text,
  favorite boolean not null default false,
  last_opened_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists patterns_user_id_idx on public.patterns (user_id);
create index if not exists patterns_user_id_created_at_idx on public.patterns (user_id, created_at desc);
create index if not exists patterns_user_id_favorite_idx on public.patterns (user_id, favorite);
create index if not exists patterns_tags_gin_idx on public.patterns using gin (tags);

drop trigger if exists patterns_set_updated_at on public.patterns;
create trigger patterns_set_updated_at
before update on public.patterns
for each row
execute function public.set_updated_at();

-- 도안 페이지별 북마크/메모
create table if not exists public.pattern_pages (
  id uuid primary key default gen_random_uuid(),
  pattern_id uuid not null references public.patterns (id) on delete cascade,
  page_number integer not null check (page_number >= 1),
  bookmark boolean not null default false,
  memo text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (pattern_id, page_number)
);

create index if not exists pattern_pages_pattern_id_idx on public.pattern_pages (pattern_id);

drop trigger if exists pattern_pages_set_updated_at on public.pattern_pages;
create trigger pattern_pages_set_updated_at
before update on public.pattern_pages
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3) yarns — 사용자별 실 재고
-- ---------------------------------------------------------------------------
create table if not exists public.yarns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  brand text not null,
  product_name text not null,
  product_code text,
  color_name text,
  color_code text,
  lot_number text,
  material text,
  weight_gram numeric(10, 2),
  length_meter numeric(10, 2),
  thickness text,
  recommended_needle text,
  quantity numeric(10, 2) not null default 0,
  remaining_weight numeric(10, 2),
  purchase_date date,
  purchase_price numeric(12, 2),
  purchase_store text,
  label_image_url text,
  yarn_image_url text,
  confidence numeric(5, 2),
  is_estimated boolean not null default false,
  is_in_use boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists yarns_user_id_idx on public.yarns (user_id);
create index if not exists yarns_user_id_brand_idx on public.yarns (user_id, brand);
create index if not exists yarns_user_id_lot_number_idx on public.yarns (user_id, lot_number);

drop trigger if exists yarns_set_updated_at on public.yarns;
create trigger yarns_set_updated_at
before update on public.yarns
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) projects — 사용자별 작품
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  pattern_id uuid references public.patterns (id) on delete set null,
  title text not null,
  status public.project_status not null default 'planned',
  progress_percent numeric(5, 2) not null default 0
    check (progress_percent >= 0 and progress_percent <= 100),
  current_row integer check (current_row is null or current_row >= 0),
  total_row integer check (total_row is null or total_row >= 0),
  size text,
  started_at date,
  target_date date,
  completed_at date,
  cover_image_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_user_id_status_idx on public.projects (user_id, status);
create index if not exists projects_pattern_id_idx on public.projects (pattern_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- 작품 작업 기록 (Quick Log)
create table if not exists public.project_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  logged_on date not null default (timezone('utc', now()))::date,
  row_count integer check (row_count is null or row_count >= 0),
  progress_percent numeric(5, 2)
    check (progress_percent is null or (progress_percent >= 0 and progress_percent <= 100)),
  work_minutes integer check (work_minutes is null or work_minutes >= 0),
  photo_url text,
  memo text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists project_logs_project_id_idx on public.project_logs (project_id);
create index if not exists project_logs_project_id_logged_on_idx
  on public.project_logs (project_id, logged_on desc);

-- 작품-실 연결
create table if not exists public.project_yarns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  yarn_id uuid not null references public.yarns (id) on delete cascade,
  planned_quantity numeric(10, 2),
  used_quantity numeric(10, 2),
  created_at timestamptz not null default timezone('utc', now()),
  unique (project_id, yarn_id)
);

create index if not exists project_yarns_project_id_idx on public.project_yarns (project_id);
create index if not exists project_yarns_yarn_id_idx on public.project_yarns (yarn_id);

-- ---------------------------------------------------------------------------
-- RLS 활성화
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.patterns enable row level security;
alter table public.pattern_pages enable row level security;
alter table public.yarns enable row level security;
alter table public.projects enable row level security;
alter table public.project_logs enable row level security;
alter table public.project_yarns enable row level security;

-- ---------------------------------------------------------------------------
-- RLS 정책: 소유자만 읽기/쓰기
-- ---------------------------------------------------------------------------

-- users
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_delete_own" on public.users;

create policy "users_select_own"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_delete_own"
  on public.users for delete
  to authenticated
  using (auth.uid() = id);

-- patterns
drop policy if exists "patterns_select_own" on public.patterns;
drop policy if exists "patterns_insert_own" on public.patterns;
drop policy if exists "patterns_update_own" on public.patterns;
drop policy if exists "patterns_delete_own" on public.patterns;

create policy "patterns_select_own"
  on public.patterns for select
  to authenticated
  using (auth.uid() = user_id);

create policy "patterns_insert_own"
  on public.patterns for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "patterns_update_own"
  on public.patterns for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "patterns_delete_own"
  on public.patterns for delete
  to authenticated
  using (auth.uid() = user_id);

-- pattern_pages (부모 도안 소유자)
drop policy if exists "pattern_pages_select_own" on public.pattern_pages;
drop policy if exists "pattern_pages_insert_own" on public.pattern_pages;
drop policy if exists "pattern_pages_update_own" on public.pattern_pages;
drop policy if exists "pattern_pages_delete_own" on public.pattern_pages;

create policy "pattern_pages_select_own"
  on public.pattern_pages for select
  to authenticated
  using (
    exists (
      select 1
      from public.patterns p
      where p.id = pattern_pages.pattern_id
        and p.user_id = auth.uid()
    )
  );

create policy "pattern_pages_insert_own"
  on public.pattern_pages for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.patterns p
      where p.id = pattern_pages.pattern_id
        and p.user_id = auth.uid()
    )
  );

create policy "pattern_pages_update_own"
  on public.pattern_pages for update
  to authenticated
  using (
    exists (
      select 1
      from public.patterns p
      where p.id = pattern_pages.pattern_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.patterns p
      where p.id = pattern_pages.pattern_id
        and p.user_id = auth.uid()
    )
  );

create policy "pattern_pages_delete_own"
  on public.pattern_pages for delete
  to authenticated
  using (
    exists (
      select 1
      from public.patterns p
      where p.id = pattern_pages.pattern_id
        and p.user_id = auth.uid()
    )
  );

-- yarns
drop policy if exists "yarns_select_own" on public.yarns;
drop policy if exists "yarns_insert_own" on public.yarns;
drop policy if exists "yarns_update_own" on public.yarns;
drop policy if exists "yarns_delete_own" on public.yarns;

create policy "yarns_select_own"
  on public.yarns for select
  to authenticated
  using (auth.uid() = user_id);

create policy "yarns_insert_own"
  on public.yarns for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "yarns_update_own"
  on public.yarns for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "yarns_delete_own"
  on public.yarns for delete
  to authenticated
  using (auth.uid() = user_id);

-- projects
drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

-- project_logs (부모 작품 소유자)
drop policy if exists "project_logs_select_own" on public.project_logs;
drop policy if exists "project_logs_insert_own" on public.project_logs;
drop policy if exists "project_logs_update_own" on public.project_logs;
drop policy if exists "project_logs_delete_own" on public.project_logs;

create policy "project_logs_select_own"
  on public.project_logs for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_logs.project_id
        and pr.user_id = auth.uid()
    )
  );

create policy "project_logs_insert_own"
  on public.project_logs for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_logs.project_id
        and pr.user_id = auth.uid()
    )
  );

create policy "project_logs_update_own"
  on public.project_logs for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_logs.project_id
        and pr.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_logs.project_id
        and pr.user_id = auth.uid()
    )
  );

create policy "project_logs_delete_own"
  on public.project_logs for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_logs.project_id
        and pr.user_id = auth.uid()
    )
  );

-- project_yarns (작품·실 모두 본인 소유)
drop policy if exists "project_yarns_select_own" on public.project_yarns;
drop policy if exists "project_yarns_insert_own" on public.project_yarns;
drop policy if exists "project_yarns_update_own" on public.project_yarns;
drop policy if exists "project_yarns_delete_own" on public.project_yarns;

create policy "project_yarns_select_own"
  on public.project_yarns for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_yarns.project_id
        and pr.user_id = auth.uid()
    )
  );

create policy "project_yarns_insert_own"
  on public.project_yarns for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_yarns.project_id
        and pr.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.yarns y
      where y.id = project_yarns.yarn_id
        and y.user_id = auth.uid()
    )
  );

create policy "project_yarns_update_own"
  on public.project_yarns for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_yarns.project_id
        and pr.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_yarns.project_id
        and pr.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.yarns y
      where y.id = project_yarns.yarn_id
        and y.user_id = auth.uid()
    )
  );

create policy "project_yarns_delete_own"
  on public.project_yarns for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects pr
      where pr.id = project_yarns.project_id
        and pr.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: 도안 PDF (사용자별 private bucket)
-- Supabase 대시보드에서 bucket이 없으면 아래 insert가 생성한다.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('pattern-pdfs', 'pattern-pdfs', false)
on conflict (id) do nothing;

drop policy if exists "pattern_pdfs_insert_own" on storage.objects;
drop policy if exists "pattern_pdfs_select_own" on storage.objects;
drop policy if exists "pattern_pdfs_update_own" on storage.objects;
drop policy if exists "pattern_pdfs_delete_own" on storage.objects;

create policy "pattern_pdfs_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pattern-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pattern_pdfs_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'pattern-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pattern_pdfs_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pattern-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pattern-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pattern_pdfs_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pattern-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage: 실 사진 (사용자별 private bucket, 서명 URL로 조회)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('yarn-images', 'yarn-images', false)
on conflict (id) do nothing;

drop policy if exists "yarn_images_insert_own" on storage.objects;
drop policy if exists "yarn_images_select_own" on storage.objects;
drop policy if exists "yarn_images_update_own" on storage.objects;
drop policy if exists "yarn_images_delete_own" on storage.objects;

create policy "yarn_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'yarn-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "yarn_images_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'yarn-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "yarn_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'yarn-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'yarn-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "yarn_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'yarn-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
