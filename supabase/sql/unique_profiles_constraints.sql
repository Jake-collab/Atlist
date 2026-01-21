-- Run once in Supabase SQL editor to enforce uniqueness on profiles.
alter table public.profiles
  add constraint if not exists profiles_email_unique unique (email);

alter table public.profiles
  add constraint if not exists profiles_username_unique unique (username);
