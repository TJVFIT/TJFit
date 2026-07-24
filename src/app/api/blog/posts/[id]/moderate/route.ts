import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { EmailTemplates } from "@/lib/email-templates";
import { signUnsubscribeToken } from "@/lib/email-preferences";
import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { requireAdmin } from "@/lib/require-admin";
import { awardTJCoin } from "@/lib/tjcoin-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Switched from inline `profiles.role === 'admin'` check to the
  // requireAdmin helper, which also honors ADMIN_EMAILS env. Other admin
  // routes use this for defense-in-depth.
  const adminResult = await requireAdmin();
  if (!adminResult.ok) return adminResult.response;
  const admin = adminResult.supabase;

  const body = (await request.json().catch(() => null)) as { action?: "approve" | "reject" | "feature"; reason?: string } | null;
  const action = body?.action;
  // Strict allowlist — previously any string other than "approve"/"reject"
  // fell through to the unconditional "feature" branch at the bottom, so
  // `action: "delete"` would silently feature the post and award 250 TJCOIN.
  if (action !== "approve" && action !== "reject" && action !== "feature") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const { id } = await params;
  const { data: post } = await admin
    .from("community_blog_posts")
    .select("id,title,author_id,status,is_featured")
    .eq("id", id)
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (action === "approve") {
    // Idempotency: re-running approve on an already-published post would
    // award TJCOIN again with no DB-level guard. Short-circuit if already
    // published — admins re-clicking the button shouldn't multiply rewards.
    if (post.status === "published") {
      return NextResponse.json({ ok: true, alreadyApproved: true });
    }
    await admin.from("community_blog_posts").update({ status: "published" }).eq("id", id);
    await awardTJCoin(post.author_id, "blog_post_approved", 100, { metadata: { postId: id } });
    await enqueuePendingNotification(post.author_id, "achievement", "Your blog post is live!");
    const user = await admin.auth.admin.getUserById(post.author_id);
    const email = user.data.user?.email;
    if (email) {
      const token = signUnsubscribeToken(post.author_id);
      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org"}/api/email/unsubscribe?token=${token}`;
      await sendEmail({
        to: email,
        subject: "Your blog post is live on TJFit!",
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

  // action === "feature"
  if (post.is_featured) {
    return NextResponse.json({ ok: true, alreadyFeatured: true });
  }
  await admin.from("community_blog_posts").update({ is_featured: true }).eq("id", id);
  await awardTJCoin(post.author_id, "blog_post_featured", 250, { metadata: { postId: id } });
  return NextResponse.json({ ok: true });
}

