alter table community_blog_posts
  add column if not exists is_pinned boolean not null default false;

create index if not exists idx_community_blog_posts_pinned_created
  on community_blog_posts (is_pinned desc, created_at desc);
