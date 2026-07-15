"use client";

import { Fragment, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const THINKING_LABEL: Record<string, string> = {
  en: "TJAI is thinking",
  tr: "TJAI düşünüyor",
  ar: "TJAI يفكر",
  es: "TJAI está pensando",
  fr: "TJAI réfléchit"
};

import styles from "./tjai-chat.module.css";

const INLINE_TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^()\s]+\))/g;
const LINK_TOKEN = /^\[([^\]]+)\]\(([^()\s]+)\)$/;

// Only relative /paths may become anchors; absolute or protocol-relative
// URLs from model output degrade to plain text (no external link injection).
function isSafeRelativePath(target: string): boolean {
  return target.startsWith("/") && !target.startsWith("//") && !target.includes(":");
}

function parseInline(text: string): ReactNode {
  const parts = text.split(INLINE_TOKEN);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded-md border border-accent/20 bg-[rgba(168,85,247,0.10)] px-1.5 py-px font-mono text-[0.85em] text-purple-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = LINK_TOKEN.exec(part);
    if (link) {
      const [, label, target] = link;
      if (isSafeRelativePath(target)) {
        return (
          <a
            key={i}
            href={target}
            className="rounded-sm font-medium text-purple-200 underline decoration-purple-300/50 underline-offset-[3px] transition-colors hover:text-white hover:decoration-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {label}
          </a>
        );
      }
      return <Fragment key={i}>{label}</Fragment>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  return t.includes("|") && t.includes("-") && /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(t);
}

function splitTableCells(row: string): string[] {
  let s = row.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((cell) => cell.trim());
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
        <h4
          key={`h-${k++}`}
          className="pt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-300/95 first:pt-0"
        >
          {parseInline(t.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (t.startsWith("## ")) {
      blocks.push(
        <h3
          key={`h3-${k++}`}
          className="pt-2.5 text-base font-semibold leading-snug tracking-[-0.01em] text-white first:pt-0"
        >
          {parseInline(t.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (t.startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitTableCells(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitTableCells(lines[i]));
        i++;
      }
      blocks.push(
        <div key={`tbl-${k++}`} className="my-2 overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full min-w-max border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[rgba(168,85,247,0.08)]">
                {header.map((cell, j) => (
                  <th
                    key={j}
                    className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-[0.08em] text-purple-200/90"
                  >
                    {parseInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/[0.05] even:bg-white/[0.025] last:border-0">
                  {header.map((_, j) => (
                    <td key={j} className="px-3 py-1.5 align-top leading-[1.6] text-bright [&_strong]:text-white">
                      {parseInline(row[j] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
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
        <ul key={`ul-${k++}`} className="my-1 list-disc space-y-1.5 ps-5 marker:text-accent/70">
          {items.map((item, j) => (
            <li key={j} className="leading-[1.7] text-bright [&_strong]:text-white">
              {parseInline(item)}
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
      <p key={`p-${k++}`} className="leading-[1.7] text-bright [&_strong]:text-white">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className={cn("tj-prose-coach space-y-2 text-sm", className)}>{blocks}</div>;
}

export function CoachThinkingPulse() {
  const pathname = usePathname() ?? "";
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  const thinkingLabel = THINKING_LABEL[seg] ?? THINKING_LABEL.en;
  return (
    <div
      className="flex items-center gap-2.5 py-1"
      aria-live="polite"
      aria-label={thinkingLabel}
      role="status"
    >
      <span
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.18em] text-purple-200/75 motion-reduce:opacity-90",
          styles.thinkLabel
        )}
      >
        {thinkingLabel}
      </span>
      <span className="flex items-center gap-1 motion-reduce:hidden" aria-hidden>
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className={cn(
              "inline-block h-[5px] w-[5px] rounded-full bg-purple-300/90",
              styles.thinkDot
            )}
            style={{ animationDelay: `${d * 180}ms` }}
          />
        ))}
      </span>
      <span className="hidden text-xs text-dim motion-reduce:inline" aria-hidden>
        …
      </span>
    </div>
  );
}
