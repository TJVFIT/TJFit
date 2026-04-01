import { NextRequest, NextResponse } from "next/server";
import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BLOG_BUCKET = "community-blog-images";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Community blog service is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("community_blog_posts")
    .select("id,author_id,author_name,author_role,title,content,image_path,is_pinned,created_at")
    .eq("published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = (data ?? []).map((row) => {
    const imageUrl = row.image_path
      ? supabase.storage.from(BLOG_BUCKET).getPublicUrl(row.image_path).data.publicUrl
      : null;
    return {
      ...row,
      image_url: imageUrl
    };
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  let clientSupabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    clientSupabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  }

  const {
    data: { user }
  } = await clientSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const image = formData.get("image");

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  let imagePath: string | null = null;

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    await auth.supabase.storage.createBucket(BLOG_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
    });

    const extension = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension) ? extension : "jpg";
    imagePath = `blogs/${auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const { error: uploadError } = await auth.supabase.storage
      .from(BLOG_BUCKET)
      .upload(imagePath, imageBuffer, {
        contentType: image.type || "image/jpeg",
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const authorName = user.email?.split("@")[0] ?? "Coach";
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const blogId = String(body.blogId ?? "").trim();
  if (!blogId) {
    return NextResponse.json({ error: "blogId is required." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("community_blog_posts")
    .select("id,author_id,image_path")
    .eq("id", blogId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
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
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (existing.image_path) {
    await auth.supabase.storage.from(BLOG_BUCKET).remove([existing.image_path]);
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Only admins can pin blogs." }, { status: 403 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const blogId = String(body.blogId ?? "").trim();
  const action = String(body.action ?? "").trim().toLowerCase();
  if (!blogId || (action !== "pin" && action !== "unpin")) {
    return NextResponse.json({ error: "blogId and valid action are required." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("community_blog_posts")
    .update({ is_pinned: action === "pin" })
    .eq("id", blogId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
