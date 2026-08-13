# i18n archive — Phase-2 JSON message layer (retired)

## What this was

In an earlier iteration ("Phase 2 / Path B"), TJFit started a second i18n
system alongside the live one: `messages/<locale>.json` files loaded through
`src/lib/messages.ts` (`getMessages()` / `t()`). The intent was a
forward-compat namespace that new surfaces could read from, with an eventual
migration off the hand-rolled `src/lib/i18n.ts` dictionaries toward something
`next-intl`-shaped.

## Why it died

- **Zero call sites.** Nothing in `src/` ever imported `getMessages` or `t`
  from `src/lib/messages.ts`. The loader existed, compiled, and was covered
  by the key-parity check, but no component or route ever read from it.
- **The five routed locales were English stubs.** `messages/en.json`,
  `tr.json`, `ar.json`, `es.json`, and `fr.json` — the only locales actually
  wired into app routing — were byte-identical to `en.json`. Verified with a
  direct diff before deletion; all four non-English files matched `en.json`
  exactly, so no real translation work was lost by deleting them.
- **The live i18n system already covered the app.** All user-facing copy is
  served through `src/lib/i18n.ts`'s `dictionaries` export and the
  standalone `*-copy.ts` modules, which the app's routes and components
  actually import. The JSON layer was pure dead weight: unread code
  duplicating unread data.

Given a maintained system with zero readers duplicating a live system with
all the readers, the dead layer was removed (`src/lib/messages.ts` and the
`messages/en|tr|ar|es|fr.json` stubs) rather than kept "just in case."

## What's preserved here

`de.json`, `hi.json`, `id.json`, `pt.json`, and `ru.json` were moved into
this directory rather than deleted. Unlike the five routed locales, these
five contain **real, human-quality translations** — Turkish/Arabic/Spanish/
French were the stubs; German, Hindi, Indonesian, Portuguese, and Russian
were genuinely translated. No route ever served them (none of these five
locales were wired into the app's routing), so the work was invisible to
every user, but it's real work and shouldn't be lost.

If TJFit ever expands beyond `en`/`tr`/`ar`/`es`/`fr`, these five files are
a ready-made starting point: real translated strings for a JSON-keyed
namespace, ready to be reconciled against whatever the live `i18n.ts`
dictionary shape looks like at that time (key sets have likely drifted
since these were last touched — treat them as a strong first draft, not a
drop-in).
