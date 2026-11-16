-- Only the hourly job may run the reminders function. The database makes its own random key, keeps it where
-- the public API can't reach, and sends it with each hourly call; the function checks it before sending anything.
-- (One-click unsubscribe from emails still works without it.)
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.settings (name text primary key, value text not null);
insert into private.settings (name, value)
values ('reminders_key', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (name) do nothing;

create function public.reminders_key_ok(k text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.settings s where s.name = 'reminders_key' and s.value = k);
$$;
revoke all on function public.reminders_key_ok(text) from public, anon, authenticated;
grant execute on function public.reminders_key_ok(text) to service_role;

select cron.unschedule('flight-reminders');
select cron.schedule(
  'flight-reminders',
  '0 * * * *',
  $$ select net.http_post(
       url := 'https://izbtudngvxquegluyums.supabase.co/functions/v1/reminders',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-reminders-key', (select s.value from private.settings s where s.name = 'reminders_key')
       ),
       body := '{}'::jsonb
     ) $$
);
