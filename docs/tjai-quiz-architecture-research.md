# TJFit TJAI and Adaptive Quiz: Architecture and Open-Source Research

Research date: 2026-07-24  
Scope: the local `C:\TJFit` workspace plus primary GitHub repositories and repository licenses.

## Executive recommendation

Build TJAI as a constrained recommendation system, not as an autonomous fitness coach.

The safe and maintainable first release is:

1. A human-authored adaptive onboarding quiz managed by XState.
2. A deterministic safety gate and program-ranking engine that selects only from TJFit's existing catalog.
3. Retrieval from versioned TJFit program documents in Supabase/Postgres with pgvector.
4. Vercel AI SDK for streamed chat, tool calls, and schema-validated recommendation explanations.
5. Promptfoo test suites and red-team checks before deployment.
6. Minimal, redacted telemetry first; add Langfuse when production trace volume justifies its operational cost.

Do not ask an LLM to invent a workout, diagnose an injury, decide whether someone is medically safe to exercise, calculate aggressive nutrition targets, or directly mutate purchases/profile data.

## What exists in the workspace

TJFit now has a safe deterministic first release, while the generative layer remains intentionally unimplemented:

- `src/app/[locale]/ai/page.tsx` now hosts a four-step, safety-gated matcher over the real program catalog.
- `src/components/fitness-quiz.tsx` provides transparent ranking, a professional-clearance stop, explainable results, and no model-generated health claims.
- There are no `/api/ai/*` routes.
- There are no AI, quiz, consent, retrieval, embedding, feedback, or trace tables/migrations.
- `src/lib/program-blueprints.ts` contains 29 typed 12-week blueprints.
- `src/lib/content.ts` contains a matching 29-program catalog with slugs, categories, difficulty, equipment, assets, and prices.
- `docs/programs` contains 29 Markdown program dossiers. They already have useful retrieval boundaries such as overview, weekly blocks, coaching notes, and safety protocol.
- The localization layer supports `en`, `tr`, `ar`, `es`, and `fr`. Turkish copy quality is inconsistent: some strings use native characters while many are ASCII transliterations. AI-generated Turkish must not become the source of truth for fixed UI or safety copy.
- The project shell now has Next.js 16, React 19, TypeScript, Tailwind, shadcn aliases, Zod, and Supabase. The verified local runtime is Node 24.

Important integration constraint: the current Vercel AI SDK and OpenAI Agents SDK repositories both document Node 22+ as the supported Node runtime. TJFit's verified Node 24 runtime satisfies that baseline, but either SDK should still be introduced behind the safety gate and evaluation suite described below.

## Product architecture

### 1. Adaptive quiz

Use fixed, translated questions and typed answers. Let branching reduce question count; never let a model dynamically create safety questions.

Recommended answer model:

```ts
type FitnessQuizAnswers = {
  locale: "en" | "tr";
  ageBand: "under_18" | "18_29" | "30_44" | "45_64" | "65_plus";
  goal: "fat_loss" | "muscle_gain" | "strength" | "conditioning" | "general_fitness";
  experience: "beginner" | "intermediate" | "advanced";
  setting: "home" | "gym";
  equipment: Array<
    "none" | "bands" | "dumbbells" | "bench" | "barbell" | "machines" | "full_gym"
  >;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  minutesPerSession: 20 | 30 | 45 | 60 | 75;
  impactPreference: "low" | "moderate" | "high";
  limitations: Array<
    "none" | "joint_pain" | "back_pain" | "recent_injury" | "pregnant_postpartum" | "clinician_restriction"
  >;
  redFlags: Array<
    "none" | "chest_pain" | "fainting_dizziness" | "unexplained_shortness_of_breath" | "acute_injury"
  >;
  safetyAcknowledged: boolean;
};
```

The exact safety questions and escalation language must be reviewed by a qualified clinician before launch. Store only the smallest set of answers required for the recommendation. The initial matcher does not need name, exact birth date, exact weight, phone, or free-form medical history.

XState is useful because the transitions are explicit and testable:

