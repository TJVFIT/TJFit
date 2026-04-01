import { NextResponse } from "next/server";

export type ReadRequestJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; response: NextResponse };

/**
 * Reads and parses a JSON request body exactly once (single `text()` read).
 *
 * Contract (fixes the root issue of mixing "parse failed" with "no body"):
 * - Whitespace-only or empty body → `{ ok: true, value: {} }` so routes validate fields themselves.
 * - Syntax-invalid JSON → `{ ok: false, 400 }` — never swallowed as null/undefined.
 */
export async function readRequestJson(request: Request): Promise<ReadRequestJsonResult> {
  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unable to read request body." }, { status: 400 })
    };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(trimmed) as unknown };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    };
  }
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
