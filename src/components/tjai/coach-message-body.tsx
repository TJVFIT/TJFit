"use client";

import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

function parseInlineBold(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function CoachMessageBody({ text, className }: { text: string; className?: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (t.startsWith("### ")) {
      blocks.push(
        <h4 key={`h-${k++}`} className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300/90">
          {parseInlineBold(t.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (t.startsWith("## ")) {
      blocks.push(
        <h3 key={`h3-${k++}`} className="text-sm font-semibold tracking-tight text-white">
          {parseInlineBold(t.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (t.startsWith("- ") || t.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (cur.startsWith("- ") || cur.startsWith("* ")) {
          items.push(cur.slice(2));
          i++;
        } else break;
      }
      blocks.push(
        <ul key={`ul-${k++}`} className="my-1 list-disc space-y-1 ps-4 marker:text-accent/55">
          {items.map((item, j) => (
            <li key={j} className="text-bright [&_strong]:text-white">
              {parseInlineBold(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (t === "") {
      blocks.push(<div key={`sp-${k++}`} className="h-2" />);
      i++;
      continue;
    }
    blocks.push(
      <p key={`p-${k++}`} className="text-bright leading-relaxed [&_strong]:text-white">
        {parseInlineBold(line)}
      </p>
    );
    i++;
  }

  return <div className={cn("tj-prose-coach space-y-1.5 text-sm", className)}>{blocks}</div>;
}

export function CoachThinkingPulse() {
  return (
    <div className="flex items-center gap-2 py-0.5" aria-live="polite" aria-label="TJAI is thinking">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-dim">Thinking</span>
      <span className="flex gap-1 motion-reduce:hidden">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-accent/90"
            style={{ animationDelay: `${d * 140}ms` }}
          />
        ))}
      </span>
      <span className="hidden text-xs text-dim motion-reduce:inline">…</span>
    </div>
  );
}
