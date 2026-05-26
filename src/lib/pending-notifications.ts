import { getSupabaseServerClient } from "@/lib/supabase-server";

export type PendingNotificationType = "success" | "achievement" | "streak";

export async function enqueuePendingNotification(userId: string, type: PendingNotificationType, message: string) {
  if (!userId || !message.trim()) return;
  const admin = getSupabaseServerClient();
  if (!admin) return;
  await admin.from("pending_notifications").insert({
    user_id: userId,
    type,
    message: message.trim()
  });
}
