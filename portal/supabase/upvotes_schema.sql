-- Upvotes tracking table for per-user like system
-- Run this in the Supabase SQL Editor.

create table if not exists public.complaint_upvotes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique(complaint_id, user_id)
);

create index if not exists idx_complaint_upvotes_complaint_id on public.complaint_upvotes(complaint_id);
create index if not exists idx_complaint_upvotes_user_id on public.complaint_upvotes(user_id);

alter table public.complaint_upvotes disable row level security;

-- Verify
select * from public.complaint_upvotes;
