import Image from "next/image";
import { notFound } from "next/navigation";

import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type TransformationRow = {
  id: string;
  before_image_url: string;
  after_image_url: string;
  program_slug: string | null;
  duration_label: string | null;
  weight_change: string | null;
  story: string | null;
  likes_count: number;
  status: string;
  created_at: string;
};

async function fetchTransformation(id: string): Promise<TransformationRow | null> {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return null;
  }

  const { data } = await supabase
    .from("user_transformations")
    .select(
      "id,before_image_url,after_image_url,program_slug,duration_label,weight_change,story,likes_count,status,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  return (data as TransformationRow | null) ?? null;
}

export default async function TransformationDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  requireLocaleParam(params.locale);
  const id = params.slug ?? "";

  const transformation = await fetchTransformation(id);

  // Public per RLS (transformations_read_approved: status = 'approved' or
  // own row) — the detail page itself only ever shows approved rows, even to
  // the owner previewing their own pending submission, so nothing not yet
  // moderated is publicly linkable.
  if (!transformation || transformation.status !== "approved") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[36px] p-8">
        <span className="badge">Transformation Story</span>
        {transformation.duration_label || transformation.weight_change ? (
          <h1 className="mt-6 text-4xl font-semibold text-white">
            <span className="tj-title-shimmer">
              {[transformation.duration_label, transformation.weight_change].filter(Boolean).join(" • ")}
            </span>
          </h1>
        ) : null}
        {transformation.story ? (
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{transformation.story}</p>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
            <Image
              src={transformation.before_image_url}
              alt="Before"
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
            <Image
              src={transformation.after_image_url}
              alt="After"
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <p className="mt-8 text-sm text-bright">Community likes: {transformation.likes_count}</p>
      </div>
    </div>
  );
}
