-- Authentication is managed by Supabase Auth; no password column is created.
create table public.learning_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  revision integer not null default 1 check (revision > 0),
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_progress_state_object check (jsonb_typeof(state) = 'object'),
  constraint learning_progress_state_owner check ((state ->> 'profileId') is not null and (state ->> 'profileId') = user_id::text),
  constraint learning_progress_schema_version check ((state ->> 'schemaVersion') is not null and (state ->> 'schemaVersion') = '1')
);
alter table public.learning_progress enable row level security;
alter table public.learning_progress force row level security;
revoke all on table public.learning_progress from anon;
revoke all on table public.learning_progress from authenticated;
grant select, insert, update on table public.learning_progress to authenticated;
create policy learning_progress_select_own on public.learning_progress
 for select to authenticated using ((select auth.uid()) = user_id);
create policy learning_progress_insert_own on public.learning_progress
 for insert to authenticated with check ((select auth.uid()) = user_id);
create policy learning_progress_update_own on public.learning_progress
 for update to authenticated
 using ((select auth.uid()) = user_id)
 with check ((select auth.uid()) = user_id);
comment on table public.learning_progress is 'Account-scoped learning snapshots. No credentials. CAS revision prevents lost updates; educational evidence, not a secure exam score.';