```text
consent
  -> basic_profile
  -> safety_screen
      -> needs_clearance (terminal, no generated plan)
      -> goals
          -> setting_and_equipment
          -> schedule
          -> review
          -> recommendation
```

Do not persist health-related answers in browser local storage. Keep an anonymous in-memory draft by default, then save only after sign-in and explicit consent.

### 2. Safety gate

Safety is ordinary application code, not a prompt:

```ts
type Eligibility =
  | { status: "eligible" }
  | { status: "needs_clearance"; reasonCodes: string[] }
  | { status: "unsupported"; reasonCodes: string[] };
```

Rules run before retrieval or model calls. A `needs_clearance` result returns fixed, reviewed language and cannot be overridden by the model. The AI route also applies an output policy that blocks diagnosis, medication advice, claims of guaranteed results, unsafe rapid-weight-loss instructions, and attempts to bypass the safety gate.

### 3. Program matching

Start with a transparent score, not embeddings:

```text
hard filters
- location/setting must match
- required equipment must be available
- safety status must be eligible

weighted score
+ goal match
+ experience/difficulty match
+ schedule/frequency fit
+ impact preference fit
+ desired training style
- adaptation burden
```

Return the top program plus at most two alternatives. Persist the score components and rule version so a recommendation can be explained and reproduced.

The model receives only the already-ranked catalog records and is allowed to:

- explain why each program fits;
- compare the selected program with alternatives;
- answer questions using retrieved blueprint sections;
- translate the explanation into the selected locale;
- propose only enumerated, pre-approved adaptations.

It is not allowed to change the selected slug, create exercises, alter safety status, or invent program phases.

Recommended structured result:

```ts
type ProgramRecommendation = {
  status: "recommended" | "needs_clearance" | "no_match";
  locale: "en" | "tr";
  primaryProgramSlug?: string;
  alternatives: Array<{
    slug: string;
    reasonCodes: string[];
  }>;
  approvedAdaptations: Array<{
    code: "reduce_rounds" | "lower_impact" | "extra_rest" | "beginner_start";
    sourceSection: string;
  }>;
  safetyNoticeCodes: string[];
  evidence: Array<{
    programSlug: string;
    section: string;
    sourceVersion: string;
  }>;
  matcherVersion: string;
};
```

### 4. Retrieval over TJFit content

The corpus is small: 29 documents. Avoid a heavy RAG framework initially.

Create `program_chunks` in Supabase with:

- `program_slug`
- `source_path`
- `source_version`
- `source_hash`
- `section_kind`
- `phase_start_week`
- `phase_end_week`
- `canonical_language`
- `content`
- `embedding`
- `created_at`

Chunk at the Markdown heading/weekly-phase boundary instead of arbitrary token windows. Use metadata filters before vector similarity:

```sql
where program_slug = any(:allowed_program_slugs)
  and section_kind = any(:allowed_section_kinds)
order by embedding <=> :query_embedding
limit :k
```

For Turkish questions, retrieve the canonical English program source and generate a Turkish answer. Keep citations tied to the canonical source. Add human-reviewed Turkish program documents later rather than embedding unreviewed machine translations.

Ingestion must be idempotent: hash the normalized source and embedding model identifier, update only changed chunks, and retain the source version used by each recommendation.

### 5. Read-only TJAI tools

The first release needs only server-side, read-only tools:

- `get_quiz_recommendation(answers)`
- `get_program_candidates(filters)`
- `retrieve_program_sections(slugs, question, sectionKinds)`
- `compare_programs(slugs)`
- `get_program_purchase_link(slug, locale)`

Tool inputs and outputs must be Zod-validated. Authorize tools server-side and return the minimum fields needed. Never give the model a Supabase service-role key or arbitrary SQL access.

Checkout, refunds, account changes, coach assignment, and saved-health-profile updates should not be tools in the first release. If added later, they require explicit user confirmation and idempotency.

### 6. Multilingual behavior

