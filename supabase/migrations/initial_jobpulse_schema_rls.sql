-- Already applied to JobPulse Supabase project xnmjjdezdbsjcbgqmvyk.
-- Only execute this migration against a NEW, empty Supabase project.
create extension if not exists pgcrypto;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 target_role text,
 created_at timestamptz not null default now()
);
create table public.resume_analyses (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 target_role text not null,
 detected_skills text[] not null default '{}',
 missing_skills text[] not null default '{}',
 readiness_score integer not null check (readiness_score between 0 and 100),
 recommendations jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now()
);
create table public.job_market_observations (
 id uuid primary key default gen_random_uuid(),
 role_name text not null,
 skill_name text not null,
 observed_month date not null,
 posting_count integer not null check (posting_count >= 0),
 source_name text not null,
 source_url text,
 collected_at timestamptz not null default now(),
 unique(role_name,skill_name,observed_month,source_name)
);
create index resume_analyses_user_created_idx on public.resume_analyses(user_id,created_at desc);
create index job_market_series_idx on public.job_market_observations(role_name,skill_name,observed_month);
alter table public.profiles enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.job_market_observations enable row level security;
create policy "profiles read own" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "profiles delete own" on public.profiles for delete to authenticated using ((select auth.uid())=id);
create policy "analyses read own" on public.resume_analyses for select to authenticated using ((select auth.uid())=user_id);
create policy "analyses insert own" on public.resume_analyses for insert to authenticated with check ((select auth.uid())=user_id);
create policy "analyses delete own" on public.resume_analyses for delete to authenticated using ((select auth.uid())=user_id);
create policy "market public read" on public.job_market_observations for select to anon,authenticated using (true);
grant select,insert,update,delete on public.profiles to authenticated;
grant select,insert,delete on public.resume_analyses to authenticated;
grant select on public.job_market_observations to anon,authenticated;
revoke all on public.profiles,public.resume_analyses from anon;
