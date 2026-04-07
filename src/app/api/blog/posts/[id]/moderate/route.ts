import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { EmailTemplates } from "@/lib/email-templates";
import { signUnsubscribeToken } from "@/lib/email-preferences";
import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { awardTJCoin } from "@/lib/tjcoin-server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { action?: "approve" | "reject" | "feature"; reason?: string } | null;
  const action = body?.action;
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });
  const id = params.id;
  const { data: post } = await admin
    .from("community_blog_posts")
    .select("id,title,author_id")
    .eq("id", id)
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (action === "approve") {
    await admin.from("community_blog_posts").update({ status: "published" }).eq("id", id);
    await awardTJCoin(post.author_id, "blog_post_approved", 100, { metadata: { postId: id } });
    await enqueuePendingNotification(post.author_id, "achievement", "Your blog post is live! +100 TJCOIN");
    const user = await admin.auth.admin.getUserById(post.author_id);
    const email = user.data.user?.email;
    if (email) {
      const token = signUnsubscribeToken(post.author_id);
      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org"}/api/email/unsubscribe?token=${token}`;
      await sendEmail({
        to: email,
        subject: "Your blog post is live on TJFit! 📝",
        html: EmailTemplates.blogPublished(post.title, `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org"}/en/blog/${id}`, url)
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await admin.from("community_blog_posts").update({ status: "rejected", rejection_reason: String(body?.reason ?? "") }).eq("id", id);
    const user = await admin.auth.admin.getUserById(post.author_id);
    const email = user.data.user?.email;
    if (email) {
      const token = signUnsubscribeToken(post.author_id);
      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org"}/api/email/unsubscribe?token=${token}`;
      await sendEmail({
        to: email,
        subject: `Review needed: ${post.title}`,
        html: EmailTemplates.blogRejected(post.title, String(body?.reason ?? "Please revise and resubmit."), url)
      });
    }
    return NextResponse.json({ ok: true });
  }

  await admin.from("community_blog_posts").update({ is_featured: true }).eq("id", id);
  await awardTJCoin(post.author_id, "blog_post_featured", 250, { metadata: { postId: id } });
  return NextResponse.json({ ok: true });
}

