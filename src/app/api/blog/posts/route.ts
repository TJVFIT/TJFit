import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { sendEmail } from "@/lib/email";
import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BLOG_BUCKET = "community-blog-images";

const TITLE_MAX = 200;
const CONTENT_MAX = 50_000;
const CATEGORY_MAX = 60;
const TAG_MAX = 40;
const MAX_TAGS = 10;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: NextRequest) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const sp = new URL(request.url).searchParams;
  const category = sp.get("category");
  const statusFilter = sp.get("status");
  let status = "published";
  if (statusFilter === "pending" || statusFilter === "rejected" || statusFilter === "published") {
    status = statusFilter;
  }
  if (status !== "published") {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;
    const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let query = admin
    .from("community_blog_posts")
    .select("id,title,content,author_id,author_name,author_role,created_at,cover_image_url,category,read_time_minutes,views,is_featured,status")
    .eq("status", status)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (category && category !== "all") query = query.eq("category", category);
  const { data } = await query;
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Anti-spam: cap blog submissions per user. Each post writes to DB +
  // potentially uploads an image + sends an email — a malicious account
  // could spam this. 5/hour is generous for legitimate authors.
  const limiter = await rateLimit({
    key: `blog-post:${auth.user.id}`,
    limit: 5,
    windowMs: 60 * 60 * 1000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many posts. Try again in an hour." }, { status: 429 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: profile } = await admin
    .from("profiles")
    .select("id,role,is_verified,created_at,full_name,username")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const daysActive = Math.floor((Date.now() - new Date(String(profile.created_at ?? new Date().toISOString())).getTime()) / (24 * 60 * 60 * 1000));
  const { count: paidCount } = await admin
    .from("program_orders")
    .select("*", { head: true, count: "exact" })
    .eq("user_id", auth.user.id)
    .eq("status", "paid");
  const qualifies = (paidCount ?? 0) > 0 && daysActive >= 30;
  if (!profile.is_verified && qualifies) {
    await admin.from("profiles").update({ is_verified: true }).eq("id", auth.user.id);
  }
  const isCoachOrAdmin = profile.role === "coach" || profile.role === "admin";
  const isVerified = Boolean(profile.is_verified || qualifies);
  if (!isCoachOrAdmin && !isVerified) {
    return NextResponse.json({ error: "Verification required", progress: { paidPrograms: paidCount ?? 0, daysActive } }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim().slice(0, TITLE_MAX);
  const content = String(formData.get("content") ?? "").trim().slice(0, CONTENT_MAX);
  const category = String(formData.get("category") ?? "Training").trim().slice(0, CATEGORY_MAX);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((v) => v.trim().slice(0, TAG_MAX))
    .filter(Boolean)
    .slice(0, MAX_TAGS);
  const readTime = Math.max(1, Math.round(content.split(/\s+/).length / 200));
  const draftId = String(formData.get("draft_id") ?? "").trim();
  if (!title || !content) return NextResponse.json({ error: "Title and content required." }, { status: 400 });

  let coverImageUrl: string | null = null;
  let uploadedPath: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const extension = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension) ? extension : "jpg";
    const path = `blog-covers/${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    await admin.storage.createBucket(BLOG_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
    });
    const buffer = Buffer.from(await image.arrayBuffer());
    const upload = await admin.storage.from(BLOG_BUCKET).upload(path, buffer, { upsert: false, contentType: image.type || "image/jpeg" });
    if (!upload.error) {
      coverImageUrl = admin.storage.from(BLOG_BUCKET).getPublicUrl(path).data.publicUrl;
      uploadedPath = path;
    }
  }

  const authorName = String(profile.full_name || profile.username || auth.user.email || "TJFit User");
  const authorType = profile.role === "admin" ? "team" : profile.role === "coach" ? "coach" : "user";
  let data: { id: string; title: string; status: string } | null = null;
  let error: { message?: string } | null = null;

  if (draftId && profile.role === "admin") {
    const updateResult = await admin
      .from("community_blog_posts")
      .update({
        title,
        content,
        category,
        tags,
        status: "published",
        author_type: "admin",
        author_role: "admin",
        read_time_minutes: readTime,
        cover_image_url: coverImageUrl
      })
      .eq("id", draftId)
      .select("id,title,status")
      .single();
    data = updateResult.data as { id: string; title: string; status: string } | null;
    error = updateResult.error as { message?: string } | null;
  } else {
    const insertResult = await admin
      .from("community_blog_posts")
      .insert({
        author_id: auth.user.id,
        author_name: authorName,
        author_role: profile.role === "admin" ? "admin" : "coach",
        author_type: authorType,
        title,
        content,
        category,
        tags,
        status: profile.role === "admin" ? "published" : "pending",
        read_time_minutes: readTime,
        cover_image_url: coverImageUrl
      })
      .select("id,title,status")
      .single();
    data = insertResult.data as { id: string; title: string; status: string } | null;
    error = insertResult.error as { message?: string } | null;
  }

  if (error) {
    // Clean up the orphaned upload — keeping a cover image around for a post
    // that never landed wastes storage and could later be referenced by a
    // crafted insert. Best-effort delete.
    if (uploadedPath) {
      void admin.storage.from(BLOG_BUCKET).remove([uploadedPath]);
    }
    return NextResponse.json({ error: "Failed to submit post." }, { status: 500 });
  }

  if (data?.status === "published") {
    await enqueuePendingNotification(auth.user.id, "achievement", "Post published successfully");
  } else {
    await enqueuePendingNotification(auth.user.id, "success", "Post submitted — admin will review soon");
  }

  const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
  if (adminEmail && data?.status !== "published") {
    // Escape user-supplied title before interpolating into the HTML body.
    // Email clients differ; some render arbitrary HTML and this is admin-
    // facing, so a crafted title could attempt phishing or tracking pixels.
    await sendEmail({
      to: adminEmail,
      subject: "New blog post pending review",
      html: `<p>New post submitted: <strong>${escapeHtml(title)}</strong></p>`
    });
  }

  return NextResponse.json({ post: data, ok: true });
}

