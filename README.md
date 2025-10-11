
# Absensi & Cuti - Full App (Static Frontend + Supabase)

This package is a static frontend implementation that integrates with Supabase (Auth, Postgres, Storage) and includes features:
- Register / Login (Supabase Auth)
- Role-based dashboard (employee / hrd / admin)
- Attendance (office/task) with GPS + selfie upload to Storage
- Tasks assignment by HRD/Admin (with target lat/lng + radius)
- Leaves (sick/annual/special) with document upload and approval flow
- Admin panel: assign tasks, approve leaves, map tracking, export CSV

## Quick setup

1. Create Supabase project (you already have one).
2. Create storage bucket named **photos** (public recommended for demo).
3. In Supabase SQL Editor, run `sql_setup.sql` included in this package.
4. Enable Row Level Security (RLS) for tables and add policies (examples below).
5. Upload these files to a GitHub repo and deploy to Vercel (or host as static site).

### RLS examples (very important)
Example policies for `attendance`:
```sql
alter table attendance enable row level security;

create policy "select own attendance" on attendance
  for select using (
    exists (select 1 from employees e where e.id = attendance.employee_id and e.email = auth.email())
  );

create policy "insert own attendance" on attendance
  for insert with check (
    exists (select 1 from employees e where e.id = new.employee_id and e.email = auth.email())
  );
```
Adjust similarly for `leaves` and `tasks`. For HRD/Admin create policies that allow role='hrd' or role='admin' to select/modify rows.

## Files in this package
- index.html: login/register
- dashboard.html: role-based dashboard
- tasks.html: attendance & tasks
- leave.html: leaves
- admin.html: HRD/Admin panel
- app.js, dashboard.js, tasks.js, leave.js, admin.js: JS logic
- sql_setup.sql: database schema
- README.md: this file

## Notes
- This project is static frontend — sensitive logic (like role assignment, heavy validation) should be implemented server-side for production.
- For production, use service_role only on server. Do not expose it in client.