- Keep internal enums, rule codes, slugs, and matcher output language-neutral.
- Resolve locale from the URL/session and pass it as a trusted server value, not a user prompt instruction.
- Human-author all fixed quiz, consent, safety, and escalation text in English and Turkish.
- Instruct TJAI to answer in the selected locale while preserving source slugs/citations.
- Run the same eval cases independently in English and Turkish.
- Add Unicode tests for Turkish dotted/dotless I and native characters; do not accept ASCII transliteration as the finished Turkish product.
- If free-form input switches language, let the user explicitly change response language instead of silently changing the application locale.

## Ranked open-source shortlist

Repository activity below was checked through the GitHub API on 2026-07-24. Dates are activity signals, not security guarantees. Re-check versions and licenses when locking dependencies.

### 1. Vercel AI SDK — adopt for the AI route/runtime

- Repository: https://github.com/vercel/ai
- License: Apache-2.0; repository license: https://github.com/vercel/ai/blob/main/LICENSE
- Primary runtime: TypeScript; pushed 2026-07-23.
- Fit: native match for Next.js/React, provider abstraction, streaming UI, tool calling, structured output with Zod.
- Integration effort: low to medium after the Node 22 runtime decision.
- Security/privacy: model/provider calls remain server-side. Enforce allowlisted tools, strict schemas, request limits, timeouts, output size limits, and redaction before logging.
- Decision: use this rather than introducing a full agent graph for the first release.

### 2. XState — adopt for quiz branching

- Repository: https://github.com/statelyai/xstate
- License: MIT.
- Primary runtime: TypeScript; pushed 2026-07-22.
- Fit: explicit statecharts, React integration, graph/model testing, deterministic transitions.
- Integration effort: low.
- Security/privacy: it is state management, not secure storage. Do not persist sensitive quiz context to local storage; clear abandoned in-memory sessions.
- Decision: adopt `xstate` and `@xstate/react` for the adaptive quiz. A small reducer is acceptable only if the final flow remains strictly linear.

### 3. pgvector — adopt through the existing Supabase/Postgres stack

- Repository: https://github.com/pgvector/pgvector
- License: permissive PostgreSQL license; license text: https://github.com/pgvector/pgvector/blob/master/LICENSE
- Primary runtime: Postgres extension implemented in C; pushed 2026-07-11.
- Fit: vector search stays beside TJFit program metadata, RLS, backups, and SQL filtering.
- Integration effort: low because Supabase is already the database.
- Security/privacy: use a server-only RPC or server client; RLS alone is not a reason to expose embeddings/content tables publicly. Separate public program content from user-specific quiz data.
- Decision: adopt without an additional RAG framework.

### 4. Promptfoo — adopt for evals and red teaming

- Repository: https://github.com/promptfoo/promptfoo
- License: MIT.
- Primary runtime: TypeScript; pushed 2026-07-23.
- Fit: declarative prompt/model/RAG tests, custom assertions, CI integration, and adversarial testing.
- Integration effort: low to medium.
- Required TJFit suites:
  - recommendation consistency for fixed quiz fixtures;
  - no recommendation after red-flag answers;
  - no invented exercises or program slugs;
  - retrieved-source citation correctness;
  - prompt-injection resistance inside user text and retrieved Markdown;
  - tool allowlist/argument attacks;
  - PII leakage;
  - English/Turkish semantic parity;
  - refusal quality for diagnosis, medication, eating-disorder, and extreme-weight-loss requests;
  - latency and per-request token/cost ceilings.
- Security/privacy: Promptfoo's own security documentation says configs and referenced scripts/data are trusted code. Run untrusted pull-request evals in isolated CI with scoped credentials and do not expose its local UI.
- Decision: gate AI releases on a checked-in regression suite.

### 5. Langfuse — add after the MVP, or use managed hosting with a privacy review

- Repository: https://github.com/langfuse/langfuse
- License: MIT for core code, with separately licensed `ee` directories; license: https://github.com/langfuse/langfuse/blob/main/LICENSE
- Primary runtime: TypeScript; pushed 2026-07-23.
- Fit: traces, prompt versions, datasets, evaluations, feedback, OpenTelemetry, Vercel AI SDK integration.
- Integration effort: medium for managed hosting, high for production self-hosting.
- Security/privacy: traces can capture prompts, quiz answers, retrieved text, and model outputs. Redact before export, disable raw prompt capture where possible, use short retention, and never trace exact health/identity data.
- Decision: do not block the first release on self-hosting it. Start with product metrics and redacted error logs, then add Langfuse when the team is ready to operate it.

