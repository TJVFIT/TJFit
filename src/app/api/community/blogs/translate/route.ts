import { NextRequest, NextResponse } from "next/server";
import { locales, type Locale } from "@/lib/i18n";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import {
  exceedsDeclaredBodySize,
  getClientAddress,
  isTrustedMutationRequest
} from "@/lib/request-security";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRANSLATION_TIMEOUT_MS = 8_000;
const MAX_PROVIDER_RESPONSE_BYTES = 512 * 1024;

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readJsonLimited(response: Response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_PROVIDER_RESPONSE_BYTES
  ) {
    throw new Error("Translation response exceeded the size limit.");
  }

  if (!response.body) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_PROVIDER_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Translation response exceeded the size limit.");
    }
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  return JSON.parse(buffer.toString("utf8")) as unknown;
}

function chunkText(input: string, chunkSize = 2500) {
  if (input.length <= chunkSize) return [input];
  const chunks: string[] = [];
  let index = 0;
  while (index < input.length) {
    chunks.push(input.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunks;
}

async function translateTextChunk(text: string, target: Locale) {
  if (!text.trim() || target === "en") return text;

  const customUrl = process.env.TRANSLATE_API_URL?.trim();
  const customKey = process.env.TRANSLATE_API_KEY?.trim();
  if (customUrl) {
    const parsedUrl = new URL(customUrl);
    const isLocalDev =
      process.env.NODE_ENV !== "production" &&
      (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1");
    if (
      parsedUrl.username ||
      parsedUrl.password ||
      (parsedUrl.protocol !== "https:" && !(isLocalDev && parsedUrl.protocol === "http:"))
    ) {
      throw new Error("Translation provider URL is not allowed.");
    }

    const res = await fetchWithTimeout(parsedUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(customKey ? { Authorization: `Bearer ${customKey}` } : {})
      },
      body: JSON.stringify({
        q: text,
        source: "en",
        target
      })
    });
    if (!res.ok) {
      throw new Error(`Custom translation provider failed (${res.status}).`);
    }
    const data = await readJsonLimited(res);
    if (!data || typeof data !== "object") return "";
    const record = data as Record<string, unknown>;
    return String(record.translatedText ?? record.translation ?? "");
  }

  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=" +
    encodeURIComponent(target) +
    "&q=" +
    encodeURIComponent(text);
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Fallback translation provider failed (${res.status}).`);
  }
  const data = await readJsonLimited(res);
  if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
  return (data[0] as unknown[])
    .map((item) => (Array.isArray(item) ? String(item[0] ?? "") : ""))
    .join("");
}

async function translateTextRobust(text: string, target: Locale) {
  if (target === "en") return text;
  const chunks = chunkText(text, 2000);
  const translated: string[] = [];
  for (const chunk of chunks) {
    let value = "";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        value = await translateTextChunk(chunk, target);
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
    translated.push(value || chunk);
  }
  return translated.join("");
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (exceedsDeclaredBodySize(request, 8 * 1024)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const limiter = await rateLimit({
    key: `community-translate:${getClientAddress(request)}`,
    limit: 30,
    windowMs: 10 * 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Translation limit reached. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limiter.resetAt - Date.now()) / 1000)) }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const blogId = String(body?.blogId ?? "").trim();
  const target = String(body?.targetLocale ?? "en").trim() as Locale;

  if (!uuidRegex.test(blogId) || !locales.includes(target)) {
    return NextResponse.json({ error: "blogId and valid targetLocale are required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("community_blog_posts")
    .select("id,title,content")
    .eq("id", blogId)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to load the community post." }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  if (target === "en") {
    return NextResponse.json(
      {
        translatedTitle: data.title,
        translatedContent: data.content
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }

  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      translateTextRobust(data.title, target),
      translateTextRobust(data.content, target)
    ]);
    return NextResponse.json(
      {
        translatedTitle,
        translatedContent
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Translation is temporarily unavailable." },
      { status: 503 }
    );
  }
}
