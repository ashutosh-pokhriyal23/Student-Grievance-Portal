-- Users table schema for Supabase
-- Run this in the Supabase SQL Editor.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'student',
  verification_status text not null default 'pending',
  otp text,
  student_unique_id text unique,
  college_name text,
  year_of_validation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_verification_status on public.users(verification_status);

alter table public.users disable row level security;

-- Verify
select * from public.users;
