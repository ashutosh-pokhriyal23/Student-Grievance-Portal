# Student Grievance Portal - Backend

This is the Node.js + Express backend for the Student Grievance Portal. It handles complaint management, upvoting logic, and space organization using Supabase as the primary database.

## Features
- **Spaces API**: List all departments and hostels with open complaint counts.
- **Complaints API**: Full CRUD logic for student grievances.
- **Priority Logic**: Automatic priority shifting based on upvote count (0-14: P2, 15-24: P1, 25+: P0).
- **Validation**: Request body validation using `express-validator`.
- **Security**: Security headers with `helmet` and CORS configuration.

## Prerequisites
- Node.js 18+
- Supabase Project

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials.
4. Run the SQL schema (provided below) in your Supabase SQL Editor.
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints
- `GET /api/spaces` - Get all spaces with open complaint counts.
- `GET /api/complaints?space_id=xxx` - Get complaints for a space.
- `GET /api/complaints/:id` - Get complaint details.
- `POST /api/complaints` - Raise a new complaint.
- `PATCH /api/complaints/:id/upvote` - Upvote a complaint (triggers priority update).

## Supabase SQL Schema
```sql
-- Run this in your Supabase SQL Editor
create table spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('department', 'hostel')) not null,
  created_at timestamptz default now()
);

insert into spaces (name, type) values
  ('CSE', 'department'), ('ECE', 'department'), ('EE', 'department'), ('Biotechnology', 'department'),
  ('Civil', 'department'), ('ASD', 'department'), ('Mechanical', 'department'),
  ('Gomukh Hostel', 'hostel'), ('Arawali Hostel', 'hostel'), ('Kailash Hostel', 'hostel'),
  ('Nanda Devi Hostel', 'hostel'), ('New Boys Hostel', 'hostel'), ('Vindhyachal Hostel', 'hostel'),
  ('Gangotri Hostel', 'hostel'), ('Yamunotri Hostel', 'hostel');

create table complaints (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references spaces(id) on delete cascade,
  title text not null,
  description text not null,
  category text check (category in ('infrastructure', 'water', 'electricity', 'academic', 'mess', 'other')) not null,
  status text check (status in ('created', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed')) default 'created',
  priority text check (priority in ('P0', 'P1', 'P2')) default 'P2',
  upvotes integer default 0,
  is_anonymous boolean default false,
  student_name text,
  student_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table complaints enable row level security;
alter table spaces enable row level security;

create policy "Anyone can read complaints" on complaints for select using (true);
create policy "Anyone can read spaces" on spaces for select using (true);
create policy "Anyone can insert complaints" on complaints for insert with check (true);
create policy "Anyone can upvote" on complaints for update using (true);
```
