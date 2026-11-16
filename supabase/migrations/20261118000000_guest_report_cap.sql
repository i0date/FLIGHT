-- Question reports from signed-out visitors: each device was already limited to 20 a day, but a new device
-- token is free to make. So guests together get at most 60 reports an hour; signed-in travellers aren't affected.
create or replace function public.report_question(
  qid text, why text, detail text, question_prompt text, answer text, reporter_token uuid
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.question_reports r where r.reporter = reporter_token and r.question_id = qid) then
    return;
  end if;
  if (select count(*) from public.question_reports r
      where r.reporter = reporter_token and r.created_at > now() - interval '1 day') >= 20 then
    raise exception 'Thanks — that''s plenty of reports for today. Try again tomorrow.';
  end if;
  if auth.uid() is null and (select count(*) from public.question_reports r
      where r.user_id is null and r.created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Lots of reports are coming in right now. Please try again in a little while, or sign in.';
  end if;
  insert into public.question_reports (question_id, reason, note, prompt, shown_answer, user_id, reporter)
  values (left(qid, 64), why, nullif(left(trim(detail), 500), ''), left(question_prompt, 500), left(answer, 500), auth.uid(), reporter_token);
end;
$$;
