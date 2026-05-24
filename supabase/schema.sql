create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null default 'member',
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#3b82f6',
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  description text not null,
  amount numeric(12,2) not null,
  gross_amount numeric(12,2),
  net_amount numeric(12,2),
  hours numeric(6,2),
  hourly_rate numeric(10,2),
  period_from date,
  period_to date,
  note text,
  deduction_breakdown jsonb default '[]'::jsonb,
  date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value) values (
  'deduction_presets',
  '[
    {"id":"payoneer","label":"Payoneer Fee","rate":2.0,"category":"Payoneer Fee"},
    {"id":"single_tax","label":"Єдиний податок","rate":5.0,"category":"Taxes"},
    {"id":"military_levy","label":"Військовий збір","rate":1.5,"category":"Taxes"}
  ]'::jsonb
) on conflict (key) do nothing;

-- To create the first admin user, run this from your backend (replace values):
-- INSERT INTO users (email, password_hash, name, role)
-- VALUES ('admin@panverra.com', '<bcrypt_hash>', 'Admin', 'admin');
--
-- Generate hash with Node.js:
-- node -e "const b=require('bcrypt');b.hash('yourpassword',12).then(console.log)"
