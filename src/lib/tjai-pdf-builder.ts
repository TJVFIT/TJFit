import { jsPDF } from "jspdf";

import {
  PAGE,
  PDF_THEME,
  drawChampagneBar,
  drawCoverHeader,
  drawFooter,
  drawInteriorHeader,
  fillPage,
  setDraw,
  setText,
  wrapText
} from "@/lib/premium-pdf-theme";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";

export type TjaiPdfArgs = {
  plan: TJAIPlan;
  metrics: TJAIMetrics;
  answers: QuizAnswers;
  buyerName?: string | null;
  issuedAt?: string;
  localeLabel?: string;
};

/**
 * jsPDF ships only Helvetica (WinAnsi). Cyrillic, Devanagari and Arabic glyphs
 * are not in that encoding and would render as empty boxes. We normalize accents
 * and strip non-WinAnsi code points so the file is readable on every printer —
 * the in-app experience keeps the selected language. A future upgrade can embed
 * Noto Sans subsets to render the exports natively per script.
 */
function sanitize(input: unknown): string {
  if (input === null || input === undefined) return "";
  let str = String(input);
  str = str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ");
  str = str.normalize("NFKC");
  const safe: string[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x20 && cp !== 0x09 && cp !== 0x0a) continue;
    if (cp <= 0x024f || (cp >= 0x1e00 && cp <= 0x1eff)) {
      safe.push(ch);
      continue;
    }
    // Keep bullets, arrows, a few symbols users paste in.
    if ([0x2022, 0x2192, 0x2190, 0x2194, 0x2713, 0x00b0].includes(cp)) {
      safe.push(ch);
      continue;
    }
  }
  return safe.join("").replace(/\s+/g, " ").trim();
}

function requirePage(pdf: jsPDF, y: number, advance: () => number): number {
  if (y > PAGE.height - 90) return advance();
  return y;
}

