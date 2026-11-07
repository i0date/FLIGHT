-- "Something wrong?": players flag a question they think is mistaken. Anyone can report,
-- signed in or not; only the service role can read reports (npm run reports).
-- The table stays locked; reports go in through report_question below.

create table public.question_reports (
  id bigint generated always as identity primary key,
  question_id text not null check (char_length(question_id) between 1 and 64),
  reason text not null check (reason in ('wrong_answer', 'typo', 'unclear', 'other')),
  note text check (char_length(note) <= 500),
  prompt text not null check (char_length(prompt) <= 500), -- the question as it was shown
  shown_answer text check (char_length(shown_answer) <= 500), -- the answer FLIGHT marked correct
  user_id uuid references auth.users (id) on delete set null,
  reporter uuid not null, -- the device's random token, so guests can be rate-limited too
  status text not null default 'open' check (status in ('open', 'fixed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index question_reports_open on public.question_reports (status, created_at);

alter table public.question_reports enable row level security;
revoke all on public.question_reports from anon, authenticated;

-- One report per question per device, and at most 20 a day from any device.
create function public.report_question(
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
  insert into public.question_reports (question_id, reason, note, prompt, shown_answer, user_id, reporter)
  values (left(qid, 64), why, nullif(left(trim(detail), 500), ''), left(question_prompt, 500), left(answer, 500), auth.uid(), reporter_token);
end;
$$;

revoke all on function public.report_question(text, text, text, text, text, uuid) from public;
grant execute on function public.report_question(text, text, text, text, text, uuid) to anon, authenticated;
