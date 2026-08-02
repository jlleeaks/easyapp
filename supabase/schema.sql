-- Easy — MVP schema (onboarding + math Homework Helper)
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- One row per authenticated parent, keyed to auth.users.
create table if not exists public.parents (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

-- A parent may have multiple children profiles; MVP UI only surfaces one.
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents (id) on delete cascade,

  name text not null,
  interests text,
  hobbies text,
  favorite_characters text,

  frustration text,
  learning_style text,
  motivation text,
  shy text,

  letters_level text,
  numbers_level text,

  read_together text,
  favorite_books text,
  talks_after_story text,
  homework_time text,
  who_present text,

  enjoys_learning text,
  subject_likes text,
  subject_struggle text,
  go_to_analogy text,
  doesnt_work text,
  math_anxiety text,

  -- cumulative, plain-English "what we've learned about this child" (§6.1 macro-iteration)
  summary text not null default '',

  -- structured, subject-taggable insights: [{ subject, text, source, created_at }]
  -- fed by report-card/assignment intake and session check-ins, and read by every
  -- generation prompt (briefings, suggestions) so recommendations are actually grounded.
  strengths jsonb not null default '[]',
  growth_areas jsonb not null default '[]',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.children add column if not exists strengths jsonb not null default '[]';
alter table public.children add column if not exists growth_areas jsonb not null default '[]';

-- One row per completed homework/practice session.
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,

  subject text not null default 'math',
  source text not null check (source in ('homework', 'practice', 'library')),
  skill text not null,

  briefing jsonb not null,
  checkin jsonb,
  micro_message text,

  -- editable any time after the fact — "she struggled here", "excelled here" — separate
  -- from the one-time post-session check-in above.
  parent_notes text,

  created_at timestamptz not null default now()
);

alter table public.sessions add column if not exists parent_notes text;

-- Per-skill developmental status (never a numeric score — see product map §6.2).
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  subject text not null default 'math',
  skill_name text not null,
  stage text not null check (
    stage in ('not yet introduced', 'just starting', 'getting there', 'comfortable')
  ),
  updated_at timestamptz not null default now(),
  unique (child_id, subject, skill_name)
);

create index if not exists children_parent_id_idx on public.children (parent_id);
create index if not exists sessions_child_id_idx on public.sessions (child_id);
create index if not exists skills_child_id_idx on public.skills (child_id);

-- Auto-create a parents row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.parents (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep children.updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists children_set_updated_at on public.children;
create trigger children_set_updated_at
  before update on public.children
  for each row execute procedure public.set_updated_at();

-- Row Level Security: a parent can only ever see their own data.
alter table public.parents enable row level security;
alter table public.children enable row level security;
alter table public.sessions enable row level security;
alter table public.skills enable row level security;

drop policy if exists "parents select own" on public.parents;
create policy "parents select own" on public.parents
  for select using (auth.uid() = id);

drop policy if exists "parents update own" on public.parents;
create policy "parents update own" on public.parents
  for update using (auth.uid() = id);

drop policy if exists "children all own" on public.children;
create policy "children all own" on public.children
  for all using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

drop policy if exists "sessions all own" on public.sessions;
create policy "sessions all own" on public.sessions
  for all using (
    exists (
      select 1 from public.children c
      where c.id = sessions.child_id and c.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = sessions.child_id and c.parent_id = auth.uid()
    )
  );

drop policy if exists "skills all own" on public.skills;
create policy "skills all own" on public.skills
  for all using (
    exists (
      select 1 from public.children c
      where c.id = skills.child_id and c.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = skills.child_id and c.parent_id = auth.uid()
    )
  );

-- Ask Easy: parent-facing chat, grounded in the child's profile. Never seen by the child.
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  action jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_child_id_idx on public.chat_messages (child_id);

alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages all own" on public.chat_messages;
create policy "chat_messages all own" on public.chat_messages
  for all using (
    exists (
      select 1 from public.children c
      where c.id = chat_messages.child_id and c.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = chat_messages.child_id and c.parent_id = auth.uid()
    )
  );

-- Library: books the family already has on their shelf, plus Easy's guide for each.
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,

  title text not null,
  author text,

  -- filled in by Easy after the parent adds the book
  what_it_teaches text,
  discussion_questions jsonb,
  read_aloud_tip text,
  estimated_minutes text,

  created_at timestamptz not null default now()
);

create index if not exists books_child_id_idx on public.books (child_id);

alter table public.books enable row level security;

drop policy if exists "books all own" on public.books;
create policy "books all own" on public.books
  for all using (
    exists (
      select 1 from public.children c
      where c.id = books.child_id and c.parent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = books.child_id and c.parent_id = auth.uid()
    )
  );

-- Library check-ins now write a session row too (source: 'library') so bedtime
-- reading feeds the same streak/progress/summary flywheel as homework and practice.
alter table public.sessions drop constraint if exists sessions_source_check;
alter table public.sessions add constraint sessions_source_check
  check (source in ('homework', 'practice', 'library'));

-- Links a library-checkin session back to the specific book, so past insights
-- ("what you noticed last time") can be reliably shown when a book is reopened.
alter table public.sessions add column if not exists book_id uuid references public.books (id) on delete set null;
create index if not exists sessions_book_id_idx on public.sessions (book_id);
