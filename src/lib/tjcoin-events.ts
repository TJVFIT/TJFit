export const TJCOIN_REWARDS = {
  program_purchase: 50,
  diet_purchase: 50,
  bundle_purchase: 120,
  program_completed: 200,
  week_completed: 25,
  daily_streak_maintained: 5,
  streak_7_day: 50,
  streak_30_day: 200,
  streak_100_day: 500,
  community_post: 3,
  community_post_liked: 1,
  community_reaction_given: 0,
  blog_post_approved: 100,
  blog_post_featured: 250,
  blog_post_100_views: 25,
  blog_post_500_views: 75,
  blog_post_1000_views: 150,
  referral_signup: 30,
  referral_purchase: 75,
  workout_logged: 5,
  pro_subscription_month: 30,
  apex_subscription_month: 75
} as const;

export type TJCoinRewardReason = keyof typeof TJCOIN_REWARDS;

export const TJCOIN_REASON_LABELS: Record<TJCoinRewardReason | "discount_code_redeem", string> = {
  program_purchase: "Program purchase",
  diet_purchase: "Diet purchase",
  bundle_purchase: "Bundle purchase",
  program_completed: "Program completed",
  week_completed: "Week completed",
  daily_streak_maintained: "Daily streak maintained",
  streak_7_day: "7-day streak bonus",
  streak_30_day: "30-day streak bonus",
  streak_100_day: "100-day streak bonus",
  community_post: "Community post",
  community_post_liked: "Community post liked",
  community_reaction_given: "Community reaction",
  blog_post_approved: "Blog post approved",
  blog_post_featured: "Blog post featured",
  blog_post_100_views: "Blog 100 views milestone",
  blog_post_500_views: "Blog 500 views milestone",
  blog_post_1000_views: "Blog 1000 views milestone",
  referral_signup: "Referral signup",
  referral_purchase: "Referral purchase",
  workout_logged: "Workout logged",
  pro_subscription_month: "Pro monthly bonus",
  apex_subscription_month: "Apex monthly bonus",
  discount_code_redeem: "Discount code redeemed"
};

