-- Complaints table schema for Supabase
-- Run this in the Supabase SQL Editor.

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  description text,
  category text,
  status text not null default 'created',
  priority text not null default 'P2',
  upvotes integer not null default 0,
  is_anonymous boolean not null default false,
  student_name text,
  student_email text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_complaints_space_id  on public.complaints(space_id);
create index if not exists idx_complaints_status    on public.complaints(status);
create index if not exists idx_complaints_priority  on public.complaints(priority);
create index if not exists idx_complaints_created_at on public.complaints(created_at);

-- Disable RLS so backend service role can read/write freely
alter table public.complaints disable row level security;

-- Verify
select * from public.complaints;
