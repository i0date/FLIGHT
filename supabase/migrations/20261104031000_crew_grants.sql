-- Supabase grants new functions to anon by default; crews are for signed-in travellers only.
revoke execute on function public.create_crew(text), public.join_crew(text), public.leave_crew(uuid),
  public.my_crews(), public.crew_board(uuid, date) from anon;
revoke execute on function public.board_name(text, text), public.live_streak(int, date, date) from anon, authenticated, public;
