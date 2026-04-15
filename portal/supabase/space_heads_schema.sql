-- Space Heads schema for Supabase
-- Run this in the Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Tables
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  department text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.space_heads (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null,
  teacher_id uuid not null,
  assigned_date timestamptz not null default now(),
  removed_date timestamptz default null,
  is_active boolean not null default true
);

-- Foreign keys
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'space_heads_space_id_fkey'
  ) then
    alter table public.space_heads
      add constraint space_heads_space_id_fkey
      foreign key (space_id) references public.spaces(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'space_heads_teacher_id_fkey'
  ) then
    alter table public.space_heads
      add constraint space_heads_teacher_id_fkey
      foreign key (teacher_id) references public.teachers(id) on delete cascade;
  end if;
end $$;

-- Indexes
create index if not exists idx_space_heads_space_id   on public.space_heads(space_id);
create index if not exists idx_space_heads_teacher_id on public.space_heads(teacher_id);
create index if not exists idx_space_heads_is_active  on public.space_heads(is_active);

-- Disable RLS so the backend service role can read/write freely
alter table public.spaces      disable row level security;
alter table public.teachers    disable row level security;
alter table public.space_heads disable row level security;

-- Seed: all spaces
insert into public.spaces (name, type) values
  ('ASD (APPLIED SCIENCE DEPARTMENT)', 'department'),
  ('CSE',                              'department'),
  ('ECE',                              'department'),
  ('EE',                               'department'),
  ('CIVIL',                            'department'),
  ('MECHANICAL',                       'department'),
  ('CHEMICAL',                         'department'),
  ('BIOTECHNOLOGY',                    'department'),
  ('GOMUKH',                           'hostel'),
  ('NANDA DEVI HOSTEL (NDH)',           'hostel'),
  ('ARAWALI',                          'hostel'),
  ('KAILASH',                          'hostel'),
  ('NEW BOYS HOSTEL (NBH)',             'hostel'),
  ('VINDHYACHAL',                      'hostel'),
  ('YAMUNOTRI',                        'hostel'),
  ('GANGOTRI',                         'hostel'),
  ('LIBRARY',                          'facility'),
  ('COMPETENCY BUILDING CENTRE',       'facility'),
  ('TRAINING AND PLACEMENT CELL',      'career'),
  ('ADMINISTRATION BLOCK',             'administrative'),
  ('SPORTS DEPT',                      'sports'),
  ('GYM',                              'sports'),
  ('MULTIPURPOSE THEATRE',             'cultural')
on conflict (name) do nothing;

-- Seed: all teachers
insert into public.teachers (name, department, email) values
  ('Lata Bisht',              'ASD', 'lata@college.edu'),
  ('Dr Kuldeep Kholiya',      'ASD', 'kuldeep@college.edu'),
  ('Dr RK Pandey',            'ASD', 'rkpandey@college.edu'),
  ('Neetu Rawat',             'ASD', 'neetu@college.edu'),
  ('Renu Bisht',              'ASD', 'renu@college.edu'),
  ('K. S. Vaisla',            'CSE', 'ksvaisla@college.edu'),
  ('Rajendra Kumar Bharti',   'CSE', 'rkbharti@college.edu'),
  ('Kapil Choudhary',         'CSE', 'kapil@college.edu'),
  ('Vishal Kumar',            'CSE', 'vishal@college.edu'),
  ('Archana Verma',           'CSE', 'archana@college.edu'),
  ('Sachin Gaur',             'CSE', 'sachin@college.edu'),
  ('Tanuja Patwal',           'CSE', 'tanuja@college.edu'),
  ('Lalit Gariya',            'ECE', 'lalit@college.edu'),
  ('Varun Kakkar',            'ECE', 'varun@college.edu'),
  ('Parul Kansal',            'ECE', 'parul@college.edu'),
  ('Sanjay Singh',            'ECE', 'sanjay@college.edu'),
  ('Vijiya Bhandari',         'ECE', 'vijiya@college.edu'),
  ('RP Joshi',                'ECE', 'rpjoshi@college.edu'),
  ('Jaspreet Singh',          'ECE', 'jaspreet@college.edu')
on conflict (name) do nothing;

-- Verify
select * from public.spaces;
select * from public.teachers;
