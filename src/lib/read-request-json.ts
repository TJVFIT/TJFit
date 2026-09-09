import { NextResponse } from "next/server";

export type ReadRequestJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; response: NextResponse };

/** Reads once; when bounded, stops the stream as soon as the byte limit is exceeded. */
export async function readRequestText(request: Request, maxBytes?: number): Promise<
  { ok: true; value: string } | { ok: false; response: NextResponse }
> {
  let text: string;
  try {
    if (maxBytes !== undefined) {
      const tooLarge = () => ({
        ok: false as const,
        response: NextResponse.json({ error: "Request body is too large." }, { status: 413 })
      });
      if (Number(request.headers.get("content-length")) > maxBytes) return tooLarge();
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      if (reader) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > maxBytes) {
              await reader.cancel();
              return tooLarge();
            }
            chunks.push(value);
          }
        } finally {
          reader.releaseLock();
        }
      }
      const body = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
      }
      text = new TextDecoder("utf-8", { fatal: true }).decode(body);
    } else {
      text = await request.text();
    }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unable to read request body." }, { status: 400 })
    };
  }
  return { ok: true, value: text };
}

/** Empty JSON bodies become {}; malformed JSON returns 400. Optional limit is in bytes. */
export async function readRequestJson(request: Request, maxBytes?: number): Promise<ReadRequestJsonResult> {
  const body = await readRequestText(request, maxBytes);
  if (!body.ok) return body;
  const trimmed = body.value.trim();
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
