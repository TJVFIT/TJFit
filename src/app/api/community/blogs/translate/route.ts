import { NextRequest, NextResponse } from "next/server";
import { locales, type Locale } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { readRequestJson } from "@/lib/read-request-json";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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
    const res = await fetch(customUrl, {
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
    const data = await res.json();
    return String(data.translatedText ?? data.translation ?? "");
  }

  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=" +
    encodeURIComponent(target) +
    "&q=" +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fallback translation provider failed (${res.status}).`);
  }
  const data = (await res.json()) as unknown;
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
  const limiter = rateLimit({
    key:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.ip ??
      "unknown",
    limit: 20,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const blogId = String(body.blogId ?? "").trim();
  const target = String(body.targetLocale ?? "en").trim() as Locale;

  if (!blogId || !locales.includes(target)) {
    return NextResponse.json({ error: "blogId and valid targetLocale are required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("community_blog_posts")
    .select("id,title,content")
    .eq("id", blogId)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  if (target === "en") {
    return NextResponse.json({
      translatedTitle: data.title,
      translatedContent: data.content
    });
  }

  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      translateTextRobust(data.title, target),
      translateTextRobust(data.content, target)
    ]);
    return NextResponse.json({
      translatedTitle,
      translatedContent
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Translation failed." },
      { status: 500 }
    );
  }
}
