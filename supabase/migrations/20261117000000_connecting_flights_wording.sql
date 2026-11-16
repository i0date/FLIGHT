-- Connecting Flights: the "Flight Club" name in the hosting message is now "Frequent Flyers". Same rule:
-- only members open a flight; anyone with the code can board.
create or replace function public.cf_create() returns text
language plpgsql security definer set search_path = '' as $$
declare
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ'; -- no I or O, so codes read clearly aloud
  made text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not exists (select 1 from public.my_membership()) then raise exception 'Opening a Connecting Flight is a Frequent Flyers perk. Boarding with a code is free.'; end if;
  delete from public.cf_rooms r where r.created_at < now() - interval '1 day';
  loop
    made := '';
    for i in 1..4 loop
      made := made || substr(letters, 1 + floor(random() * length(letters))::int, 1);
    end loop;
    exit when not exists (select 1 from public.cf_rooms r where r.code = made);
  end loop;
  insert into public.cf_rooms (code, host_id) values (made, auth.uid());
  return made;
end;
$$;
