"""Generic TJFit bundle PDF renderer — converts a markdown program or diet
into a branded, dark-theme PDF. Reusable for all 12 programs and 12 diets.

Usage:
  python scripts/build-bundle-pdf.py \
      --md docs/programs/fat-loss-12w.md \
      --out docs/programs-pdf/fat-loss-12w.pdf \
      --title "Fat Loss" \
      --subtitle "12-Week Concurrent Block" \
      --tagline "Flagship  ·  Intermediate  ·  Gym  ·  6 days per week" \
      --header "TJFIT   ·   FAT LOSS  ·  12-WEEK MESOCYCLE" \
      --right "Flagship Program" \
      --kind "PREMIUM TRAINING" \
      --bullets "Concurrent training: 4 lifting days, 2 conditioning days, 1 walk" \
                "Preservation volume — Minimum Effective Volume range" \
                "Two programmed deloads (Week 5 and Week 9)" \
                "Weekly refeed from Week 5 to protect metabolic rate"
"""
from __future__ import annotations
import argparse
import html as ihtml
import re
from pathlib import Path

import markdown as md
from bs4 import BeautifulSoup, NavigableString, Tag

from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    NextPageTemplate, PageTemplate, Frame
)
from reportlab.pdfgen import canvas


# ---------- Brand palette ----------
BG          = colors.HexColor("#05080F")
BG_PANEL    = colors.HexColor("#0B1426")
BG_PANEL_2  = colors.HexColor("#0F1B30")
HEADER_BG   = colors.HexColor("#001A24")
CYAN        = colors.HexColor("#22D3EE")
CYAN_SOFT   = colors.HexColor("#67E8F9")
BLUE        = colors.HexColor("#3B82F6")
INK         = colors.HexColor("#E2E8F0")
INK_DIM     = colors.HexColor("#94A3B8")
INK_FAINT   = colors.HexColor("#64748B")
HAIRLINE    = colors.HexColor("#1E293B")
WHITE       = colors.white


# ---------- Styles ----------
H1 = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=24, leading=28,
                    textColor=WHITE, spaceAfter=12, spaceBefore=4)
H2 = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=16, leading=20,
                    textColor=CYAN, spaceAfter=10, spaceBefore=18)
H3 = ParagraphStyle("H3", fontName="Helvetica-Bold", fontSize=13, leading=17,
                    textColor=WHITE, spaceAfter=6, spaceBefore=14)
H4 = ParagraphStyle("H4", fontName="Helvetica-Bold", fontSize=11, leading=14,
                    textColor=CYAN_SOFT, spaceAfter=4, spaceBefore=8)
BODY = ParagraphStyle("BODY", fontName="Helvetica", fontSize=10, leading=14.5,
                      textColor=INK, spaceAfter=6, alignment=TA_LEFT)
SMALL = ParagraphStyle("SMALL", parent=BODY, fontSize=9, leading=12,
                       textColor=INK_DIM)
TH_STYLE = ParagraphStyle("TH", fontName="Helvetica-Bold", fontSize=9, leading=11,
                          textColor=CYAN, alignment=TA_LEFT)
TD_STYLE = ParagraphStyle("TD", fontName="Helvetica", fontSize=9, leading=12,
                          textColor=INK, alignment=TA_LEFT)


# ---------- Cover and page chrome (closure factory so CLI args are bound) ----------
def make_cover(title: str, subtitle: str, tagline: str, kind: str, bullets: list[str]):
    def cover_page(c: canvas.Canvas, doc):
        w, h = LETTER
        c.setFillColor(BG); c.rect(0, 0, w, h, fill=1, stroke=0)
        # Left accent bar
        c.setFillColor(CYAN); c.rect(0.0, 0.0, 0.18 * inch, h, fill=1, stroke=0)
        # Brand line
        c.setFillColor(CYAN); c.setFont("Helvetica-Bold", 11)
        c.drawString(0.95 * inch, h - 0.9 * inch, f"TJFIT  ·  {kind}")
        # Title
        c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 52)
        c.drawString(0.6 * inch, h - 3.2 * inch, title)
        c.setFillColor(CYAN); c.setFont("Helvetica-Bold", 28)
        c.drawString(0.6 * inch, h - 3.85 * inch, subtitle)
        # Tagline
        c.setFillColor(INK); c.setFont("Helvetica", 14)
        c.drawString(0.6 * inch, h - 4.4 * inch, tagline)
        # Bullets
        c.setFillColor(INK_DIM); c.setFont("Helvetica", 11)
        y = h - 5.2 * inch
        for b in bullets:
            c.setFillColor(CYAN); c.circle(0.68 * inch, y + 4, 2, fill=1, stroke=0)
            c.setFillColor(INK_DIM); c.drawString(0.95 * inch, y, b)
            y -= 0.32 * inch
        # Footer
        c.setStrokeColor(CYAN); c.setLineWidth(2)
        c.line(0.6 * inch, 1.0 * inch, 2.6 * inch, 1.0 * inch)
        c.setFillColor(INK_DIM); c.setFont("Helvetica", 9)
        c.drawString(0.6 * inch, 0.75 * inch, "tjfit.org   ·   Version 1.0.0   ·   © TJFit")
    return cover_page


