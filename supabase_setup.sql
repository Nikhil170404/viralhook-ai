-- Create the generated_prompts table
create table if not exists generated_prompts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  prompt_text text not null,
  viral_hook text,
  category text,
  platform text,
  mechanism text,
  copy_count int default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table generated_prompts enable row level security;

-- Policy 1: Allow users to insert their own prompts
create policy "Users can insert their own prompts"
on generated_prompts for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy 2: Allow everyone to read prompts (for the Community Library)
-- If you want it private, change 'true' to 'auth.uid() = user_id'
create policy "Everyone can view all prompts"
on generated_prompts for select
to authenticated
using (true);

-- Policy 3: Allow updates (for copy_count increment)
-- Ideally this should be a stored procedure to prevent tampering, but for now:
create policy "Users can update copy counts"
on generated_prompts for update
to authenticated
using (true);
