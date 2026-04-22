import { jsPDF } from "jspdf";

import type { Program } from "@/lib/content";
import { getDietCalorieSpec, getDietPhase } from "@/lib/diet-catalog";
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

export type DietPdfArgs = {
  program: Program;
  buyerName?: string;
  issuedAt?: string;
  localeLabel?: string;
};

/** Seed a reasonable default meal template per phase — swapped per buyer intake in TJAI flow. */
function defaultMealTemplate(phase: "cutting" | "bulking") {
  if (phase === "cutting") {
    return [
      { slot: "07:30", label: "Protein start", items: "Oats 50g + whey 1 scoop + blueberries", macros: "380 kcal · P32 C50 F6" },
      { slot: "10:30", label: "Anchor snack", items: "Greek yogurt 200g + almonds 20g", macros: "260 kcal · P22 C14 F12" },
      { slot: "13:00", label: "Core lunch", items: "Chicken 170g + rice 80g dry + greens", macros: "520 kcal · P48 C60 F8" },
      { slot: "16:00", label: "Pre-train", items: "Rice cakes 2 + whey 1 scoop + banana", macros: "320 kcal · P27 C48 F3" },
      { slot: "19:30", label: "Dinner", items: "Lean beef 150g or salmon 160g + potato 200g + veg", macros: "520 kcal · P42 C48 F16" },
      { slot: "22:00", label: "Sleep snack", items: "Cottage cheese 150g + berries", macros: "180 kcal · P22 C10 F4" }
    ];
  }
  return [
    { slot: "07:30", label: "Heavy start", items: "Oats 100g + whey + peanut butter 20g + banana", macros: "720 kcal · P42 C92 F22" },
    { slot: "10:30", label: "Meal 2", items: "Turkey 120g + wrap + avocado 40g", macros: "540 kcal · P38 C52 F18" },
    { slot: "13:00", label: "Core lunch", items: "Beef 200g + rice 120g dry + olive oil + veg", macros: "820 kcal · P58 C95 F22" },
    { slot: "16:00", label: "Pre-train", items: "Bagel + whey 1 scoop + honey", macros: "480 kcal · P30 C72 F5" },
    { slot: "19:30", label: "Dinner", items: "Salmon 200g or steak 200g + sweet potato 250g", macros: "780 kcal · P54 C72 F28" },
    { slot: "22:00", label: "Sleep meal", items: "Casein 1 scoop + Greek yogurt + nuts", macros: "380 kcal · P38 C18 F14" }
  ];
}

function weeklyStructure(phase: "cutting" | "bulking") {
  const base = [
    { day: "Mon", theme: phase === "cutting" ? "Lean baseline" : "High-carb push", variation: "Standard macro split" },
    { day: "Tue", theme: "Training day", variation: phase === "cutting" ? "+50g carbs around session" : "+100g carbs around session" },
    { day: "Wed", theme: "Recovery", variation: "Reduce carbs 10%, increase fats 10g" },
    { day: "Thu", theme: "Training day", variation: phase === "cutting" ? "+50g carbs around session" : "+100g carbs around session" },
    { day: "Fri", theme: "Standard", variation: "Normal macros" },
    { day: "Sat", theme: phase === "cutting" ? "Social flex" : "Surplus peak", variation: phase === "cutting" ? "1 flexible meal (300 kcal)" : "+200 kcal vs baseline" },
    { day: "Sun", theme: "Prep & reset", variation: "Meal prep block + lighter meals" }
  ];
  return base;
}

