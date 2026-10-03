-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

-- ===== Profiles (one per login) =====
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'pending' check (role in ('admin','member','pending')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Role helpers =====
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function public.is_approved() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','member'));
$$;

-- ===== Tasks / workplan =====
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date date,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','completed','discuss_with_liu')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  author_name text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

-- ===== Box folders (shared links) =====
create table if not exists public.box_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  share_url text not null,
  visibility text not null default 'private' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

-- ===== Row Level Security =====
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.box_folders enable row level security;

-- profiles: you see yourself; approved users see everyone (names for the workplan); only admin edits roles
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.is_approved());
create policy "profiles admin update" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());
create policy "profiles admin delete" on public.profiles for delete using (public.is_admin());

-- tasks: owners manage their own, admin manages all
create policy "tasks read" on public.tasks for select
  using (public.is_approved() and (owner_id = auth.uid() or public.is_admin()));
create policy "tasks insert" on public.tasks for insert
  with check (public.is_approved() and (owner_id = auth.uid() or public.is_admin()));
create policy "tasks update" on public.tasks for update
  using (public.is_approved() and (owner_id = auth.uid() or public.is_admin()));
create policy "tasks delete" on public.tasks for delete
  using (public.is_admin() or owner_id = auth.uid());

-- comments: visible/writable if you can see the task
create policy "comments read" on public.task_comments for select
  using (exists (select 1 from public.tasks t where t.id = task_id
                 and (t.owner_id = auth.uid() or public.is_admin())) and public.is_approved());
create policy "comments insert" on public.task_comments for insert
  with check (author_id = auth.uid() and public.is_approved()
              and exists (select 1 from public.tasks t where t.id = task_id
                          and (t.owner_id = auth.uid() or public.is_admin())));
create policy "comments delete" on public.task_comments for delete using (public.is_admin());

-- box folders: public ones are visible to everyone, private only to approved members; admin edits
create policy "box read" on public.box_folders for select
  using (visibility = 'public' or public.is_approved());
create policy "box admin write" on public.box_folders for all
  using (public.is_admin()) with check (public.is_admin());

-- ===== AFTER you create your own account on the site, make yourself admin =====
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
