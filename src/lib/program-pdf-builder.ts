import { jsPDF } from "jspdf";

import type { Program } from "@/lib/content";
import type { ProgramBlueprint } from "@/lib/program-blueprints";
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

export type ProgramPdfArgs = {
  program: Program;
  blueprint?: ProgramBlueprint;
  buyerName?: string;
  issuedAt?: string;
  localeLabel?: string;
};

/**
 * Builds an editorial, obsidian+accent PDF for a purchased program.
 * Output: jsPDF instance — caller decides output format (blob/buffer/arraybuffer).
 */
export function buildProgramPdf(args: ProgramPdfArgs): jsPDF {
  const { program, blueprint, buyerName, issuedAt, localeLabel } = args;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const contentWidth = PAGE.width - PAGE.margin * 2;

  // ─── Cover ─────────────────────────────────────────────────────────
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, `${localeLabel ?? "EN"} · Program Dossier`);

  // Accent bar
  drawAccentBar(pdf, PAGE.margin, 180, 140, 4);

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(program.category.toUpperCase(), PAGE.margin, 210);

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

  const metaItems: Array<[string, string]> = [
    ["DURATION", program.duration],
    ["LEVEL", program.difficulty],
    ["FORMAT", program.requiredEquipment.length ? "Equipment-based" : "Bodyweight"]
  ];
  const colW = contentWidth / metaItems.length;
  metaItems.forEach(([label, value], i) => {
    const x = PAGE.margin + colW * i;
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(label, x, metaY - 12);
    setText(pdf, PDF_THEME.textPrimary);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(value, x, metaY + 4);
  });

  // Ownership line
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const owner = buyerName ? `Prepared for ${buyerName}` : "Premium program dossier";
  pdf.text(owner, PAGE.margin, PAGE.height - 60);
  const issued = issuedAt ? new Date(issuedAt).toLocaleDateString() : new Date().toLocaleDateString();
  pdf.text(`Issued ${issued}`, PAGE.width - PAGE.margin, PAGE.height - 60, { align: "right" });

  drawFooter(pdf, 1, program.category);

  // ─── Plan Overview ─────────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, "Plan Overview", "Your dossier at a glance");

  let y = 130;
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const overviewLines = wrapText(
    pdf,
    blueprint?.goal
      ? `Goal: ${blueprint.goal}. ${program.description}`
      : program.description,
    contentWidth
  );
  overviewLines.forEach((line) => {
    if (y > PAGE.height - 100) return;
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  if (blueprint) {
    y += 20;
    const meta: Array<[string, string]> = [
      ["Goal", blueprint.goal],
      ["Level", blueprint.level],
      ["Equipment", blueprint.equipment]
    ];
    meta.forEach(([k, v]) => {
      if (y > PAGE.height - 80) return;
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(k.toUpperCase(), PAGE.margin, y);
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      const vLines = wrapText(pdf, v, contentWidth - 90);
      vLines.forEach((line, i) => {
        pdf.text(line, PAGE.margin + 90, y + i * 14);
      });
      y += Math.max(20, vLines.length * 14 + 8);
    });
  }

  drawFooter(pdf, 2, program.category);

  // ─── Phase pages ───────────────────────────────────────────────────
  let pageNum = 3;
  if (blueprint?.weeklyPhases?.length) {
    blueprint.weeklyPhases.forEach((phase, idx) => {
      pdf.addPage();
      fillPage(pdf, PDF_THEME.paper);
      drawInteriorHeader(pdf, `Phase ${idx + 1}`, phase.title);

      let py = 130;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(11);
      const focusLines = wrapText(pdf, phase.focus, contentWidth);
      focusLines.forEach((line) => {
        pdf.text(line, PAGE.margin, py);
        py += 15;
      });
      py += 10;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("TRAINING DAYS", PAGE.margin, py);
      py += 14;

      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      phase.trainingDays.forEach((day) => {
        if (py > PAGE.height - 180) return;
        const lines = wrapText(pdf, `· ${day}`, contentWidth);
        lines.forEach((line) => {
          pdf.text(line, PAGE.margin, py);
          py += 13;
        });
        py += 2;
      });

      py += 10;
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("CONDITIONING & RECOVERY", PAGE.margin, py);
      py += 14;

      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      phase.conditioning.forEach((item) => {
        if (py > PAGE.height - 80) return;
        const lines = wrapText(pdf, `· ${item}`, contentWidth);
        lines.forEach((line) => {
          pdf.text(line, PAGE.margin, py);
          py += 13;
        });
        py += 2;
      });

      drawFooter(pdf, pageNum, program.category);
      pageNum += 1;
    });
  }

  // ─── Safety / Close ────────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, "Safety · Recovery · Next Steps");

  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Train with discipline.", PAGE.margin, 140);
  pdf.setFontSize(22);
  pdf.text("Recover with intent.", PAGE.margin, 170);

  drawAccentBar(pdf, PAGE.margin, 190, 80, 3);

  let sy = 230;
  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("SAFETY CHECKPOINTS", PAGE.margin, sy);
  sy += 18;

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const safety = blueprint?.safety ?? [
    "Warm up 5-10 minutes before every session.",
    "Stop immediately if you feel sharp pain or dizziness.",
    "Scale load and volume before chasing intensity.",
    "Sleep 7-9 hours; hydrate throughout the day."
  ];
  safety.forEach((item) => {
    if (sy > PAGE.height - 120) return;
    const lines = wrapText(pdf, `· ${item}`, contentWidth);
    lines.forEach((line) => {
      pdf.text(line, PAGE.margin, sy);
      sy += 14;
    });
    sy += 2;
  });

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text("Discipline. Ritual. Legacy.", PAGE.margin, PAGE.height - 60);

  drawFooter(pdf, pageNum, program.category);

  return pdf;
}
