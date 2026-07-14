# TJAI on open-source models — owner setup guide

TJAI no longer requires OpenAI. Every AI task (chat, plan generation, meal swap,
grocery list, meal prep, progress evaluation, memory extraction, suggestions,
blog, renewal email, evals) now routes through a unified gateway
(`src/lib/tjai/llm.ts` + `src/lib/tjai/llm-gateway.ts`) that speaks the
OpenAI-compatible protocol every major open-source inference server uses.

**Priority order at runtime:**

1. **Open-source gateway** — used for ALL tasks when configured (see below).
2. Legacy provider per task (OpenAI / Anthropic) — automatic fallback if the
   gateway env vars are absent, so nothing breaks during the switch.
3. Cross-provider rescue (e.g. Anthropic serves a former-OpenAI task if only
   `ANTHROPIC_API_KEY` is set), then the existing shaped 503 / static fallbacks.

No code changes are needed to switch — only Vercel environment variables.

## Option 1 — Groq (free tier, hosted open models, recommended first step)

Runs Meta Llama 3.3 70B (open-weight) on Groq's LPU hardware. Fastest
tokens/sec of any host; generous free tier.

```
TJAI_LLM_PRESET=groq
TJAI_LLM_API_KEY=gsk_...        # free key from console.groq.com
```

Default models: `llama-3.3-70b-versatile` (chat/plans), `llama-3.1-8b-instant`
(cheap extractions). Override with `TJAI_LLM_MODEL_CHAT` etc. if desired.

## Option 2 — OpenRouter (one key, hundreds of open models, has free models)

```
TJAI_LLM_PRESET=openrouter
TJAI_LLM_API_KEY=sk-or-...      # openrouter.ai
TJAI_LLM_MODEL=meta-llama/llama-3.3-70b-instruct
```

Free-tier model ids end in `:free` (e.g. `meta-llama/llama-3.3-70b-instruct:free`).

## Option 3 — Ollama (100% local / self-hosted, zero API cost)

Already installed on this machine. For local development:

```
TJAI_LLM_PRESET=ollama
TJAI_LLM_MODEL=llama3.1         # or qwen2.5:14b, mistral, etc. (ollama pull <model>)
```

Note: production on Vercel cannot reach your laptop — for production you'd
self-host Ollama/vLLM on a server and set `TJAI_LLM_BASE_URL=https://your-host/v1`.

## Option 4 — vLLM / any OpenAI-compatible server (production self-hosting)

```
TJAI_LLM_BASE_URL=https://your-inference-host/v1
TJAI_LLM_API_KEY=...            # if your server requires one
TJAI_LLM_MODEL=Qwen/Qwen2.5-72B-Instruct
```

Works with vLLM, TGI (Hugging Face), llama.cpp server, LM Studio, Together, etc.

## Per-task model tuning (optional)

| Env var | Used for |
|---|---|
| `TJAI_LLM_MODEL` | default for everything |
| `TJAI_LLM_MODEL_CHAT` | streaming coach chat |
| `TJAI_LLM_MODEL_JSON` | plan generation + progress analysis (needs a strong model) |
| `TJAI_LLM_MODEL_MINI` | cheap extractions (preferences, memory facts) |
| `TJAI_LLM_MODEL_LONGFORM` | meal swap, grocery list, meal prep, blog, suggestions |

## Verifying before flipping production

1. Set the env vars locally in `.env.local`, run `npm run dev`, and use TJAI chat.
2. Run the eval harness against the new backend: `npm run eval:tjai`.
3. Watch `tjai_ai_call_logs` — gateway calls log with `provider = "open:<preset>"`.
4. Plan generation is the quality-critical path: generate a test plan and
   confirm it passes validation (weak models fail the semantic checks more
   often, which auto-refunds the credit but degrades UX — prefer 70B-class
   models for `TJAI_LLM_MODEL_JSON`).
