-- Add stripe_customer_id to profiles
alter table if exists public.profiles
  add column if not exists stripe_customer_id text;

-- Create subscriptions table to mirror Stripe state
create table if not exists public.subscriptions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  price_id text,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  payment_method_brand text,
  payment_method_last4 text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful index
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_customer on public.subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_subscription on public.subscriptions(stripe_subscription_id);
