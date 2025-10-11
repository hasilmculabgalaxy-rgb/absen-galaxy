
-- SQL setup (no PostGIS) - run in Supabase SQL Editor

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid,
  email text unique,
  name text,
  role text default 'employee',
  created_at timestamp with time zone default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  task_id uuid references tasks(id),
  type text check (type in ('office','task')) not null,
  photo_url text,
  location_lat double precision,
  location_lng double precision,
  created_at timestamp with time zone default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  title text,
  description text,
  target_lat double precision,
  target_lng double precision,
  radius int default 100,
  created_at timestamp with time zone default now()
);

create table if not exists leaves (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  type text,
  start_date date,
  end_date date,
  reason text,
  document_url text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists office (
  id integer primary key check (id=1),
  lat double precision,
  lng double precision,
  radius int
);
