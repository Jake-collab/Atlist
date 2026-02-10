-- Support ticket schema (migration-safe)
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  category text,
  from_user_id uuid references auth.users(id) on delete set null,
  email text,
  subject text,
  status text,
  created_at timestamptz default now()
);

-- Upgrade columns / defaults safely
alter table public.support_tickets
  alter column created_at set default now();
alter table public.support_tickets
  alter column status set default 'open';
alter table public.support_tickets
  alter column category set not null;
alter table public.support_tickets
  alter column status set not null;
alter table public.support_tickets
  add constraint support_tickets_category_check check (category in ('support','bug','feature'));
alter table public.support_tickets
  add column if not exists from_user_id uuid references auth.users(id) on delete set null;
alter table public.support_tickets
  add column if not exists email text;
alter table public.support_tickets
  add column if not exists subject text;

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  sender_type text,
  sender_user_id uuid references auth.users(id) on delete set null,
  body text,
  created_at timestamptz default now()
);

alter table public.support_messages
  alter column created_at set default now();
alter table public.support_messages
  alter column sender_type set not null;
alter table public.support_messages
  alter column body set not null;
alter table public.support_messages
  add constraint support_messages_sender_type_check check (sender_type in ('user','admin'));

-- Basic indexes
create index if not exists support_tickets_category_idx on public.support_tickets(category);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id);

-- RLS
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

-- Users can see their own tickets/messages
drop policy if exists "tickets_select_own" on public.support_tickets;
create policy "tickets_select_own" on public.support_tickets
  for select using (from_user_id = auth.uid());

drop policy if exists "tickets_insert_own" on public.support_tickets;
create policy "tickets_insert_own" on public.support_tickets
  for insert with check (from_user_id = auth.uid());

drop policy if exists "messages_select_ticket_own" on public.support_messages;
create policy "messages_select_ticket_own" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = support_messages.ticket_id and t.from_user_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_ticket_own" on public.support_messages;
create policy "messages_insert_ticket_own" on public.support_messages
  for insert with check (
    sender_user_id = auth.uid()
    and exists (
      select 1 from public.support_tickets t
      where t.id = support_messages.ticket_id and t.from_user_id = auth.uid()
    )
  );

-- Admin policies (role=admin in profiles)
drop policy if exists "tickets_select_admin" on public.support_tickets;
create policy "tickets_select_admin" on public.support_tickets
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "messages_select_admin" on public.support_messages;
create policy "messages_select_admin" on public.support_messages
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "messages_insert_admin" on public.support_messages;
create policy "messages_insert_admin" on public.support_messages
  for insert with check (
    sender_type = 'admin'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
