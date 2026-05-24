import { jsPDF } from "jspdf";

import type { Bundle } from "@/lib/bundles";
import {
  PAGE,
  PDF_THEME,
  drawAccentBar,
  drawCoverHeader,
  drawFooter,
  drawInteriorHeader,
  fillPage,
  setDraw,
  setText,
  wrapText
} from "@/lib/premium-pdf-theme";

export type BundlePdfArgs = {
  bundle: Bundle;
  buyerName?: string;
  issuedAt?: string;
  localeLabel?: string;
};

/**
 * Builds a branded multi-page PDF dossier for a bundle.
 * Sections: Cover · Overview · Training Framework · Nutrition Framework ·
 * Progression · Recovery & Habits · License.
 *
 * Generic builder — does not require a full program blueprint. Pulls everything
 * it needs from the Bundle record so all 12 bundles are downloadable today.
 */
export function buildBundlePdf(args: BundlePdfArgs): jsPDF {
  const { bundle, buyerName, issuedAt, localeLabel } = args;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const contentWidth = PAGE.width - PAGE.margin * 2;
  const issued = issuedAt ? new Date(issuedAt) : new Date();

  // ─── Cover ─────────────────────────────────────────────────────────
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, `${localeLabel ?? "EN"} · Bundle Dossier`);

  drawAccentBar(pdf, PAGE.margin, 180, 140, 4);

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(bundle.goalLabel.toUpperCase(), PAGE.margin, 210);

  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(38);
  const titleLines = wrapText(pdf, bundle.name, contentWidth);
  let titleY = 260;
  titleLines.slice(0, 3).forEach((line) => {
    pdf.text(line, PAGE.margin, titleY);
    titleY += 44;
  });

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const hookLines = wrapText(pdf, bundle.hook, contentWidth - 40);
  let hookY = titleY + 20;
  hookLines.slice(0, 6).forEach((line) => {
    pdf.text(line, PAGE.margin, hookY);
    hookY += 16;
  });

  // Meta strip
  const metaY = PAGE.height - 140;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, metaY - 28, PAGE.width - PAGE.margin, metaY - 28);

  const metaItems: Array<[string, string]> = [
    ["DURATION", `${bundle.weeks} weeks`],
    ["SESSIONS", `${bundle.sessionsPerWeek}× per week`],
    ["GOAL", bundle.goalLabel]
  ];
  const colW = contentWidth / metaItems.length;
  metaItems.forEach(([label, value], i) => {
    const x = PAGE.margin + colW * i;
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(label, x, metaY - 12);
    setText(pdf, PDF_THEME.textPrimary);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(value, x, metaY + 6);
  });

  if (buyerName) {
    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(
      `Licensed to ${buyerName} · Issued ${issued.toISOString().slice(0, 10)}`,
      PAGE.margin,
      PAGE.height - 60
    );
  }

  drawFooter(pdf, 1, "Bundle dossier");

  // ─── Page 2: Overview ──────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Overview", "What you're signing up for");

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const descLines = wrapText(pdf, bundle.description, contentWidth);
  let y = 130;
  descLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  // Pairing card
  y += 24;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 24;

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("THIS BUNDLE PAIRS", PAGE.margin, y);
  y += 18;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(bundle.programTitle, PAGE.margin, y);
  y += 20;

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text("paired with", PAGE.margin, y);
  y += 18;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(bundle.dietTitle, PAGE.margin, y);

  drawFooter(pdf, 2, bundle.name);

  // ─── Page 3: Training Framework ────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Training", bundle.programTitle);

  y = 130;
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(`${bundle.sessionsPerWeek} sessions per week · ${bundle.weeks} weeks total`, PAGE.margin, y);
  y += 28;

  bundle.phases.forEach((phase) => {
    drawAccentBar(pdf, PAGE.margin, y, 32, 3);
    y += 14;

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(phase.name, PAGE.margin, y);
    y += 18;

    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const focusLines = wrapText(pdf, phase.focus, contentWidth);
    focusLines.forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 14;
    });
    y += 16;
  });

  drawFooter(pdf, 3, bundle.name);

  // ─── Page 4: Sample Training Day ───────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Sample session", bundle.sampleTrainingDay.name);

  y = 130;
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text(
    "A representative session from the program. Loads scale to your level.",
    PAGE.margin,
    y
  );
  y += 24;

  // Defensive: if a bundle ever gains enough exercises to overflow this
  // page (~12+ with notes), spill onto a continuation page rather than
  // silently drawing past the footer. Today's bundle data fits comfortably
  // but the guard prevents future regressions.
  const continueTrainingPage = () => {
    drawFooter(pdf, 4, bundle.name);
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, "Sample session", `${bundle.sampleTrainingDay.name} (continued)`);
    y = 130;
  };
  bundle.sampleTrainingDay.exercises.forEach((ex, i) => {
    // Estimate this item's footprint before drawing.
    const noteLineCount = ex.notes ? wrapText(pdf, ex.notes, contentWidth - 60).length : 0;
    const itemHeight = 14 + noteLineCount * 12 + 16;
    if (y + itemHeight > PAGE.height - 80) {
      continueTrainingPage();
    }

    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(String(i + 1).padStart(2, "0"), PAGE.margin, y);

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    const nameLines = wrapText(pdf, ex.name, contentWidth - 200);
    pdf.text(nameLines[0] ?? ex.name, PAGE.margin + 28, y);

    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(ex.sets, PAGE.width - PAGE.margin, y, { align: "right" });

    y += 14;
    if (ex.notes) {
      setText(pdf, PDF_THEME.textMuted);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      const noteLines = wrapText(pdf, ex.notes, contentWidth - 60);
      noteLines.forEach((line) => {
        pdf.text(line, PAGE.margin + 28, y);
        y += 12;
      });
    }
    setDraw(pdf, PDF_THEME.paperMuted);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.margin, y + 4, PAGE.width - PAGE.margin, y + 4);
    y += 16;
  });

  drawFooter(pdf, 4, bundle.name);

  // ─── Page 5: Nutrition Framework ───────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Nutrition", bundle.dietTitle);

  y = 130;
  const nutritionItems: Array<[string, string]> = [
    ["STYLE", bundle.nutrition.style],
    ["PROTEIN TARGET", bundle.nutrition.proteinTarget],
    ["CALORIE BIAS", bundle.nutrition.calorieBias]
  ];

  nutritionItems.forEach(([label, value]) => {
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(label, PAGE.margin, y);
    y += 16;

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    const valueLines = wrapText(pdf, value, contentWidth);
    valueLines.forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 18;
    });
    y += 12;
  });

  y += 8;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 24;

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("NOTES", PAGE.margin, y);
  y += 16;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const noteLines = wrapText(pdf, bundle.nutrition.notes, contentWidth);
  noteLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  drawFooter(pdf, 5, bundle.name);

  // ─── Page 6: Sample Meal Day ──────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Sample day of eating", "What a real day looks like");

  y = 130;
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text(
    "Adjust portions to hit your targets. This is a template, not a prescription.",
    PAGE.margin,
    y
  );
  y += 24;

  // Same defensive page-break guard as the training-day list. Today's
  // meal-day data fits the page; future expansion (e.g. snack-heavy day
  // with longer item descriptions) would have silently overflowed.
  const continueMealPage = () => {
    drawFooter(pdf, 6, bundle.name);
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, "Daily Template", "Anchor meals by slot (continued)");
    y = 130;
  };
  bundle.sampleMealDay.forEach((meal) => {
    const itemLineCount = wrapText(pdf, meal.items, contentWidth).length;
    const itemHeight = 16 + itemLineCount * 15 + 18;
    if (y + itemHeight > PAGE.height - 80) {
      continueMealPage();
    }

    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(meal.meal.toUpperCase(), PAGE.margin, y);

    if (meal.macros) {
      setText(pdf, PDF_THEME.textMuted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(meal.macros, PAGE.width - PAGE.margin, y, { align: "right" });
    }
    y += 16;

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const itemLines = wrapText(pdf, meal.items, contentWidth);
    itemLines.forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 15;
    });

    setDraw(pdf, PDF_THEME.paperMuted);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.margin, y + 4, PAGE.width - PAGE.margin, y + 4);
    y += 18;
  });

  drawFooter(pdf, 6, bundle.name);

  // ─── New rich content sections (weekly template, progression, equipment, recipes, grocery)
  let nextPage = 7;
  const newSection = (title: string, eyebrow: string) => {
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, title, eyebrow);
    y = 130;
  };
  const closeSection = () => {
    drawFooter(pdf, nextPage, bundle.name);
    nextPage += 1;
  };

  // Weekly training template
  if (bundle.weeklyTemplate?.length) {
    newSection("Weekly template", `${bundle.sessionsPerWeek}× per week · repeat across 12 weeks`);
    bundle.weeklyTemplate.forEach((day) => {
      // Estimate footprint
      const exCount = day.exercises.length;
      const blockHeight = 70 + exCount * 14;
      if (y + blockHeight > PAGE.height - 80) {
        closeSection();
        newSection("Weekly template", `${bundle.sessionsPerWeek}× per week (continued)`);
      }
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(`${day.day.toUpperCase()} · ${day.sessionName.toUpperCase()}`, PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.textMuted);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.text(day.focus, PAGE.margin, y);
      y += 16;
      day.exercises.forEach((ex) => {
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(`· ${ex.name}`, PAGE.margin + 4, y);
        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "bold");
        pdf.text(ex.sets, PAGE.width - PAGE.margin, y, { align: "right" });
        y += 13;
      });
      y += 12;
    });
    closeSection();
  }

  // Progression phases
  if (bundle.progression?.length) {
    newSection("Progression", "How loads evolve across the 12 weeks");
    bundle.progression.forEach((p) => {
      drawAccentBar(pdf, PAGE.margin, y, 28, 3);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(`${p.phase} · Weeks ${p.weeks}`, PAGE.margin, y);
      y += 18;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("LOADING", PAGE.margin, y);
      y += 12;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      wrapText(pdf, p.loadingScheme, contentWidth).forEach((line) => {
        pdf.text(line, PAGE.margin, y);
        y += 13;
      });
      y += 4;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("INTENSITY CUE", PAGE.margin, y);
      y += 12;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      wrapText(pdf, p.intensityCue, contentWidth).forEach((line) => {
        pdf.text(line, PAGE.margin, y);
        y += 13;
      });
      y += 16;
    });
    closeSection();
  }

  // Warmup / Cooldown / Equipment
  if (bundle.warmup?.length || bundle.cooldown?.length || bundle.equipment?.length) {
    newSection("Prep & equipment", "Warm-up, cool-down, and what you need");

    const drawList = (heading: string, items: string[]) => {
      if (!items?.length) return;
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(heading, PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      items.forEach((line) => {
        wrapText(pdf, `· ${line}`, contentWidth).forEach((l) => {
          pdf.text(l, PAGE.margin, y);
          y += 13;
        });
      });
      y += 12;
    };

    if (bundle.warmup?.length) drawList("WARM-UP", bundle.warmup);
    if (bundle.cooldown?.length) drawList("COOL-DOWN", bundle.cooldown);
    if (bundle.equipment?.length) drawList("EQUIPMENT", bundle.equipment);

    closeSection();
  }

  // Recipes — one page per recipe to keep them readable
  if (bundle.recipes?.length) {
    bundle.recipes.forEach((recipe) => {
      newSection("Recipe", recipe.name);

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(`${recipe.mealType.toUpperCase()} · ${recipe.time}`, PAGE.margin, y);
      y += 20;

      // Macro strip
      const macros: Array<[string, string]> = [
        ["KCAL", String(recipe.kcal)],
        ["PROTEIN", `${recipe.protein}g`],
        ["CARBS", `${recipe.carbs}g`],
        ["FAT", `${recipe.fat}g`]
      ];
      const macW = contentWidth / macros.length;
      macros.forEach(([label, value], i) => {
        const x = PAGE.margin + macW * i;
        setText(pdf, PDF_THEME.accent);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text(label, x, y);
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(value, x, y + 16);
      });
      y += 40;

      setDraw(pdf, PDF_THEME.hairline);
      pdf.setLineWidth(0.3);
      pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
      y += 24;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("INGREDIENTS", PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      recipe.ingredients.forEach((ing) => {
        wrapText(pdf, `· ${ing}`, contentWidth).forEach((line) => {
          pdf.text(line, PAGE.margin, y);
          y += 13;
        });
      });
      y += 12;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("METHOD", PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      recipe.steps.forEach((step, i) => {
        const prefix = String(i + 1).padStart(2, "0");
        wrapText(pdf, `${prefix}  ${step}`, contentWidth).forEach((line) => {
          pdf.text(line, PAGE.margin, y);
          y += 13;
        });
        y += 4;
      });

      closeSection();
    });
  }

  // Grocery list — categorized
  if (bundle.groceryList?.length) {
    newSection("Grocery list", "One week of meals · scale to bodyweight");
    bundle.groceryList.forEach((group) => {
      const blockHeight = 24 + group.items.length * 13;
      if (y + blockHeight > PAGE.height - 80) {
        closeSection();
        newSection("Grocery list", "Continued");
      }
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(group.category.toUpperCase(), PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      group.items.forEach((it) => {
        pdf.text(`☐  ${it.item}`, PAGE.margin + 4, y);
        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "bold");
        pdf.text(it.quantity, PAGE.width - PAGE.margin, y, { align: "right" });
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "normal");
        y += 13;
      });
      y += 10;
    });
    closeSection();
  }

  // ─── Page N: Progression & How To Use (kept) ───────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Progression", "How to actually use this");

  const steps: Array<[string, string]> = [
    ["01", "Run the program 4 days a week (or as prescribed) without missing sessions in the first 4 weeks. Compliance beats optimization."],
    ["02", "Track main lifts week to week — small load or rep increases compound. If a week stalls, repeat it before progressing."],
    ["03", "Hit the protein target every day. Calories can flex by ±10% across the week; protein cannot."],
    ["04", "Use the phase boundaries as decision points: progress, repeat, or deload. Don't add work; sharpen what's there."],
    ["05", "At week 12, retest a benchmark (top set, body comp photo, conditioning piece) before deciding what's next."]
  ];

  y = 130;
  steps.forEach(([num, text]) => {
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(num, PAGE.margin, y);

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const lines = wrapText(pdf, text, contentWidth - 50);
    let stepY = y - 4;
    lines.forEach((line) => {
      pdf.text(line, PAGE.margin + 44, stepY);
      stepY += 14;
    });
    y = Math.max(y + 26, stepY + 16);
  });

  drawFooter(pdf, nextPage, bundle.name);
  nextPage += 1;

  // ─── Recovery & License ────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Recovery", "Sleep, stress, and the part most people skip");

  const recovery = [
    "Sleep is the first lever. Aim for 7-9 hours. Track it for 2 weeks if you've never measured.",
    "Walk daily. 6-8k steps minimum on training days, 8-10k on rest days. NEAT is half the body comp game.",
    "Mobility: 10 minutes of targeted work before lifts, 5 minutes post. Hips, shoulders, T-spine.",
    "One full rest day per week. No optional add-ons. The day is the work.",
    "Stress load is real. If life is loud, reduce training volume 20% — not intensity."
  ];

  y = 130;
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  recovery.forEach((line) => {
    const lines = wrapText(pdf, `· ${line}`, contentWidth);
    lines.forEach((l) => {
      pdf.text(l, PAGE.margin, y);
      y += 16;
    });
    y += 6;
  });

  // License block
  y = PAGE.height - 180;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 24;

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("LICENSE", PAGE.margin, y);
  y += 16;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const license =
    "This bundle is licensed for personal use. Reselling, redistributing, or rebranding any part of this document is prohibited. Coaches and affiliates: ask about white-label terms at tjfit.org.";
  const licenseLines = wrapText(pdf, license, contentWidth);
  licenseLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 13;
  });

  drawFooter(pdf, nextPage, bundle.name);

  return pdf;
}