export function buildDietPdf(args: DietPdfArgs): jsPDF {
  const { program, buyerName, issuedAt, localeLabel } = args;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const contentWidth = PAGE.width - PAGE.margin * 2;
  const phase = getDietPhase(program);
  const calorieSpec = getDietCalorieSpec(program);

  // ─── Cover ─────────────────────────────────────────────────────────
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, `${localeLabel ?? "EN"} · Nutrition Dossier`);

  drawChampagneBar(pdf, PAGE.margin, 180, 140, 4);

  setText(pdf, PDF_THEME.champagne);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(phase === "cutting" ? "CUTTING PROTOCOL" : "MASS PROTOCOL", PAGE.margin, 210);

  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(38);
  const titleLines = wrapText(pdf, program.title, contentWidth);
  let titleY = 260;
  titleLines.slice(0, 3).forEach((line) => {
    pdf.text(line, PAGE.margin, titleY);
    titleY += 44;
  });

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const descLines = wrapText(pdf, program.description, contentWidth - 40);
  let descY = titleY + 20;
  descLines.slice(0, 6).forEach((line) => {
    pdf.text(line, PAGE.margin, descY);
    descY += 16;
  });

  // Meta strip
  const metaY = PAGE.height - 140;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, metaY - 28, PAGE.width - PAGE.margin, metaY - 28);

  const calorieLabel = !calorieSpec
    ? "Adaptive"
    : calorieSpec.mode === "target"
      ? `${calorieSpec.kcal} kcal`
      : `${calorieSpec.min}-${calorieSpec.max} kcal`;

  const metaItems: Array<[string, string]> = [
    ["DURATION", program.duration],
    ["LEVEL", program.difficulty],
    ["DAILY TARGET", calorieLabel]
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
  const owner = buyerName ? `Prepared for ${buyerName}` : "Premium nutrition dossier";
  pdf.text(owner, PAGE.margin, PAGE.height - 60);
  const issued = issuedAt ? new Date(issuedAt).toLocaleDateString() : new Date().toLocaleDateString();
  pdf.text(`Issued ${issued}`, PAGE.width - PAGE.margin, PAGE.height - 60, { align: "right" });

  drawFooter(pdf, 1, "Nutrition");

  // ─── Philosophy / Overview ────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Philosophy", phase === "cutting" ? "Lose fat, keep muscle" : "Build mass, stay lean");

  let y = 130;
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const philosophy =
    phase === "cutting"
      ? "Sustained deficit with high-protein anchor meals, strategic carbs around training, and recovery-focused fats. Hydration and sleep are non-negotiable."
      : "Controlled surplus with protein-forward anchors, carb-loaded training windows, and dense whole-food meals. The goal is usable muscle, not puffiness.";
  const pLines = wrapText(pdf, philosophy, contentWidth);
  pLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  y += 18;
  const overviewLines = wrapText(pdf, program.description, contentWidth);
  overviewLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  drawFooter(pdf, 2, "Nutrition");

  // ─── Weekly Structure ─────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Weekly Structure", "7-day calorie shape");

  const structure = weeklyStructure(phase);
  let wy = 130;
  structure.forEach((row) => {
    setText(pdf, PDF_THEME.champagne);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(row.day.toUpperCase(), PAGE.margin, wy);
    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(row.theme, PAGE.margin + 60, wy);
    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(row.variation, PAGE.margin + 60, wy + 14);
    setDraw(pdf, PDF_THEME.paperMuted);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.margin, wy + 26, PAGE.width - PAGE.margin, wy + 26);
    wy += 38;
  });

  drawFooter(pdf, 3, "Nutrition");

  // ─── Meal Template ────────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Daily Template", "Anchor meals by slot");

  const meals = defaultMealTemplate(phase);
  let my = 130;
  meals.forEach((m) => {
    setText(pdf, PDF_THEME.champagne);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(m.slot, PAGE.margin, my);

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(m.label, PAGE.margin + 54, my);

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const itemLines = wrapText(pdf, m.items, contentWidth - 54);
    itemLines.forEach((line, i) => {
      pdf.text(line, PAGE.margin + 54, my + 14 + i * 13);
    });
    const itemH = itemLines.length * 13;

    setText(pdf, PDF_THEME.roseGold);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.text(m.macros, PAGE.margin + 54, my + 18 + itemH);

    setDraw(pdf, PDF_THEME.paperMuted);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.margin, my + 30 + itemH, PAGE.width - PAGE.margin, my + 30 + itemH);
    my += 42 + itemH;
  });

  drawFooter(pdf, 4, "Nutrition");

  // ─── Swaps / Shopping / Close ─────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, "Swaps · Shopping · Reset");

  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Eat with intent.", PAGE.margin, 140);
  pdf.text("Adjust with data.", PAGE.margin, 170);

  drawChampagneBar(pdf, PAGE.margin, 190, 80, 3);

  const tips = [
    "Weigh in 3 mornings per week, same conditions. Adjust calories every 2 weeks.",
    "Swap protein sources 1:1 by weight (chicken ↔ turkey ↔ white fish; beef ↔ salmon).",
    "Rotate carbs across rice, oats, potato, pasta — glycogen loves variety.",
    "Drink 35-45 ml/kg bodyweight of water daily. More on training days.",
    "If weight stalls 14 days: subtract 150 kcal (cut) or add 200 kcal (bulk)."
  ];
  let ty = 230;
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  tips.forEach((tip) => {
    const lines = wrapText(pdf, `· ${tip}`, contentWidth);
    lines.forEach((line) => {
      pdf.text(line, PAGE.margin, ty);
      ty += 14;
    });
    ty += 4;
  });

  setText(pdf, PDF_THEME.champagne);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text("Discipline. Ritual. Legacy.", PAGE.margin, PAGE.height - 60);

  drawFooter(pdf, 5, "Nutrition");

  return pdf;
}
