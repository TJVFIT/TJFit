import {
  Camera,
  ClipboardCheck,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Gem,
  Shield,
  Trophy,
  Utensils,
  Zap,
  type LucideIcon
} from "lucide-react";

import type { BadgeCode } from "@/lib/tjai/badges";

/**
 * Visual icon per badge. Kept out of badges.ts so the server-side award
 * logic stays free of client icon imports.
 */
export const BADGE_ICONS: Record<BadgeCode, LucideIcon> = {
  first_plan: Compass,
  first_workout: Flame,
  first_meal_log: Utensils,
  first_progress_photo: Camera,
  first_pr: Trophy,
  first_check_in: ClipboardCheck,
  streak_7: Zap,
  streak_30: Gem,
  streak_100: Crown,
  ten_workouts: Dumbbell,
  fifty_workouts: Shield
};

export function BadgeIcon({ code, className }: { code: string; className?: string }) {
  const Icon = (BADGE_ICONS as Record<string, LucideIcon>)[code] ?? Trophy;
  return <Icon className={className} aria-hidden />;
}

/** Streak tier icon used by the streak banner header. */
export function StreakIcon({ streak, className }: { streak: number; className?: string }) {
  const Icon = streak >= 30 ? Gem : streak >= 7 ? Zap : Flame;
  return <Icon className={className} aria-hidden />;
}
