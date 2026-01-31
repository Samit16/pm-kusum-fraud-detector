# Supabase Database Setup

To ensure user data is stored correctly when they log in, you need to create a `profiles` table in your Supabase database.

Please run the following SQL script in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```sql
-- 1. Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text,
  full_name text,
  avatar_url text,
  last_sign_in_at timestamp with time zone,
  
  -- details from the application analysis (optional, if you want to link specific uploads to users later)
  role text default 'user'
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- 4. Create a trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, last_sign_in_at)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email,
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists to avoid errors on multiple runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### What this does:
1.  Creates a **public.profiles** table that is linked to the secure `auth.users` table.
2.  Sets up **Triggers** so that whenever a new user signs up (Google or Email), their details are automatically copied to `profiles`.
3.  Sets up **RLS Policies** to protect the data.
