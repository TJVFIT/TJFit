create table if not exists community_blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('coach', 'admin')),
  title text not null,
  content text not null,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published boolean not null default true
);

create index if not exists idx_community_blog_posts_created
  on community_blog_posts (created_at desc);

alter table community_blog_posts enable row level security;

drop policy if exists "Public can read published community blog posts" on community_blog_posts;
create policy "Public can read published community blog posts"
  on community_blog_posts for select
  using (published = true);