export function buildTjaiPdf(args: TjaiPdfArgs): jsPDF {
  const { plan, metrics, answers, buyerName, issuedAt, localeLabel } = args;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const contentWidth = PAGE.width - PAGE.margin * 2;
  let pageNum = 1;

  // ── Cover ───────────────────────────────────────────────────────────
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, sanitize(`${localeLabel ?? "EN"} · TJAI Transformation Plan`));
  drawChampagneBar(pdf, PAGE.margin, 180, 140, 4);

  setText(pdf, PDF_THEME.champagne);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("PERSONAL DOSSIER", PAGE.margin, 210);

  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(34);
  const greeting = sanitize(plan.summary?.greeting || "Your Transformation Plan");
  const titleLines = wrapText(pdf, greeting || "Your Transformation Plan", contentWidth);
  let titleY = 260;
  titleLines.slice(0, 3).forEach((line) => {
    pdf.text(line, PAGE.margin, titleY);
    titleY += 40;
  });

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const insight = sanitize(plan.summary?.keyInsight ?? "");
  if (insight) {
    wrapText(pdf, insight, contentWidth - 40)
      .slice(0, 6)
      .forEach((line, i) => pdf.text(line, PAGE.margin, titleY + 20 + i * 16));
  }

  const metaY = PAGE.height - 140;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, metaY - 28, PAGE.width - PAGE.margin, metaY - 28);

  const metaItems: Array<[string, string]> = [
    ["CALORIES", `${metrics.calorieTarget} kcal`],
    ["PROTEIN", `${metrics.protein}g`],
    ["CARBS", `${metrics.carbs}g`],
    ["FAT", `${metrics.fat}g`]
  ];
  const colW = contentWidth / metaItems.length;
  metaItems.forEach(([label, value], i) => {
    const x = PAGE.margin + colW * i;
    setText(pdf, PDF_THEME.champagne);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(label, x, metaY - 12);
    setText(pdf, PDF_THEME.textPrimary);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(value, x, metaY + 4);
  });

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const ownerLine = buyerName
    ? sanitize(`Prepared for ${buyerName}`)
    : "Personal TJAI dossier";
  pdf.text(ownerLine || "Personal TJAI dossier", PAGE.margin, PAGE.height - 60);
  const issued = issuedAt ? new Date(issuedAt).toLocaleDateString() : new Date().toLocaleDateString();
  pdf.text(`Issued ${issued}`, PAGE.width - PAGE.margin, PAGE.height - 60, { align: "right" });

  drawFooter(pdf, pageNum++, "TJAI");

  // ── Overview ────────────────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(
    pdf,
    "Overview",
    sanitize(`Goal: ${String(answers.s2_goal ?? "transformation")}`)
  );

  let y = 130;
  const bullets = [
    `Calorie target: ${metrics.calorieTarget} kcal`,
    `Macros: Protein ${metrics.protein}g · Carbs ${metrics.carbs}g · Fat ${metrics.fat}g`,
    `Water: ${metrics.water} ml · Estimated body fat: ${metrics.estimatedBodyFat}%`,
    `Pace: ${metrics.weeklyWeightChange} kg/week · Time to goal: ${sanitize(metrics.timeToGoal)}`,
    `Training days: ${metrics.trainingDayCalories} kcal · Rest days: ${metrics.restDayCalories} kcal`,
    `Plateau breaker scheduled: week ${metrics.plateauWeek}`
  ];
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  bullets.forEach((b) => {
    wrapText(pdf, `• ${sanitize(b)}`, contentWidth).forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 16;
    });
  });

  const philosophy = sanitize(plan.diet?.philosophy ?? "");
  if (philosophy) {
    y += 12;
    setText(pdf, PDF_THEME.champagne);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("DIET PHILOSOPHY", PAGE.margin, y);
    y += 16;
    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    wrapText(pdf, philosophy, contentWidth).forEach((line) => {
      if (y > PAGE.height - 80) return;
      pdf.text(line, PAGE.margin, y);
      y += 14;
    });
  }

  const programPhilosophy = sanitize(plan.program?.philosophy ?? "");
  if (programPhilosophy && y < PAGE.height - 120) {
    y += 12;
    setText(pdf, PDF_THEME.champagne);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("TRAINING PHILOSOPHY", PAGE.margin, y);
    y += 16;
    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    wrapText(pdf, programPhilosophy, contentWidth).forEach((line) => {
      if (y > PAGE.height - 80) return;
      pdf.text(line, PAGE.margin, y);
      y += 14;
    });
  }

  drawFooter(pdf, pageNum++, "TJAI");

  // ── Diet ────────────────────────────────────────────────────────────
  const newDietPage = (week: { weekRange: string; phase: string; calories?: number }) => {
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(
      pdf,
      sanitize(week.weekRange),
      sanitize(`${week.phase}${week.calories ? ` · ${week.calories} kcal` : ""}`)
    );
    return 130;
  };

  (plan.diet?.weeks ?? []).forEach((week) => {
    let dy = newDietPage(week);
    (week.days ?? []).forEach((day) => {
      dy = requirePage(pdf, dy, () => {
        drawFooter(pdf, pageNum++, "TJAI · Diet");
        return newDietPage(week);
      });

      setText(pdf, PDF_THEME.champagne);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(sanitize(day.label || "").toUpperCase(), PAGE.margin, dy);
      dy += 16;

      (day.meals ?? []).forEach((meal) => {
        dy = requirePage(pdf, dy, () => {
          drawFooter(pdf, pageNum++, "TJAI · Diet");
          return newDietPage(week);
        });
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(
          sanitize(`${meal.time ? meal.time + "  " : ""}${meal.name ?? ""}`),
          PAGE.margin + 8,
          dy
        );
        dy += 12;

        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(
          sanitize(
            `${meal.calories} kcal · P ${meal.protein}g · C ${meal.carbs}g · F ${meal.fat}g`
          ),
          PAGE.margin + 16,
          dy
        );
        dy += 11;

        if (Array.isArray(meal.foods) && meal.foods.length) {
          wrapText(pdf, sanitize(meal.foods.join(", ")), contentWidth - 24).forEach((line) => {
            dy = requirePage(pdf, dy, () => {
              drawFooter(pdf, pageNum++, "TJAI · Diet");
              return newDietPage(week);
            });
            pdf.text(line, PAGE.margin + 16, dy);
            dy += 11;
          });
        }
        dy += 6;
      });
      dy += 6;
    });

    if (week.days && week.days.length) {
      drawFooter(pdf, pageNum++, "TJAI · Diet");
    }
  });

  // ── Program ─────────────────────────────────────────────────────────
  const newProgramPage = (week: { weekRange: string; phase: string; focus?: string }) => {
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(
      pdf,
      sanitize(week.weekRange),
      sanitize(`${week.phase}${week.focus ? ` · ${week.focus}` : ""}`)
    );
    return 130;
  };

  (plan.program?.weeks ?? []).forEach((week) => {
    let py = newProgramPage(week);
    (week.days ?? []).forEach((day) => {
      py = requirePage(pdf, py, () => {
        drawFooter(pdf, pageNum++, "TJAI · Program");
        return newProgramPage(week);
      });

      setText(pdf, PDF_THEME.champagne);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(sanitize(`${day.day ?? ""} — ${day.label ?? ""}`), PAGE.margin, py);
      py += 16;

      (day.exercises ?? []).forEach((ex) => {
        py = requirePage(pdf, py, () => {
          drawFooter(pdf, pageNum++, "TJAI · Program");
          return newProgramPage(week);
        });
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(sanitize(ex.name ?? ""), PAGE.margin + 8, py);

        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(
          sanitize(`${ex.sets} × ${ex.reps} · ${ex.rest ?? ""}`),
          PAGE.width - PAGE.margin,
          py,
          { align: "right" }
        );
        py += 13;

        if (ex.note) {
          wrapText(pdf, sanitize(ex.note), contentWidth - 24).forEach((line) => {
            pdf.text(line, PAGE.margin + 16, py);
            py += 11;
          });
        }
      });

      if (day.warmup || day.cooldown || day.duration) {
        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        const footer = [
          day.warmup ? `Warmup: ${day.warmup}` : null,
          day.cooldown ? `Cooldown: ${day.cooldown}` : null,
          day.duration ? `Duration: ${day.duration}` : null
        ]
          .filter(Boolean)
          .join(" · ");
        pdf.text(sanitize(footer), PAGE.margin + 8, py);
        py += 12;
      }

      py += 8;
    });

    if (week.days && week.days.length) {
      drawFooter(pdf, pageNum++, "TJAI · Program");
    }
  });

  // ── Supplements (if present) ────────────────────────────────────────
  const supps = plan.diet?.supplements;
  const hasSupps = supps && (supps.tier1?.length || supps.tier2?.length || supps.tier3?.length);
  if (hasSupps) {
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, "Supplements", "Tier 1 essentials → Tier 3 optional");
    let sy = 130;
    const renderTier = (label: string, items: typeof supps.tier1 = []) => {
      if (!items || !items.length) return;
      setText(pdf, PDF_THEME.champagne);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(label, PAGE.margin, sy);
      sy += 14;
      items.forEach((s) => {
        sy = requirePage(pdf, sy, () => {
          drawFooter(pdf, pageNum++, "TJAI · Supplements");
          pdf.addPage();
          fillPage(pdf, PDF_THEME.paper);
          drawInteriorHeader(pdf, "Supplements", "(cont.)");
          return 130;
        });
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(sanitize(s.name), PAGE.margin + 8, sy);
        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        sy += 11;
        pdf.text(
          sanitize(`${s.dose ?? ""} · ${s.timing ?? ""}${s.estimatedCost ? ` · ${s.estimatedCost}` : ""}`),
          PAGE.margin + 16,
          sy
        );
        sy += 11;
        if (s.why) {
          wrapText(pdf, sanitize(s.why), contentWidth - 24).forEach((line) => {
            pdf.text(line, PAGE.margin + 16, sy);
            sy += 11;
          });
        }
        sy += 6;
      });
      sy += 8;
    };
    renderTier("TIER 1 — ESSENTIAL", supps.tier1);
    renderTier("TIER 2 — HELPFUL", supps.tier2);
    renderTier("TIER 3 — OPTIONAL", supps.tier3);
    drawFooter(pdf, pageNum++, "TJAI · Supplements");
  }

  // ── Close ───────────────────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, "Discipline · Ritual · Legacy");
  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Train with intent.", PAGE.margin, 140);
  pdf.text("Eat with purpose.", PAGE.margin, 170);
  drawChampagneBar(pdf, PAGE.margin, 190, 80, 3);

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const notes = [
    "This dossier was generated by TJAI using your personal intake.",
    "Open the app weekly to log progress — TJAI adapts your plan from real data.",
    "Medical note: consult a physician before changing training or nutrition.",
    "Printed in Latin script for fidelity. The app continues in your selected language."
  ];
  let ny = 230;
  notes.forEach((n) => {
    wrapText(pdf, `• ${sanitize(n)}`, contentWidth).forEach((line) => {
      pdf.text(line, PAGE.margin, ny);
      ny += 14;
    });
    ny += 4;
  });

  setText(pdf, PDF_THEME.champagne);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text("tjfit.com", PAGE.margin, PAGE.height - 60);

  drawFooter(pdf, pageNum, "TJAI");

  return pdf;
}