def make_inner(header_left: str, header_right: str):
    def inner_page(c: canvas.Canvas, doc):
        w, h = LETTER
        c.setFillColor(BG); c.rect(0, 0, w, h, fill=1, stroke=0)
        c.setStrokeColor(CYAN); c.setLineWidth(1.2)
        c.line(0.6 * inch, h - 0.55 * inch, w - 0.6 * inch, h - 0.55 * inch)
        c.setFillColor(CYAN); c.setFont("Helvetica-Bold", 8)
        c.drawString(0.6 * inch, h - 0.42 * inch, header_left)
        c.setFillColor(INK_DIM); c.setFont("Helvetica", 8)
        c.drawRightString(w - 0.6 * inch, h - 0.42 * inch, header_right)
        c.setStrokeColor(HAIRLINE); c.setLineWidth(0.5)
        c.line(0.6 * inch, 0.55 * inch, w - 0.6 * inch, 0.55 * inch)
        c.setFillColor(INK_FAINT); c.setFont("Helvetica", 8)
        c.drawString(0.6 * inch, 0.4 * inch, "tjfit.org")
        c.drawRightString(w - 0.6 * inch, 0.4 * inch, f"Page {doc.page - 1}")
    return inner_page


# ---------- Markdown → flowables ----------
def inline_markup(node) -> str:
    if isinstance(node, NavigableString):
        return ihtml.escape(str(node))
    parts = []
    for child in node.children:
        if isinstance(child, NavigableString):
            parts.append(ihtml.escape(str(child)))
        elif isinstance(child, Tag):
            name = child.name.lower()
            inner = inline_markup(child)
            if name in ("strong", "b"):
                parts.append(f'<b><font color="#FFFFFF">{inner}</font></b>')
            elif name in ("em", "i"):
                parts.append(f"<i>{inner}</i>")
            elif name == "code":
                parts.append(f'<font face="Courier" color="#67E8F9">{inner}</font>')
            elif name == "br":
                parts.append("<br/>")
            elif name == "a":
                href = child.get("href", "")
                parts.append(f'<a href="{href}" color="#3B82F6">{inner}</a>')
            elif name == "del":
                parts.append(f"<strike>{inner}</strike>")
            else:
                parts.append(inner)
    return "".join(parts)


def render_table(tag: Tag):
    rows = []
    thead = tag.find("thead")
    header_cells = []
    if thead:
        for th in thead.find_all("th"):
            header_cells.append(Paragraph(inline_markup(th), TH_STYLE))
        rows.append(header_cells)
    tbody = tag.find("tbody") or tag
    for tr in tbody.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue
        rows.append([Paragraph(inline_markup(c), TD_STYLE) for c in cells])

    if not rows:
        return None
    ncols = max(len(r) for r in rows)
    for r in rows:
        while len(r) < ncols:
            r.append(Paragraph("", TD_STYLE))

    page_w = LETTER[0] - 1.2 * inch
    col_w = page_w / ncols
    t = Table(rows, colWidths=[col_w] * ncols, repeatRows=1 if header_cells else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, HAIRLINE),
    ]
    if header_cells:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
            ("LINEBELOW", (0, 0), (-1, 0), 1, CYAN),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_PANEL, BG_PANEL_2]),
        ]
    else:
        style += [
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [BG_PANEL, BG_PANEL_2]),
        ]
    t.setStyle(TableStyle(style))
    return t


