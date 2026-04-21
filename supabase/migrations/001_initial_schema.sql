-- FreelanceOS — Migration initiale
-- Active l'extension UUID
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE: profiles
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  business_name text,
  legal_status text, -- ex: "Auto-entrepreneur", "SASU", "EURL"
  siret text,
  address text,
  city text,
  zip_code text,
  country text default 'France',
  phone text,
  iban text,
  logo_url text,
  vat_number text,
  default_payment_terms integer default 30, -- jours
  default_invoice_notes text,
  onboarding_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: clients
-- =============================================
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  city text,
  zip_code text,
  country text default 'France',
  siret text,
  vat_number text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'prospect')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: projects
-- =============================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  title text not null,
  description text,
  start_date date,
  end_date date,
  rate_type text not null default 'fixed' check (rate_type in ('fixed', 'daily', 'hourly')),
  rate_amount numeric(10,2) default 0,
  estimated_days integer,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'on_hold', 'cancelled')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: invoices
-- =============================================
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  project_id uuid references public.projects on delete set null,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date not null,
  subtotal numeric(10,2) default 0 not null,
  tax_rate numeric(5,2) default 20,
  tax_amount numeric(10,2) default 0 not null,
  total numeric(10,2) default 0 not null,
  notes text,
  payment_terms text,
  sent_at timestamptz,
  paid_at timestamptz,
  reminder_1_sent_at timestamptz,
  reminder_2_sent_at timestamptz,
  reminder_3_sent_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Numérotation automatique par user (YYYY-NNN)
create sequence if not exists invoice_number_seq start 1;

-- =============================================
-- TABLE: invoice_items (lignes de facturation)
-- =============================================
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  tax_rate numeric(5,2) default 20,
  total numeric(10,2) generated always as (quantity * unit_price) stored,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

-- =============================================
-- TABLE: email_templates
-- =============================================
create table public.email_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('invoice_send', 'reminder_1', 'reminder_2', 'reminder_3')),
  subject text not null,
  body text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, type)
);

-- =============================================
-- TABLE: activities (fil d'activité dashboard)
-- =============================================
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null, -- 'client_created', 'invoice_sent', 'payment_received', etc.
  entity_type text, -- 'client', 'invoice', 'project'
  entity_id uuid,
  entity_name text,
  metadata jsonb,
  created_at timestamptz default now() not null
);

-- =============================================
-- INDEX
-- =============================================
create index idx_clients_user_id on public.clients(user_id);
create index idx_clients_status on public.clients(status);
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_client_id on public.projects(client_id);
create index idx_projects_status on public.projects(status);
create index idx_invoices_user_id on public.invoices(user_id);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_invoices_status on public.invoices(status);
create index idx_invoices_due_date on public.invoices(due_date);
create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
create index idx_activities_user_id on public.activities(user_id);
create index idx_activities_created_at on public.activities(created_at desc);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.email_templates enable row level security;
alter table public.activities enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Clients
create policy "Users can manage own clients" on public.clients for all using (auth.uid() = user_id);

-- Projects
create policy "Users can manage own projects" on public.projects for all using (auth.uid() = user_id);

-- Invoices
create policy "Users can manage own invoices" on public.invoices for all using (auth.uid() = user_id);

-- Invoice items (via invoice ownership)
create policy "Users can manage own invoice items" on public.invoice_items
  for all using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Email templates
create policy "Users can manage own email templates" on public.email_templates for all using (auth.uid() = user_id);

-- Activities
create policy "Users can view own activities" on public.activities for select using (auth.uid() = user_id);
create policy "Users can insert own activities" on public.activities for insert with check (auth.uid() = user_id);

-- =============================================
-- TRIGGERS: updated_at auto
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger clients_updated_at before update on public.clients for each row execute procedure public.handle_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute procedure public.handle_updated_at();
create trigger invoices_updated_at before update on public.invoices for each row execute procedure public.handle_updated_at();
create trigger email_templates_updated_at before update on public.email_templates for each row execute procedure public.handle_updated_at();

-- =============================================
-- TRIGGER: create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- FUNCTION: generate invoice number
-- =============================================
create or replace function public.generate_invoice_number(p_user_id uuid)
returns text as $$
declare
  v_year text;
  v_count integer;
  v_number text;
begin
  v_year := to_char(current_date, 'YYYY');
  select count(*) + 1 into v_count
  from public.invoices
  where user_id = p_user_id
    and to_char(created_at, 'YYYY') = v_year;
  v_number := v_year || '-' || lpad(v_count::text, 3, '0');
  return v_number;
end;
$$ language plpgsql security definer;
