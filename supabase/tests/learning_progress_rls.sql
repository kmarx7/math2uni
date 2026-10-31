-- Run against a disposable test database or with the approved Supabase SQL tool.
-- Uses temporary Auth rows inside one transaction; every probe is rolled back.
-- A failure aborts the transaction and must not be reported as a pass.
begin;
select set_config('math90.probe_a', gen_random_uuid()::text, true),
       set_config('math90.probe_b', gen_random_uuid()::text, true);
insert into auth.users (id, email) values
  (current_setting('math90.probe_a')::uuid, 'rls-a-' || current_setting('math90.probe_a') || '@math90.invalid'),
  (current_setting('math90.probe_b')::uuid, 'rls-b-' || current_setting('math90.probe_b') || '@math90.invalid');
insert into public.learning_progress (user_id, state)
select current_setting('math90.probe_b')::uuid,
  jsonb_build_object('schemaVersion', 1, 'profileId', current_setting('math90.probe_b'),
    'attempts', '[]'::jsonb, 'completedBlocks', '[]'::jsonb, 'assessmentScore', null);
set local role authenticated;
select set_config('request.jwt.claims',
  jsonb_build_object('sub', current_setting('math90.probe_a'), 'role', 'authenticated')::text, true);
do $test$
declare n integer; denied boolean := false;
begin
  if (select count(*) from public.learning_progress) <> 0 then
    raise exception 'Cross-account SELECT leaked';
  end if;
  insert into public.learning_progress (user_id, state) values
    (current_setting('math90.probe_a')::uuid,
      jsonb_build_object('schemaVersion', 1, 'profileId', current_setting('math90.probe_a'),
        'attempts', '[]'::jsonb, 'completedBlocks', '[]'::jsonb, 'assessmentScore', null));
  if (select count(*) from public.learning_progress) <> 1 then
    raise exception 'Own SELECT failed';
  end if;
  update public.learning_progress set revision = revision + 1
    where user_id = current_setting('math90.probe_a')::uuid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Own UPDATE failed'; end if;
  update public.learning_progress set revision = revision + 1
    where user_id = current_setting('math90.probe_b')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Cross-account UPDATE succeeded'; end if;
  begin
    insert into public.learning_progress (user_id, state) values
      (current_setting('math90.probe_b')::uuid,
        jsonb_build_object('schemaVersion', 1, 'profileId', current_setting('math90.probe_b')));
  exception when insufficient_privilege then denied := true;
  end;
  if not denied then raise exception 'Cross-account INSERT was not denied'; end if;
  denied := false;
  begin
    update public.learning_progress
      set user_id = current_setting('math90.probe_b')::uuid,
          state = jsonb_set(state, '{profileId}', to_jsonb(current_setting('math90.probe_b')))
      where user_id = current_setting('math90.probe_a')::uuid;
  exception when insufficient_privilege then denied := true;
  end;
  if not denied then raise exception 'Ownership reassignment was not denied'; end if;
end $test$;
rollback;
select 'PASS: ownership checks succeeded and all probes rolled back' as rls_verification;