def render_list(tag: Tag, ordered: bool, depth: int = 0):
    rows = []
    counter = 0
    for li in tag.find_all("li", recursive=False):
        counter += 1
        marker = f"{counter}." if ordered else "●"
        inline_html = ""
        nested = []
        for child in li.children:
            if isinstance(child, NavigableString):
                inline_html += ihtml.escape(str(child))
            elif isinstance(child, Tag):
                if child.name.lower() in ("ul", "ol"):
                    nested.append(child)
                else:
                    inline_html += inline_markup(child)
        marker_style = ParagraphStyle(
            "MK", parent=BODY, textColor=CYAN, fontName="Helvetica-Bold")
        rows.append([
            Paragraph(marker, marker_style),
            Paragraph(inline_html.strip() or "&nbsp;", BODY),
        ])
        for nested_list in nested:
            sub = render_list(nested_list, nested_list.name.lower() == "ol", depth + 1)
            rows.append(["", sub])
    if not rows:
        return None
    page_w = LETTER[0] - 1.2 * inch
    t = Table(rows, colWidths=[0.3 * inch, page_w - 0.3 * inch])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


def walk(soup: BeautifulSoup):
    flowables = []
    body = soup.body if soup.body else soup
    for el in body.children:
        if isinstance(el, NavigableString):
            txt = str(el).strip()
            if txt:
                flowables.append(Paragraph(ihtml.escape(txt), BODY))
            continue
        if not isinstance(el, Tag):
            continue
        name = el.name.lower()
        if name == "h1":
            flowables.append(Paragraph(inline_markup(el), H1))
        elif name == "h2":
            flowables.append(Paragraph(inline_markup(el), H2))
        elif name == "h3":
            flowables.append(Paragraph(inline_markup(el), H3))
        elif name in ("h4", "h5", "h6"):
            flowables.append(Paragraph(inline_markup(el), H4))
        elif name == "p":
            text = inline_markup(el).strip()
            if text:
                flowables.append(Paragraph(text, BODY))
        elif name == "ul":
            t = render_list(el, False)
            if t: flowables.append(t)
            flowables.append(Spacer(1, 4))
        elif name == "ol":
            t = render_list(el, True)
            if t: flowables.append(t)
            flowables.append(Spacer(1, 4))
        elif name == "table":
            t = render_table(el)
            if t:
                flowables.append(t)
                flowables.append(Spacer(1, 8))
        elif name == "hr":
            flowables.append(Spacer(1, 6))
            d = Table([[""]], colWidths=[LETTER[0] - 1.2 * inch], rowHeights=[0.5])
            d.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.4, HAIRLINE)]))
            flowables.append(d)
            flowables.append(Spacer(1, 6))
        elif name == "blockquote":
            style = ParagraphStyle("BQ", parent=BODY, leftIndent=12, textColor=INK_DIM,
                                   borderPadding=6, fontName="Helvetica-Oblique")
            flowables.append(Paragraph(inline_markup(el), style))
        else:
            text = inline_markup(el).strip()
            if text:
                flowables.append(Paragraph(text, BODY))
    return flowables


# ---------- Build ----------
def build(md_path: Path, out_path: Path, title: str, subtitle: str,
          tagline: str, header_left: str, header_right: str,
          kind: str, bullets: list[str]):
    text = md_path.read_text(encoding="utf-8")
    # Drop the doc's top H1 (already on cover)
    text = re.sub(r"^# .+\n", "", text, count=1)
    html = md.markdown(text, extensions=["tables", "fenced_code", "sane_lists"])
    soup = BeautifulSoup(f"<body>{html}</body>", "html.parser")
    flowables = walk(soup)

    PAGE_W, PAGE_H = LETTER
    LEFT, RIGHT, TOP, BOTTOM = 0.6 * inch, 0.6 * inch, 0.85 * inch, 0.75 * inch
    inner_frame = Frame(LEFT, BOTTOM, PAGE_W - LEFT - RIGHT, PAGE_H - TOP - BOTTOM,
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                        id="inner")
    cover_frame = Frame(0, 0, 0.01, 0.01, id="coverframe")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(out_path), pagesize=LETTER,
        title=f"TJFit · {title} {subtitle}", author="TJFit",
        leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM,
    )
    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame],
                     onPage=make_cover(title, subtitle, tagline, kind, bullets)),
        PageTemplate(id="Inner", frames=[inner_frame],
                     onPage=make_inner(header_left, header_right)),
    ])
    story = [NextPageTemplate("Inner"), PageBreak()] + flowables
    doc.build(story)
    print(f"OK -> {out_path}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--md", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--title", required=True)
    p.add_argument("--subtitle", required=True)
    p.add_argument("--tagline", required=True)
    p.add_argument("--header", required=True)
    p.add_argument("--right", default="Flagship Program")
    p.add_argument("--kind", default="PREMIUM TRAINING")
    p.add_argument("--bullets", nargs="+", required=True)
    args = p.parse_args()
    build(Path(args.md), Path(args.out), args.title, args.subtitle,
          args.tagline, args.header, args.right, args.kind, args.bullets)


if __name__ == "__main__":
    main()