### 6. Microsoft Presidio — optional second-phase privacy service

- Repository: https://github.com/microsoft/presidio
- License: MIT.
- Primary runtime: Python; pushed 2026-07-23.
- Fit: customizable detection and anonymization of PII before model calls or traces.
- Integration effort: high for this TypeScript application because it introduces a Python/Docker service.
- Security/privacy: the project explicitly warns detection is not complete. Its documented REST services do not include authentication, so they must remain private behind an authenticated gateway. Turkish needs custom recognizers/models and an evaluated Turkish data set.
- Decision: begin with field minimization plus deterministic masking for email, phone, tokens, and account identifiers. Add Presidio only when free-form chat volume and privacy requirements justify the service.

## Strong projects to defer

### OpenAI Agents SDK for JavaScript/TypeScript

- Repository: https://github.com/openai/openai-agents-js
- License: MIT; TypeScript; pushed 2026-07-23.
- It includes tools, handoffs, guardrails, sessions, human-in-the-loop, and tracing.
- Decision: good future option if TJAI becomes a multi-agent or coach-handoff workflow. It duplicates much of what the first TJAI release needs from the lighter Vercel AI SDK and currently documents Node 22+.

### LangGraph.js

- Repository: https://github.com/langchain-ai/langgraphjs
- License: MIT; TypeScript; pushed 2026-07-23.
- It is designed for durable, stateful, human-in-the-loop agent workflows.
- Decision: defer. A recommendation request and retrieval-backed chat do not need a durable agent graph. Revisit for long-running coach approvals or resumable multi-step plan revisions.

### Guardrails AI and NeMo Guardrails

- Repositories:
  - https://github.com/guardrails-ai/guardrails
  - https://github.com/NVIDIA-NeMo/Guardrails
- Licenses: Apache-2.0; both are Python-first.
- Decision: defer. They add a second runtime and do not replace TJFit-specific deterministic safety rules, schema validation, retrieval isolation, or evals. Consider one only if generic validator coverage later exceeds what can be maintained in TypeScript.

### i18next

- Repository: https://github.com/i18next/i18next
- License: MIT; JavaScript/TypeScript ecosystem; pushed 2026-07-09.
- Decision: valuable for a wider localization cleanup, but not required to launch TJAI because the app already has a typed locale layer. First normalize the existing locale copy and extract TJAI strings into dedicated, human-reviewed dictionaries.

## Data model

Suggested tables, all with RLS:

### `ai_quiz_sessions`

- owner user ID or anonymous session hash
- locale
- consent version and timestamp
- status
- normalized answers JSON (no arbitrary free-form health notes)
- quiz schema version
- matcher version
- expiry timestamp

Anonymous sessions should expire quickly. Signed-in history should be opt-in.

### `ai_recommendations`

- quiz session ID
- primary program slug
- alternative slugs
- score breakdown JSON
- approved adaptations
- source versions
- model/provider identifier used only for explanation
- prompt version
- created timestamp

### `program_chunks`

As described in the retrieval section. Program content can be readable only through a restricted server RPC until its public-content policy is explicit.

### `ai_feedback`

- recommendation/chat interaction ID
- structured rating
- selected reason codes
- optional comment with explicit warning not to include medical or identifying information

### `ai_audit_events`

Keep low-cardinality event metadata: request ID, route, policy outcome, tool names, latency, token counts, error class, locale, and hashed user/session ID. Do not store raw prompts by default.

## API flow

### `POST /api/ai/quiz/recommend`

1. Authenticate or establish an anonymous rate-limited session.
2. Validate the body with Zod and reject unknown fields.
3. Apply consent and deterministic safety rules.
4. If clearance is needed, return reviewed fixed copy; no model call.
5. Rank catalog programs deterministically.
6. Retrieve supporting sections for only the top candidates.
7. Ask the model for a schema-constrained explanation only.
8. Validate that every returned slug/source/adaptation was in the allowlist.
9. Store the recommendation record and minimal metrics.

