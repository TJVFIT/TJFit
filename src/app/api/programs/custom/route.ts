import { NextRequest, NextResponse } from "next/server";
import { Locale, locales } from "@/lib/i18n";
import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";
import { requireAuth } from "@/lib/require-auth";
import {
  buildProgramTranslations,
  extractPdfText,
  getPriceForKind,
  slugifyProgramTitle,
  toPublicCustomProgramRow,
  type CustomProgramRow
} from "@/lib/custom-programs";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import {
  exceedsDeclaredBodySize,
  isTrustedMutationRequest
} from "@/lib/request-security";

const BUCKET_NAME = "program-assets";
const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_FORM_BYTES = MAX_PDF_BYTES + 512 * 1024;
const MAX_TITLE_LENGTH = 140;
const PUBLIC_PROGRAM_COLUMNS =
  "id,slug,title,description,kind,price_try,difficulty,duration,uploader_role,localized_title,localized_description,translation_status,created_at";
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getRequestedLocale(request: NextRequest): Locale {
  const value = request.nextUrl.searchParams.get("locale") ?? "en";
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export async function GET(request: NextRequest) {
  const locale = getRequestedLocale(request);
  const mine = request.nextUrl.searchParams.get("mine") === "1";

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  if (mine) {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { data, error } = await adminClient
      .from("custom_programs")
      .select(PUBLIC_PROGRAM_COLUMNS)
      .eq("uploaded_by", auth.user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Unable to load custom programs." }, { status: 503 });
    }

    const rows = (data ?? []) as CustomProgramRow[];
    return NextResponse.json(
      {
        programs: rows.map((row) => toPublicCustomProgramRow(row, locale))
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data, error } = await adminClient
    .from("custom_programs")
    .select(PUBLIC_PROGRAM_COLUMNS)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load custom programs." }, { status: 503 });
  }

  const rows = (data ?? []) as CustomProgramRow[];
  return NextResponse.json(
    {
      programs: rows.map((row) => toPublicCustomProgramRow(row, locale))
    },
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
    key: `program-upload:${auth.userId}`,
    limit: 5,
    windowMs: 60 * 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Upload limit reached. Please try again later." },
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
  const kindRaw = String(formData.get("kind") ?? "").trim().toLowerCase();
  const file = formData.get("pdf");
  const kind = kindRaw === "diet" ? "diet" : kindRaw === "program" ? "program" : null;

  if (!title || !kind || !(file instanceof File)) {
    return NextResponse.json({ error: "title, kind, and pdf are required." }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title is too long." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "PDF must be 20 MB or smaller." }, { status: 413 });
  }

  if (auth.role === "coach") {
    const { count, error: countError } = await auth.supabase
      .from("custom_programs")
      .select("id", { count: "exact", head: true })
      .eq("uploaded_by", auth.userId)
      .eq("active", true);
    if (countError) {
      return NextResponse.json({ error: "Unable to check the coach program limit." }, { status: 503 });
    }
    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Coach program limit reached (max 3 active programs). Delete one to upload a new one." },
        { status: 400 }
      );
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return NextResponse.json({ error: "The uploaded file is not a valid PDF." }, { status: 400 });
  }

  const extractedText = await extractPdfText(buffer);
  const summary = extractedText.split("\n").filter(Boolean).slice(0, 4).join(" ").slice(0, 320);
  const description = summary || "Uploaded custom TJFit program.";

  const baseSlug = slugifyProgramTitle(title) || `program-${Date.now()}`;
  let slug = baseSlug;
  let slugAvailable = false;
  for (let i = 0; i < 10; i += 1) {
    const { data: existing, error: slugError } = await auth.supabase
      .from("custom_programs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (slugError) {
      return NextResponse.json({ error: "Unable to prepare the custom program." }, { status: 503 });
    }
    if (!existing) {
      slugAvailable = true;
      break;
    }
    slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  }
  if (!slugAvailable) {
    return NextResponse.json({ error: "Unable to create a unique program slug." }, { status: 409 });
  }

  const filePath = `custom-programs/${auth.userId}/${slug}-${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await auth.supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "PDF upload failed." }, { status: 503 });
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
    await auth.supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error.code === "23514") {
      return NextResponse.json(
        { error: "Coach program limit reached (max 3 active programs)." },
        { status: 409 }
      );
    }
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A program with this title already exists. Please retry." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Unable to save the custom program." }, { status: 503 });
  }

  return NextResponse.json({
    program: toPublicCustomProgramRow(data as CustomProgramRow, "en")
  });
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const programId = String(body?.programId ?? "").trim();
  if (!uuidRegex.test(programId)) {
    return NextResponse.json({ error: "A valid programId is required." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("custom_programs")
    .select("id,uploaded_by,pdf_path,active")
    .eq("id", programId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Unable to load the custom program." }, { status: 503 });
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
    return NextResponse.json({ error: "Unable to remove the custom program." }, { status: 503 });
  }

  if (existing.pdf_path) {
    await auth.supabase.storage.from(BUCKET_NAME).remove([existing.pdf_path]);
  }

  return NextResponse.json({ success: true });
}
