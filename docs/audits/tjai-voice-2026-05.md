# TJAI Voice / TTS Audit — 2026-05-27 (Plan2 phase 17)

Static review of `src/components/tjai/speaker-button.tsx` against Cycle 094 (voice/TTS UX).

## Findings

| Cycle 094 requirement | Status |
|---|---|
| Accessible labels on play/stop | ✅ `aria-label` = "Play audio" / "Stop audio" + `title` = "Listen"/"Stop" |
| Visible play/stop state | ✅ `state === "playing"` drives both label and icon |
| Text fallback always available | ✅ TTS is supplementary — the assistant text is always rendered; the speaker button only reads it aloud |
| No mic / recording / privacy exposure | ✅ TTS-only — no `getUserMedia` / `MediaRecorder`. Nothing sent to a third party beyond the existing TTS endpoint |
| Auto-play default off in public contexts | ✅ `autoplay = false` default; only on when the user opts in via settings (`tts_autoplay`) |
| Reduced-motion | n/a — audio, not motion |

## Verdict
**No issues.** The speaker button is accessible (labelled, stateful), privacy-safe (no recording), has a text fallback, and does not auto-play by default. Cycle 094 requirements are met.

## Minor optional polish (P4)
- `aria-label` is English-only — could localize "Play audio"/"Stop audio" via the TJAI copy module for full 5-locale coverage. Low priority (icon-button, screen-reader-only text).
- Consider a brief "generating audio…" state if the TTS endpoint has latency, so the button doesn't look unresponsive between tap and playback.
