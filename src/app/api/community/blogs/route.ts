import { NextRequest, NextResponse } from "next/server";
import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import {
  exceedsDeclaredBodySize,
  isTrustedMutationRequest
} from "@/lib/request-security";

const BLOG_BUCKET = "community-blog-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_FORM_BYTES = MAX_IMAGE_BYTES + 512 * 1024;
const MAX_TITLE_LENGTH = 160;
const MAX_CONTENT_LENGTH = 20_000;
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function detectImageType(buffer: Buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { mime: "image/jpeg", extension: "jpg" };
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return { mime: "image/png", extension: "png" };
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", extension: "webp" };
  }

  const gifHeader = buffer.subarray(0, 6).toString("ascii");
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return { mime: "image/gif", extension: "gif" };
  }

  return null;
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Community blog service is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("community_blog_posts")
    .select("id,author_name,author_role,title,content,image_path,is_pinned,created_at")
    .eq("published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Unable to load community posts." }, { status: 503 });
  }

  const posts = (data ?? []).map((row) => {
    const { image_path: imagePath, ...publicRow } = row;
    const imageUrl = imagePath
      ? supabase.storage.from(BLOG_BUCKET).getPublicUrl(imagePath).data.publicUrl
      : null;
    return {
      ...publicRow,
      image_url: imageUrl
    };
  });

  return NextResponse.json(
    { posts },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (exceedsDeclaredBodySize(request, MAX_FORM_BYTES)) {
    return NextResponse.json({ error: "Upload is too large." }, { status: 413 });
  }

  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const limiter = rateLimit({
    key: `community-publish:${auth.userId}`,
    limit: 10,
    windowMs: 60 * 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Publishing limit reached. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limiter.resetAt - Date.now()) / 1000)) }
      }
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const image = formData.get("image");

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH || content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Title or content is too long." }, { status: 400 });
  }

  let imagePath: string | null = null;

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 413 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const detected = detectImageType(imageBuffer);
    if (!detected || (image.type && image.type !== detected.mime)) {
      return NextResponse.json(
        { error: "Image must be a valid JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    imagePath = `blogs/${auth.userId}/${crypto.randomUUID()}.${detected.extension}`;
    const { error: uploadError } = await auth.supabase.storage
      .from(BLOG_BUCKET)
      .upload(imagePath, imageBuffer, {
        contentType: detected.mime,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: "Image upload failed." }, { status: 503 });
    }
  }

  const authorName =
    auth.userEmail
      ?.split("@")[0]
      ?.replace(/[^a-zA-Z0-9_.-]/g, "")
      .slice(0, 80) || "Coach";
  const { data, error } = await auth.supabase
    .from("community_blog_posts")
    .insert({
      author_id: auth.userId,
      author_name: authorName,
      author_role: auth.role,
      title,
      content,
      image_path: imagePath
    })
    .select("id,author_id,author_name,author_role,title,content,image_path,is_pinned,created_at")
    .single();

  if (error) {
    if (imagePath) {
      await auth.supabase.storage.from(BLOG_BUCKET).remove([imagePath]);
    }
    return NextResponse.json({ error: "Unable to publish the community post." }, { status: 503 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const limiter = rateLimit({
    key: `community-delete:${auth.userId}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const blogId = String(body?.blogId ?? "").trim();
  if (!uuidRegex.test(blogId)) {
    return NextResponse.json({ error: "A valid blogId is required." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("community_blog_posts")
    .select("id,author_id,image_path")
    .eq("id", blogId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Unable to load the community post." }, { status: 503 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  const canDelete = auth.role === "admin" || existing.author_id === auth.userId;
  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: deleteError } = await auth.supabase
    .from("community_blog_posts")
    .delete()
    .eq("id", blogId);

  if (deleteError) {
    return NextResponse.json({ error: "Unable to delete the community post." }, { status: 503 });
  }

  if (existing.image_path) {
    await auth.supabase.storage.from(BLOG_BUCKET).remove([existing.image_path]);
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Only admins can pin blogs." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const blogId = String(body?.blogId ?? "").trim();
  const action = String(body?.action ?? "").trim().toLowerCase();
  if (!uuidRegex.test(blogId) || (action !== "pin" && action !== "unpin")) {
    return NextResponse.json({ error: "blogId and valid action are required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("community_blog_posts")
    .update({ is_pinned: action === "pin" })
    .eq("id", blogId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to update the community post." }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
