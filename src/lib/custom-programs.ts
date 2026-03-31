import { Locale } from "@/lib/i18n";

export type CustomProgramRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: "diet" | "program";
  price_try: number;
  difficulty: string;
  duration: string;
  uploaded_by: string;
  uploader_role: "coach" | "admin";
  pdf_path: string;
  pdf_size_bytes: number;
  source_pdf_text: string;
  localized_title: Record<string, string>;
  localized_description: Record<string, string>;
  localized_pdf_text: Record<string, string>;
  translation_status: "pending" | "completed" | "failed";
  active: boolean;
  created_at: string;
};

const targetLocales: Locale[] = ["en", "tr", "ar", "es", "fr"];

export function slugifyProgramTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function getPriceForKind(kind: "diet" | "program") {
  return kind === "diet" ? 350 : 400;
}

function chunkText(input: string, chunkSize = 2500) {
  if (input.length <= chunkSize) return [input];
  const chunks: string[] = [];
  let index = 0;
  while (index < input.length) {
    const chunk = input.slice(index, index + chunkSize);
    chunks.push(chunk);
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

  const res = await fetch(url, { method: "GET" });
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
  const chunks = chunkText(text);
  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    let translated = "";
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        translated = await translateTextChunk(chunk, target);
        break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error("Unknown translation error");
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
    if (!translated) {
      if (lastError) {
        throw lastError;
      }
      translated = chunk;
    }
    translatedChunks.push(translated || chunk);
  }
  return translatedChunks.join("");
}

export async function extractPdfText(buffer: Buffer) {
  // Heuristic extractor: works for text-based PDFs and safely falls back for scanned PDFs.
  const raw = buffer.toString("latin1");
  const parenthesisChunks = Array.from(raw.matchAll(/\(([^()]*)\)/g)).map((m) => m[1]);
  const unicodeHexChunks = Array.from(raw.matchAll(/<([0-9A-Fa-f]{4,})>/g)).map((m) => m[1]);
  const decodedHex = unicodeHexChunks
    .map((hex) => {
      const parts = hex.match(/.{1,4}/g) ?? [];
      return parts
        .map((part) => {
          const code = Number.parseInt(part, 16);
          if (Number.isNaN(code) || code === 0) return "";
          return String.fromCharCode(code);
        })
        .join("");
    })
    .join(" ");

  const merged = `${parenthesisChunks.join(" ")} ${decodedHex}`.replace(/\s+/g, " ").trim();
  const normalized = merged.slice(0, 20000);
  return normalized;
}

export async function buildProgramTranslations(input: {
  title: string;
  description: string;
  pdfText: string;
}) {
  const title: Record<string, string> = { en: input.title };
  const description: Record<string, string> = { en: input.description };
  const pdfText: Record<string, string> = { en: input.pdfText };

  const maxPdfTextForTranslation = input.pdfText.slice(0, 12000);

  for (const locale of targetLocales) {
    if (locale === "en") continue;
    try {
      title[locale] = await translateTextRobust(input.title, locale);
      description[locale] = await translateTextRobust(input.description, locale);
      pdfText[locale] = await translateTextRobust(maxPdfTextForTranslation, locale);
    } catch {
      // Fallback to English content if translation provider fails.
      title[locale] = input.title;
      description[locale] = input.description;
      pdfText[locale] = maxPdfTextForTranslation;
    }
  }

  return { title, description, pdfText };
}

export function localizeCustomProgramRow(row: CustomProgramRow, locale: Locale) {
  const localizedTitle = row.localized_title?.[locale] || row.title;
  const localizedDescription = row.localized_description?.[locale] || row.description;
  const category = row.kind === "diet" ? "Nutrition" : "Strength";
  return {
    ...row,
    title: localizedTitle,
    description: localizedDescription,
    category
  };
}

export function toPublicCustomProgramRow(row: CustomProgramRow, locale: Locale) {
  const localized = localizeCustomProgramRow(row, locale);
  return {
    id: localized.id,
    slug: localized.slug,
    title: localized.title,
    description: localized.description,
    kind: localized.kind,
    category: localized.category,
    price_try: localized.price_try,
    difficulty: localized.difficulty,
    duration: localized.duration,
    uploader_role: localized.uploader_role,
    translation_status: localized.translation_status,
    created_at: localized.created_at
  };
}
