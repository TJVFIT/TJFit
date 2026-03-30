import { NextRequest, NextResponse } from "next/server";
import { Locale, locales } from "@/lib/i18n";
import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";
import { requireAuth } from "@/lib/require-auth";
import {
  buildProgramTranslations,
  extractPdfText,
  getPriceForKind,
  localizeCustomProgramRow,
  slugifyProgramTitle,
  type CustomProgramRow
} from "@/lib/custom-programs";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET_NAME = "program-assets";

function getRequestedLocale(request: NextRequest): Locale {
  const value = request.nextUrl.searchParams.get("locale") ?? "en";
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export async function GET(request: NextRequest) {
  const locale = getRequestedLocale(request);
  const mine = request.nextUrl.searchParams.get("mine") === "1";

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  if (mine) {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { data, error } = await adminClient
      .from("custom_programs")
      .select("*")
      .eq("uploaded_by", auth.user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as CustomProgramRow[];
    return NextResponse.json({
      programs: rows.map((row) => localizeCustomProgramRow(row, locale))
    });
  }

  const { data, error } = await adminClient
    .from("custom_programs")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as CustomProgramRow[];
  return NextResponse.json({
    programs: rows.map((row) => localizeCustomProgramRow(row, locale))
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "").trim().toLowerCase();
  const file = formData.get("pdf");
  const kind = kindRaw === "diet" ? "diet" : kindRaw === "program" ? "program" : null;

  if (!title || !kind || !(file instanceof File)) {
    return NextResponse.json({ error: "title, kind, and pdf are required." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  if (auth.role === "coach") {
    const { count, error: countError } = await auth.supabase
      .from("custom_programs")
      .select("id", { count: "exact", head: true })
      .eq("uploaded_by", auth.userId)
      .eq("active", true);
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Coach program limit reached (max 3 active programs). Delete one to upload a new one." },
        { status: 400 }
      );
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extractedText = await extractPdfText(buffer);
  const summary = extractedText.split("\n").filter(Boolean).slice(0, 4).join(" ").slice(0, 320);
  const description = summary || "Uploaded custom TJFit program.";

  const baseSlug = slugifyProgramTitle(title) || `program-${Date.now()}`;
  let slug = baseSlug;
  for (let i = 0; i < 10; i += 1) {
    const { data: existing } = await auth.supabase
      .from("custom_programs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // Ensure target bucket exists for program PDFs.
  await auth.supabase.storage.createBucket(BUCKET_NAME, {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"]
  });

  const filePath = `custom-programs/${auth.userId}/${slug}-${Date.now()}.pdf`;
  const { error: uploadError } = await auth.supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const translations = await buildProgramTranslations({
    title,
    description,
    pdfText: extractedText
  });

  const { data, error } = await auth.supabase
    .from("custom_programs")
    .insert({
      slug,
      title,
      description,
      kind,
      price_try: getPriceForKind(kind),
      difficulty: "Beginner to Advanced",
      duration: "12 weeks",
      uploaded_by: auth.userId,
      uploader_role: auth.role,
      pdf_path: filePath,
      pdf_size_bytes: file.size,
      source_pdf_text: extractedText.slice(0, 12000),
      localized_title: translations.title,
      localized_description: translations.description,
      localized_pdf_text: translations.pdfText,
      translation_status: "completed",
      active: true
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    program: localizeCustomProgramRow(data as CustomProgramRow, "en")
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const programId = String(body?.programId ?? "").trim();
  if (!programId) {
    return NextResponse.json({ error: "programId is required." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("custom_programs")
    .select("id,uploaded_by,pdf_path,active")
    .eq("id", programId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  if (auth.role !== "admin" && existing.uploaded_by !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updateError } = await auth.supabase
    .from("custom_programs")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", existing.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (existing.pdf_path) {
    await auth.supabase.storage.from(BUCKET_NAME).remove([existing.pdf_path]);
  }

  return NextResponse.json({ success: true });
}
