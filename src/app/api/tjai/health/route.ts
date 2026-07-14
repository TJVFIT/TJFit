import { TJAI_AI_TASKS, resolveTaskProvider } from "@/lib/tjai/provider-policy";

export const dynamic = "force-dynamic";

/**
 * Ops health check: which LLM backend serves each TJAI task right now.
 * Exposes provider labels only (e.g. "open", "openai") — never keys or URLs.
 */
export async function GET() {
  const providers = Object.fromEntries(
    Object.values(TJAI_AI_TASKS).map((task) => [task, resolveTaskProvider(task)])
  );
  const ok = Object.values(providers).every((p) => p !== "none");
  return Response.json(
    { ok, providers },
    { headers: { "Cache-Control": "no-store" }, status: ok ? 200 : 503 }
  );
}
