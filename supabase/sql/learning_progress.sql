-- Additive database update for the existing JobPulse Supabase project.
-- Run only once. This retains all profiles, resume analyses, and historical observations.
create table if not exists public.learning_progress (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 role_id text not null check (length(role_id) between 2 and 50),
 skill text not null check (length(skill) between 1 and 100),
 completed_at timestamptz not null default now(),
 unique (user_id, role_id, skill)
);
create index if not exists learning_progress_user_idx on public.learning_progress(user_id, role_id);
alter table public.learning_progress enable row level security;
create policy "progress read own" on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress insert own" on public.learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress update own" on public.learning_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress delete own" on public.learning_progress for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.learning_progress from anon;
grant select, insert, update, delete on public.learning_progress to authenticated;
