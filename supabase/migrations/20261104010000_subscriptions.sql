-- Flight Club subscriptions. Rows are written only by the server (the Stripe
-- webhook and the join/leave endpoint, using the service role); the app can read
-- what applies to the signed-in traveller.

drop table public.memberships;

create table public.stripe_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  customer_id text not null unique
);

create table public.subscriptions (
  id text primary key, -- Stripe subscription id
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('individual', 'family', 'group')),
  seats int not null check (seats >= 1), -- includes the owner
  status text not null,
  active_until timestamptz not null,
  invite_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  updated_at timestamptz not null default now()
);
create index subscriptions_owner on public.subscriptions (owner_id);

-- Family and group travellers who joined someone else's subscription.
create table public.subscription_members (
  subscription_id text not null references public.subscriptions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (subscription_id, user_id)
);
create index subscription_members_user on public.subscription_members (user_id);

alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_members enable row level security;
revoke all on public.stripe_customers, public.subscriptions, public.subscription_members from anon, authenticated;

-- What membership applies to the signed-in traveller, if any. The invite code
-- and member count are only shown to the person who pays.
create function public.my_membership()
returns table (plan text, role text, active_until timestamptz, seats int, members int, invite_code text)
language sql stable security definer set search_path = '' as $$
  select s.plan,
         case when s.owner_id = auth.uid() then 'owner' else 'member' end,
         s.active_until,
         s.seats,
         1 + (select count(*)::int from public.subscription_members m where m.subscription_id = s.id),
         case when s.owner_id = auth.uid() then s.invite_code end
  from public.subscriptions s
  where s.status in ('active', 'trialing', 'past_due')
    and s.active_until > now()
    and (s.owner_id = auth.uid()
         or exists (select 1 from public.subscription_members m where m.subscription_id = s.id and m.user_id = auth.uid()))
  order by (s.owner_id = auth.uid()) desc, s.active_until desc
  limit 1;
$$;

revoke execute on function public.my_membership() from public, anon;
grant execute on function public.my_membership() to authenticated;
