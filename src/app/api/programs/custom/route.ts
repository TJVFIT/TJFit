import { NextRequest, NextResponse } from "next/server";

import {
  buildProgramTranslations,
  extractPdfText,
  getPriceForKind,
  slugifyProgramTitle,
  toPublicCustomProgramRow,
  type CustomProgramRow
} from "@/lib/custom-programs";
import { Locale, locales } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { readRequestJson } from "@/lib/read-request-json";
import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET_NAME = "program-assets";
const PDF_MAX_BYTES = 20 * 1024 * 1024; // 20MB — must match the bucket's fileSizeLimit.
const TITLE_MAX = 200;

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
      console.error("[programs/custom] mine list failed", error.message, error.code);
      return NextResponse.json({ error: "Failed to load programs" }, { status: 500 });
    }

    const rows = (data ?? []) as CustomProgramRow[];
    return NextResponse.json({
      programs: rows.map((row) => toPublicCustomProgramRow(row, locale))
    });
  }

  const { data, error } = await adminClient
    .from("custom_programs")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[programs/custom] public list failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load programs" }, { status: 500 });
  }

  const rows = (data ?? []) as CustomProgramRow[];
  return NextResponse.json({
    programs: rows.map((row) => toPublicCustomProgramRow(row, locale))
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  // PDF extraction + translation are heavy (LLM calls + storage IO). Cap at
  // 6/hour/uploader so an automated client can't burn LLM budget by spamming
  // bad uploads. Coaches are also bounded to 3 ACTIVE programs separately.
  const limiter = await rateLimit({
    key: `programs-custom-upload:${auth.userId}`,
    limit: 6,
    windowMs: 60 * 60 * 1000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many uploads. Try again in an hour." }, { status: 429 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim().slice(0, TITLE_MAX);
  const kindRaw = String(formData.get("kind") ?? "").trim().toLowerCase();
  const file = formData.get("pdf");
  const kind = kindRaw === "diet" ? "diet" : kindRaw === "program" ? "program" : null;

  if (!title || !kind || !(file instanceof File)) {
    return NextResponse.json({ error: "title, kind, and pdf are required." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }
  // Fail fast on oversized uploads before we read the whole file into memory.
  // The Supabase bucket enforces this too, but checking first avoids the
  // wasted buffer allocation + extractPdfText cost on garbage payloads.
  if (file.size > PDF_MAX_BYTES) {
    return NextResponse.json({ error: "PDF too large. Max 20MB." }, { status: 413 });
  }

  if (auth.role === "coach") {
    const { count, error: countError } = await auth.supabase
      .from("custom_programs")
      .select("id", { count: "exact", head: true })
      .eq("uploaded_by", auth.userId)
      .eq("active", true);
    if (countError) {
      console.error("[programs/custom] count failed", countError.message, countError.code);
      return NextResponse.json({ error: "Failed to verify upload limit" }, { status: 500 });
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
    console.error("[programs/custom] storage upload failed", uploadError.message);
    return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
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
    console.error("[programs/custom] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to save program" }, { status: 500 });
  }

  return NextResponse.json({
    program: toPublicCustomProgramRow(data as CustomProgramRow, "en")
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const programId = String(body.programId ?? "").trim();
  if (!programId) {
    return NextResponse.json({ error: "programId is required." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("custom_programs")
    .select("id,uploaded_by,pdf_path,active")
    .eq("id", programId)
    .maybeSingle();

  if (existingError) {
    console.error("[programs/custom] lookup failed", existingError.message, existingError.code);
    return NextResponse.json({ error: "Failed to look up program" }, { status: 500 });
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
    console.error("[programs/custom] deactivate failed", updateError.message, updateError.code);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }

  if (existing.pdf_path) {
    await auth.supabase.storage.from(BUCKET_NAME).remove([existing.pdf_path]);
  }

  return NextResponse.json({ success: true });
}
