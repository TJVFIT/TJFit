alter table if exists community_blog_posts
  add column if not exists status text not null default 'published' check (status in ('pending','published','rejected')),
  add column if not exists author_type text not null default 'user' check (author_type in ('user','coach','team','ai')),
  add column if not exists is_featured boolean not null default false,
  add column if not exists views integer not null default 0,
  add column if not exists read_time_minutes integer,
  add column if not exists tags text[] default '{}'::text[],
  add column if not exists category text,
  add column if not exists cover_image_url text,
  add column if not exists rejection_reason text;

alter table if exists profiles
  add column if not exists is_verified boolean not null default false;

