-- Launch polish: performance indexes for common filters.

create index if not exists idx_user_follows_follower_id on user_follows(follower_id);
create index if not exists idx_user_follows_following_id on user_follows(following_id);

-- Community posts timeline (table may not exist in all environments).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'community_posts'
  ) then
    create index if not exists idx_community_posts_created_at_desc on community_posts(created_at desc);
  end if;
end $$;

-- Blog post listing and category filters.
create index if not exists idx_community_blog_posts_status_created_at_desc
  on community_blog_posts(status, created_at desc);
create index if not exists idx_community_blog_posts_category_created_at_desc
  on community_blog_posts(category, created_at desc);

-- Program reviews lookup by program.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'program_reviews' and column_name = 'program_id'
  ) then
    create index if not exists idx_program_reviews_program_id on program_reviews(program_id);
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'program_reviews' and column_name = 'program_slug'
  ) then
    create index if not exists idx_program_reviews_program_slug on program_reviews(program_slug);
  end if;
end $$;

create index if not exists idx_workout_logs_user_exercise on workout_logs(user_id, exercise_name);
