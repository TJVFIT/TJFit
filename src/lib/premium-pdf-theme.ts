import type { jsPDF } from "jspdf";

/**
 * Editorial obsidian + champagne PDF theme shared by program and diet PDFs.
 * Colors mirror TJ_PALETTE so printed artifacts match on-site branding.
 */
export const PDF_THEME = {
  obsidian: { r: 8, g: 8, b: 10 },
  ink: { r: 24, g: 24, b: 28 },
  champagne: { r: 34, g: 211, b: 238 },
  champagneHi: { r: 165, g: 243, b: 252 },
  roseGold: { r: 103, g: 232, b: 249 },
  paper: { r: 248, g: 245, b: 239 },
  paperMuted: { r: 232, g: 226, b: 215 },
  textPrimary: { r: 246, g: 243, b: 237 },
  textMuted: { r: 168, g: 162, b: 148 },
  hairline: { r: 21, g: 94, b: 117 }
} as const;

export const PAGE = { width: 595, height: 842, margin: 48 } as const;

type RGB = { r: number; g: number; b: number };

export function fillPage(pdf: jsPDF, color: RGB) {
  pdf.setFillColor(color.r, color.g, color.b);
  pdf.rect(0, 0, PAGE.width, PAGE.height, "F");
}

export function setText(pdf: jsPDF, color: RGB) {
  pdf.setTextColor(color.r, color.g, color.b);
}

export function setDraw(pdf: jsPDF, color: RGB) {
  pdf.setDrawColor(color.r, color.g, color.b);
}

/** Editorial hairline + champagne wordmark header. */
export function drawCoverHeader(pdf: jsPDF, subtitle: string) {
  setDraw(pdf, PDF_THEME.champagne);
  pdf.setLineWidth(0.6);
  pdf.line(PAGE.margin, 48, PAGE.width - PAGE.margin, 48);

  setText(pdf, PDF_THEME.champagne);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("TJFIT", PAGE.margin, 40);

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(subtitle.toUpperCase(), PAGE.width - PAGE.margin, 40, { align: "right" });
}

/** Interior page header — lighter, left-aligned eyebrow + rule. */
export function drawInteriorHeader(pdf: jsPDF, eyebrow: string, title: string) {
  setText(pdf, PDF_THEME.champagne);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(eyebrow.toUpperCase(), PAGE.margin, 52);

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text(title, PAGE.margin, 82);

  setDraw(pdf, PDF_THEME.champagne);
  pdf.setLineWidth(0.4);
  pdf.line(PAGE.margin, 94, PAGE.margin + 56, 94);
}

/** Footer — page number + champagne serif mark. */
export function drawFooter(pdf: jsPDF, pageNum: number, totalHint?: string) {
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text(`tjfit.org · ${totalHint ?? "Premium program"}`, PAGE.margin, PAGE.height - 28);
  pdf.text(`${pageNum}`, PAGE.width - PAGE.margin, PAGE.height - 28, { align: "right" });
}

/** Champagne gradient bar approximated via stacked rects (jsPDF has no gradients). */
export function drawChampagneBar(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  const steps = 18;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(PDF_THEME.champagneHi.r + (PDF_THEME.roseGold.r - PDF_THEME.champagneHi.r) * t);
    const g = Math.round(PDF_THEME.champagneHi.g + (PDF_THEME.roseGold.g - PDF_THEME.champagneHi.g) * t);
    const b = Math.round(PDF_THEME.champagneHi.b + (PDF_THEME.roseGold.b - PDF_THEME.champagneHi.b) * t);
    pdf.setFillColor(r, g, b);
    pdf.rect(x + (w * i) / steps, y, w / steps + 0.5, h, "F");
  }
}

/** Wraps text to a max width and returns the lines. */
export function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  return pdf.splitTextToSize(text, maxWidth) as string[];
}
