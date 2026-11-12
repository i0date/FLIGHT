-- A Large church plan: 100 seats, for churches that outgrow Church & groups (30).
alter table public.subscriptions drop constraint subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check check (plan in ('individual', 'family', 'group', 'church'));