### `POST /api/ai/chat`

1. Authenticate/rate-limit; apply request/body/token limits.
2. Normalize locale and redact obvious identifiers.
3. Classify the request into supported, fixed-safety-response, or refuse/escalate.
4. Expose only read-only tools.
5. Retrieve only from versioned TJFit sources.
6. Stream the response.
7. Post-validate citations and policy constraints.
8. Record redacted metrics and user feedback linkage.

## Eval and release gates

Create a versioned fixture set before enabling public chat:

- At least 25 ordinary recommendation profiles per locale.
- Boundary cases for every safety rule.
- Profiles with no valid equipment/schedule match.
- Adversarial prompts asking the model to ignore the quiz or invent a more extreme plan.
- Retrieved documents containing prompt-injection strings.
- Turkish inputs with spelling variants and native characters.
- Cross-locale tests where recommendations must have the same slug and rule codes.
- Tests asserting that unauthenticated users cannot access saved quiz/recommendation records.

Required release thresholds:

- 100% deterministic safety-gate accuracy on the reviewed fixture set.
- 100% returned slugs/adaptations/citations in the server allowlist.
- 0 raw secrets, emails, phone numbers, or full quiz payloads in traces.
- Recommendation explanations never change the matcher-selected slug.
- Defined p95 latency and token budgets, with a non-AI fallback recommendation if the provider fails.

## Concrete implementation sequence

### Phase 0 — restore a testable baseline

- Keep `package.json`, lockfile, `tsconfig`, Tailwind/shadcn setup, and environment examples in source control.
- Decide on Node 22 and hosting compatibility.
- Add unit, route, and migration test commands.

### Phase 1 — useful quiz without an LLM

- Add quiz schemas, XState machine, translated fixed copy, and deterministic matcher.
- Add reviewed safety rules and the `needs_clearance` terminal path.
- Return an explainable recommendation directly from the catalog.
- Unit-test every transition and scoring rule.

This is already a valuable product and remains available if the model provider is down.

### Phase 2 — retrieval and TJAI explanation

- Add pgvector and `program_chunks`.
- Write the Markdown-heading ingestion/indexing job.
- Add the read-only retrieval tools and citation format.
- Add Vercel AI SDK structured/streamed routes.
- Enforce output allowlists and fallbacks.

### Phase 3 — evals and controlled beta

- Add Promptfoo fixtures, injection tests, and CI gates.
- Launch to authenticated beta users with rate limits and feedback.
- Measure recommendation acceptance, program-page click-through, refusal/safety rate, retrieval citation rate, latency, and cost.

### Phase 4 — observability and privacy hardening

- Add redacted Langfuse/OpenTelemetry traces after privacy review.
- Add Presidio only if evaluated Turkish/English redaction materially improves over deterministic masking.
- Establish deletion/export workflows and retention policies for AI data.

### Phase 5 — optional agent capabilities

- Add coach review/handoff and resumable plan-change workflows only after the basic system is reliable.
- Evaluate OpenAI Agents SDK or LangGraph.js at that point.
- Keep purchase/account-changing tools behind explicit confirmations and idempotency.

## Gaps that block a production TJAI launch

- No AI routes or model/provider abstraction.
- No quiz schema, state machine, matcher, or clinical review of safety questions.
- No consent/retention policy for health-adjacent quiz data.
- No embedding/indexing pipeline, vector schema, source versioning, or citations.
- No rate limiting or documented abuse controls for AI endpoints.
- No AI eval suite, injection tests, safety fixtures, or Turkish parity tests.
- No AI observability/redaction strategy.
- No reviewed Turkish TJAI/quiz/safety copy.
- No model failure fallback.
- No explicit boundary between general fitness guidance and medical/nutrition advice.

The 29 existing blueprints are the strongest asset. The fastest route to a differentiated TJAI is to make those plans searchable, explainable, safely matched, and bilingual—not to add a large autonomous-agent framework.
