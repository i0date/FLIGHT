-- Book Club moves from one 5-question flight to three 7-question legs per book.
-- A stamp is earned with all three legs flown and at least 15 of 21 correct.
-- (The table was empty when this ran.)

drop table public.book_results;

create table public.book_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null,
  legs smallint[] not null check (array_length(legs, 1) = 3), -- best score out of 7 per leg; null until flown
  attempts int not null default 1 check (attempts >= 1),
  last_flown date not null default current_date,
  earned_at date, -- day the stamp was earned
  primary key (user_id, book_id)
);

alter table public.book_results enable row level security;
create policy "own books: read" on public.book_results for select using (auth.uid() = user_id);
create policy "own books: insert" on public.book_results for insert with check (auth.uid() = user_id);
create policy "own books: update" on public.book_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
