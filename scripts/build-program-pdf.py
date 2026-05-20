"""Build the Hypertrophy 12-Week program PDF — premium dark theme, cyan/blue/black."""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    NextPageTemplate, PageTemplate, Frame, FrameBreak
)
from reportlab.pdfgen import canvas
import os

# ---------- Brand palette (dark) ----------
BG          = colors.HexColor("#05080F")   # near-black page background
BG_PANEL    = colors.HexColor("#0B1426")   # card / row alt
BG_PANEL_2  = colors.HexColor("#0F1B30")   # row alt 2
HEADER_BG   = colors.HexColor("#001A24")   # table header strip (deep teal-black)
CYAN        = colors.HexColor("#22D3EE")   # primary accent
CYAN_SOFT   = colors.HexColor("#67E8F9")
BLUE        = colors.HexColor("#3B82F6")   # secondary accent
INK         = colors.HexColor("#E2E8F0")   # primary text
INK_DIM     = colors.HexColor("#94A3B8")   # secondary text
INK_FAINT   = colors.HexColor("#64748B")
HAIRLINE    = colors.HexColor("#1E293B")   # subtle divider
DELOAD_BG   = colors.HexColor("#06202B")   # deload row tint
WHITE       = colors.white

OUTPUT = os.path.join("docs", "programs-pdf", "hypertrophy-12w.pdf")
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

# ---------- Styles ----------
styles = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
                    fontSize=24, leading=28, textColor=WHITE, spaceAfter=10, spaceBefore=2)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                    fontSize=15, leading=19, textColor=CYAN, spaceAfter=10, spaceBefore=14)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Helvetica-Bold",
                    fontSize=12, leading=16, textColor=WHITE, spaceAfter=4, spaceBefore=12)
BODY = ParagraphStyle("BODY", parent=styles["BodyText"], fontName="Helvetica",
                      fontSize=10, leading=15, textColor=INK, spaceAfter=6, alignment=TA_LEFT)
BODY_W = ParagraphStyle("BW", parent=BODY, textColor=WHITE)
MUTED_S = ParagraphStyle("MUTED", parent=BODY, textColor=INK_DIM, fontSize=9, leading=12)
KEY = ParagraphStyle("KEY", parent=BODY, fontName="Helvetica-Bold", textColor=CYAN, fontSize=10)
VAL = ParagraphStyle("VAL", parent=BODY, textColor=INK)
EVKEY = ParagraphStyle("EVKEY", parent=BODY, fontName="Helvetica-Bold", textColor=CYAN_SOFT)
EVLINK = ParagraphStyle("EVLINK", parent=MUTED_S, textColor=BLUE)

# ---------- Page background ----------
def paint_bg(c: canvas.Canvas):
    w, h = LETTER
    c.setFillColor(BG)
    c.rect(0, 0, w, h, fill=1, stroke=0)

# ---------- Cover (page 1) ----------
def cover_page(c: canvas.Canvas, doc):
    w, h = LETTER
    paint_bg(c)

    # Vertical cyan accent bar (left edge)
    c.setFillColor(CYAN)
    c.rect(0.0, 0.0, 0.18 * inch, h, fill=1, stroke=0)

    # Subtle radial glow simulation — concentric rectangles fading in alpha not supported simply.
    # Instead: a faint diagonal blue panel for depth.
    c.setFillColor(colors.HexColor("#0A1A2F"))
    c.rect(0.6 * inch, h - 5.6 * inch, w - 1.2 * inch, 0.04 * inch, fill=1, stroke=0)

    # Brand mark
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.95 * inch, h - 0.9 * inch, "TJFIT  ·  PREMIUM TRAINING")

    # Title block
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 52)
    c.drawString(0.6 * inch, h - 3.3 * inch, "Hypertrophy")
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(0.6 * inch, h - 4.1 * inch, "12-Week Mesocycle")

    # Subtitle
    c.setFillColor(INK)
    c.setFont("Helvetica", 14)
    c.drawString(0.6 * inch, h - 4.7 * inch, "Flagship  ·  Intermediate  ·  Gym  ·  5 days per week")

    # Bullets
    c.setFillColor(INK_DIM)
    c.setFont("Helvetica", 11)
    bullets = [
        "Push  ·  Pull  ·  Legs  ·  Upper  ·  Lower split",
        "Renaissance Periodization volume landmarks (MEV → MAV → MRV)",
        "Two programmed deload weeks (Week 5 and Week 9)",
        "Linear and double progression, governed by Rate of Perceived Exertion",
    ]
    y = h - 5.4 * inch
    for b in bullets:
        # cyan dot
        c.setFillColor(CYAN)
        c.circle(0.68 * inch, y + 4, 2, fill=1, stroke=0)
        c.setFillColor(INK_DIM)
        c.drawString(0.95 * inch, y, b)
        y -= 0.32 * inch

    # Footer
    c.setStrokeColor(CYAN)
    c.setLineWidth(2)
    c.line(0.6 * inch, 1.0 * inch, 2.6 * inch, 1.0 * inch)
    c.setFillColor(INK_DIM)
    c.setFont("Helvetica", 9)
    c.drawString(0.6 * inch, 0.75 * inch, "tjfit.org   ·   Version 1.0.0   ·   © TJFit")

# ---------- Inner page chrome ----------
def inner_page(c: canvas.Canvas, doc):
    w, h = LETTER
    paint_bg(c)
    # Top accent line
    c.setStrokeColor(CYAN)
    c.setLineWidth(1.2)
    c.line(0.6 * inch, h - 0.55 * inch, w - 0.6 * inch, h - 0.55 * inch)
    # Top labels
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.6 * inch, h - 0.42 * inch, "TJFIT   ·   HYPERTROPHY  ·  12-WEEK MESOCYCLE")
    c.setFillColor(INK_DIM)
    c.setFont("Helvetica", 8)
    c.drawRightString(w - 0.6 * inch, h - 0.42 * inch, "Flagship Program")
    # Footer divider
    c.setStrokeColor(HAIRLINE)
    c.setLineWidth(0.5)
    c.line(0.6 * inch, 0.55 * inch, w - 0.6 * inch, 0.55 * inch)
    c.setFillColor(INK_FAINT)
    c.setFont("Helvetica", 8)
    c.drawString(0.6 * inch, 0.4 * inch, "tjfit.org")
    c.drawRightString(w - 0.6 * inch, 0.4 * inch, f"Page {doc.page - 1}")

# ---------- Components ----------
def kv_table(rows):
    data = [[Paragraph(k.upper(), KEY), Paragraph(v, VAL)] for k, v in rows]
    t = Table(data, colWidths=[1.7 * inch, 5.2 * inch])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, HAIRLINE),
        ("BACKGROUND", (0, 0), (-1, -1), BG_PANEL),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t

def workout_table(rows):
    header = ["#", "Exercise", "Sets × Reps", "Load", "Rest", "RPE", "Notes"]
    data = [header] + rows
    t = Table(
        data,
        colWidths=[0.3*inch, 1.85*inch, 0.95*inch, 0.7*inch, 0.6*inch, 0.45*inch, 2.05*inch],
        repeatRows=1,
    )
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), CYAN),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8.5),
        ("LINEBELOW", (0, 0), (-1, 0), 1, CYAN),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_PANEL, BG_PANEL_2]),
        ("LINEBELOW", (0, 1), (-1, -1), 0.3, HAIRLINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        # RPE column highlight
        ("TEXTCOLOR", (5, 1), (5, -1), CYAN),
        ("FONTNAME", (5, 1), (5, -1), "Helvetica-Bold"),
        # Exercise name bold
        ("FONTNAME", (1, 1), (1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, 1), (1, -1), WHITE),
        # Number column
        ("TEXTCOLOR", (0, 1), (0, -1), CYAN),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
    ]))
    return t

def volume_table():
    header = ["Week", "Phase", "Chest", "Back", "Quads", "Hamstrings",
              "Side Delts", "Biceps", "Triceps", "Glutes", "RPE"]
    rows = [
        ["1",  "Minimum Effective",    "10", "12", "10", "8",  "10", "8",  "8",  "8",  "7"],
        ["2",  "Building",             "12", "14", "12", "10", "12", "10", "10", "10", "7"],
        ["3",  "Building",             "14", "16", "14", "12", "14", "12", "12", "12", "8"],
        ["4",  "Maximum Adaptive",     "16", "18", "16", "12", "16", "14", "14", "14", "8"],
        ["5",  "Deload",               "8",  "9",  "8",  "6",  "8",  "6",  "6",  "7",  "6"],
        ["6",  "Building",             "16", "20", "16", "14", "18", "14", "14", "14", "8"],
        ["7",  "Building",             "18", "22", "18", "16", "20", "16", "16", "16", "8.5"],
        ["8",  "Maximum Recoverable",  "20", "24", "18", "16", "22", "18", "18", "16", "9"],
        ["9",  "Deload",               "10", "12", "9",  "8",  "10", "8",  "8",  "8",  "6"],
        ["10", "Intensification",      "14", "16", "14", "12", "14", "12", "12", "12", "9"],
        ["11", "Intensification",      "12", "14", "12", "10", "12", "10", "10", "10", "9"],
        ["12", "Peak / Photos",        "8",  "10", "8",  "6",  "8",  "6",  "6",  "6",  "7"],
    ]
    data = [header] + rows
    t = Table(
        data,
        colWidths=[0.45*inch, 1.25*inch] + [0.55*inch]*8 + [0.45*inch],
        repeatRows=1,
    )
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), CYAN),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 7.5),
        ("LINEBELOW", (0, 0), (-1, 0), 1, CYAN),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ALIGN", (1, 1), (1, -1), "LEFT"),
        ("LEFTPADDING", (1, 0), (1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_PANEL, BG_PANEL_2]),
        ("LINEBELOW", (0, 1), (-1, -1), 0.3, HAIRLINE),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        # Week column
        ("TEXTCOLOR", (0, 1), (0, -1), CYAN),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        # Phase column
        ("TEXTCOLOR", (1, 1), (1, -1), INK_DIM),
        # RPE column highlight
        ("TEXTCOLOR", (10, 1), (10, -1), CYAN),
        ("FONTNAME", (10, 1), (10, -1), "Helvetica-Bold"),
    ]
    # Highlight deload rows (Week 5 = row 5, Week 9 = row 9)
    for r in (5, 9):
        style.append(("BACKGROUND", (0, r), (-1, r), DELOAD_BG))
        style.append(("TEXTCOLOR", (1, r), (1, r), CYAN))
        style.append(("FONTNAME", (1, r), (1, r), "Helvetica-Bold"))
    t.setStyle(TableStyle(style))
    return t

# ---------- Content ----------
story = []

# Overview section
story.append(Paragraph("Program Overview", H2))
story.append(kv_table([
    ("Goal", "Add 6 to 10 pounds of lean mass over 12 weeks with less than 2% bodyfat gain. Balanced physique — no specialization."),
    ("Who it is for", "Intermediate lifter with at least one year of consistent training. Full gym access. Five sessions per week of about 70 minutes. Eating in a 200 to 400 calorie surplus."),
    ("Who it is not for", "Beginners (use Beginner Gym 12-Week). Anyone in a fat loss phase (use Fat Loss 12-Week). Anyone with fewer than four training days per week available."),
    ("Equipment", "Full commercial gym — barbell, dumbbells, bench, squat rack, cable station, leg press, hack squat or pendulum, lat pulldown, leg curl machine, hip thrust pad."),
    ("Split", "Push / Pull / Legs / Upper / Lower across five days. Every muscle group is trained twice per week. Saturday and Sunday are rest days."),
    ("Periodization", "Template Tier 1 — 12-week linear hypertrophy mesocycle with programmed deloads at Week 5 and Week 9."),
]))
story.append(Spacer(1, 16))

# Volume curve
story.append(Paragraph("Weekly Volume Curve", H2))
story.append(Paragraph(
    "Hard sets per muscle per week. Volume landmarks follow Renaissance Periodization: "
    "<b>Minimum Effective</b> is the floor that drives growth, <b>Maximum Adaptive</b> is the productive range, "
    "<b>Maximum Recoverable</b> is the ceiling you can recover from. Deload weeks are shaded.",
    MUTED_S))
story.append(Spacer(1, 6))
story.append(volume_table())
story.append(PageBreak())

# Week 1 — intro
story.append(Paragraph("Week 1  ·  Foundation", H1))
story.append(Paragraph(
    "Rate of Perceived Exertion is capped at 7 across every working set — leave three reps in reserve. "
    "This week is about grooving movement patterns and entering the mesocycle fresh, not chasing weight on the bar.",
    BODY))
story.append(Spacer(1, 12))

# Day 1
story.append(Paragraph("Day 1  —  Push  ·  Chest, Shoulders, Triceps  ·  70 minutes", H3))
story.append(Paragraph(
    "<b>Warm-up:</b> 5 minutes easy bike  ·  band pull-aparts 2 sets of 15  ·  "
    "band shoulder dislocates 2 sets of 10  ·  empty-bar bench press 2 sets of 8.",
    BODY))
story.append(workout_table([
    ["1", "Barbell Bench Press",        "3 × 6–8",   "RPE 7", "3 min",  "7", "Pause one second on chest each rep."],
    ["2", "Incline Dumbbell Press",     "3 × 8–10",  "RPE 7", "2 min",  "7", "30-degree bench. Neutral grip is fine."],
    ["3", "Seated Dumbbell Shoulder Press", "3 × 8–10",  "RPE 7", "2 min",  "7", "Stop at forehead. Do not lock out."],
    ["4", "Cable Lateral Raise",        "3 × 12–15", "RPE 8", "75 sec", "8", "Lean away. Lead with the elbow."],
    ["5", "Cable Triceps Pushdown",     "3 × 10–12", "RPE 8", "75 sec", "8", "Rope attachment. Full lockout."],
    ["6", "Overhead Dumbbell Triceps Extension", "2 × 10–12", "RPE 8", "60 sec", "8", "Single dumbbell, two hands."],
]))
story.append(Paragraph(
    "<b>Cool-down:</b> doorway pec stretch 30 seconds per side for two rounds  ·  child's pose 60 seconds.",
    MUTED_S))
story.append(Spacer(1, 14))

# Day 2
story.append(Paragraph("Day 2  —  Pull  ·  Back, Rear Delts, Biceps  ·  70 minutes", H3))
story.append(Paragraph(
    "<b>Warm-up:</b> 5 minutes easy row  ·  scapular pull-ups 2 sets of 8  ·  "
    "band face pulls 2 sets of 15.",
    BODY))
story.append(workout_table([
    ["1", "Weighted Pull-up (or Lat Pulldown)", "3 × 6–8",   "RPE 7", "3 min",  "7", "Full hang at bottom. Chin clears the bar."],
    ["2", "Barbell Row (Pendlay or T-Bar)",      "3 × 8–10",  "RPE 7", "2 min",  "7", "Pull to lower sternum."],
    ["3", "Chest-Supported Dumbbell Row",        "3 × 10–12", "RPE 8", "2 min",  "8", "Elbow path at 45 degrees."],
    ["4", "Cable Face Pull",                     "3 × 12–15", "RPE 8", "75 sec", "8", "High elbows. External rotation."],
    ["5", "Incline Dumbbell Curl",               "3 × 10–12", "RPE 8", "75 sec", "8", "Full stretch at the bottom."],
    ["6", "Hammer Curl",                         "2 × 10–12", "RPE 8", "60 sec", "8", "Slow two-second eccentric."],
]))
story.append(PageBreak())

# Day 3
story.append(Paragraph("Day 3  —  Legs (Quad Bias)  ·  75 minutes", H3))
story.append(Paragraph(
    "<b>Warm-up:</b> 5 minutes easy bike  ·  hip circles  ·  leg swings  ·  "
    "bodyweight squats 2 sets of 10  ·  empty-bar back squat 2 sets of 5.",
    BODY))
story.append(workout_table([
    ["1", "Barbell Back Squat",         "4 × 6–8",   "RPE 7", "3 min",  "7", "Hit depth. Brace hard."],
    ["2", "Romanian Deadlift",          "3 × 8–10",  "RPE 7", "2 min",  "7", "Push hips back. Neutral spine."],
    ["3", "Leg Press (high foot position)", "3 × 10–12", "RPE 8", "2 min",  "8", "Knees track over toes."],
    ["4", "Walking Dumbbell Lunge",     "2 × 10 per leg", "RPE 8", "90 sec", "8", "Long stride. Front knee tracks forward."],
    ["5", "Seated Leg Curl",            "3 × 12–15", "RPE 8", "75 sec", "8", "Squeeze at the top. Two-second eccentric."],
    ["6", "Standing Calf Raise",        "3 × 12–15", "RPE 8", "60 sec", "8", "Full stretch. One-second pause at bottom."],
]))
story.append(Spacer(1, 14))

# Day 4
story.append(Paragraph("Day 4  —  Upper Body  ·  65 minutes", H3))
story.append(Paragraph(
    "<b>Warm-up:</b> 5 minutes easy row  ·  band pull-aparts  ·  "
    "empty-bar overhead press 2 sets of 8.",
    BODY))
story.append(workout_table([
    ["1", "Overhead Press (Barbell or Dumbbell)", "3 × 6–8",   "RPE 7", "3 min",  "7", "Glutes tight. No leg drive."],
    ["2", "Weighted Dip (or Dip Machine)",        "3 × 8–10",  "RPE 8", "2 min",  "8", "Lean forward for chest. Upright for triceps."],
    ["3", "Cable Row (mid-grip)",                 "3 × 10–12", "RPE 8", "2 min",  "8", "Pull to belly button."],
    ["4", "Lat Pulldown (wide pronated)",         "3 × 10–12", "RPE 8", "90 sec", "8", "Drive elbows down. Do not lean back."],
    ["5", "Dumbbell Lateral Raise",               "3 × 12–15", "RPE 8", "60 sec", "8", "Slight forward lean. No swing."],
    ["6", "EZ-Bar Curl",                          "2 × 10–12", "RPE 8", "60 sec", "8", "Strict. No hip thrust."],
    ["7", "Skull Crusher (EZ-Bar)",               "2 × 10–12", "RPE 8", "60 sec", "8", "Bar to forehead. Elbows locked."],
]))
story.append(PageBreak())

# Day 5
story.append(Paragraph("Day 5  —  Lower Body (Posterior Bias)  ·  75 minutes", H3))
story.append(Paragraph(
    "<b>Warm-up:</b> 5 minutes easy bike  ·  hip circles  ·  glute bridges 2 sets of 10  ·  "
    "empty-bar Romanian deadlift 2 sets of 5.",
    BODY))
story.append(workout_table([
    ["1", "Barbell Hip Thrust",         "4 × 8–10",  "RPE 7", "2 min",  "7", "Pause one second at top. Chin tucked."],
    ["2", "Conventional Deadlift",      "3 × 5",     "RPE 7", "3 min",  "7", "Reset each rep. Form before load."],
    ["3", "Bulgarian Split Squat",      "3 × 8 per leg", "RPE 8", "2 min",  "8", "Long stance. Slight forward lean."],
    ["4", "Hack Squat (or Pendulum Squat)", "3 × 10–12", "RPE 8", "2 min",  "8", "Full depth. Controlled eccentric."],
    ["5", "Lying Leg Curl",             "3 × 10–12", "RPE 8", "75 sec", "8", "Hard squeeze. Two-second eccentric."],
    ["6", "Seated Calf Raise",          "3 × 15–20", "RPE 9", "60 sec", "9", "Push hard. Burn through it."],
]))
story.append(Spacer(1, 12))
story.append(Paragraph("Days 6 and 7  —  Rest", H3))
story.append(Paragraph(
    "Active recovery only. 30 to 60 minutes of walking, mobility work, sauna if available. "
    "No training, no sprints, no \"just one set.\" Recovery is when adaptation happens.",
    BODY))
story.append(PageBreak())

# Progression rules
story.append(Paragraph("Progression Rules  ·  Weeks 2 through 12", H2))

prog_rules = [
    ("Double Progression on Accessories",
     "Hit the top of the rep range on every set. Next session, add weight and drop back to the bottom of the range."),
    ("Linear Progression on Main Lifts",
     "Bench, squat, overhead press, deadlift, and hip thrust. Add 2.5 kilograms to upper body lifts and 5 kilograms to lower body lifts each week, until reps drop or Rate of Perceived Exertion overshoots the cap. Then hold the load and add a set."),
    ("Weekly Volume Additions",
     "Through accumulation phases, add one set per major muscle each Monday. The new set goes on the second session of that muscle group, on an isolation movement — never the heavy compound."),
    ("RPE Progression",
     "Weeks 1 to 3 capped at 7. Week 4 capped at 8. Weeks 6 to 8 capped at 8 to 9. Weeks 10 to 11 capped at 9. Week 12 capped at 7 for the peak and photo week."),
    ("Deload Weeks 5 and 9",
     "Same exercises, same days. Working sets cut in half. RPE capped at 6. No reps-to-failure work. Non-negotiable — this is where supercompensation happens."),
    ("Stalled for Two Weeks",
     "Drop the load by 10 percent and rebuild. Do not grind through plateaus."),
]
for k, v in prog_rules:
    story.append(Paragraph(k, H3))
    story.append(Paragraph(v, BODY))
    story.append(Spacer(1, 6))

story.append(Spacer(1, 10))

# Why this works
story.append(Paragraph("Why This Works", H2))
story.append(Paragraph(
    "The Push / Pull / Legs / Upper / Lower split trains every muscle twice per week — the frequency "
    "sweet spot for hypertrophy according to Schoenfeld's 2016 meta-analysis. The volume curve "
    "(Minimum Effective → Maximum Adaptive → Maximum Recoverable → deload → intensification) "
    "is the Renaissance Periodization mesocycle model: accumulate fatigue progressively, then dissipate it, "
    "exposing the supercompensated adaptation underneath.",
    BODY_W))
story.append(Paragraph(
    "Week 12 is intentionally low volume so the work actually becomes visible. Most lifters end mesocycles "
    "flat, fatigued, and bloated. This one ends sharp.",
    BODY_W))
story.append(Paragraph(
    "The two deload weeks are non-negotiable. They are not rest weeks — they are tissue recovery weeks "
    "that let connective tissue catch up to muscular adaptation. Skipping them is the single most common "
    "reason lifters stall on hypertrophy mesocycles.",
    BODY_W))

story.append(Spacer(1, 16))

# Expected results
story.append(Paragraph("Expected Results", H2))
story.append(Paragraph(
    "If you hit at least 85 percent of sessions, eat in a controlled surplus, and sleep at least seven hours per night:",
    BODY))
results = [
    "Six to ten pounds of scale weight gain — roughly 70 to 80 percent of which is lean mass.",
    "Bench press up 5 to 10 kilograms. Back squat up 10 to 15 kilograms. Deadlift up 10 to 20 kilograms.",
    "Visible growth in the arms and shoulders by Week 8.",
    "Visible growth in the chest and back by Week 12.",
    "Photos at the end of Week 12 will look meaningfully different from photos taken in Week 1.",
]
rdata = [[Paragraph("●", KEY), Paragraph(r, BODY)] for r in results]
rt = Table(rdata, colWidths=[0.25*inch, 6.65*inch])
rt.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
]))
story.append(rt)

story.append(PageBreak())

# Evidence
story.append(Paragraph("Evidence", H2))
story.append(Paragraph(
    "Every prescription in this program is anchored to peer-reviewed research or evidence-based coaching resources.",
    MUTED_S))
story.append(Spacer(1, 6))

evidence = [
    ("Schoenfeld 2017", "Dose-response relationship between training volume and hypertrophy.",
     "pubmed.ncbi.nlm.nih.gov/27433992"),
    ("Schoenfeld 2016", "Training frequency meta-analysis — volume-matched.",
     "pubmed.ncbi.nlm.nih.gov/27102172"),
    ("Helms et al. 2016", "Rate of Perceived Exertion in resistance training prescription.",
     "pubmed.ncbi.nlm.nih.gov/27328853"),
    ("Renaissance Periodization", "Volume landmarks — Minimum Effective, Maximum Adaptive, Maximum Recoverable.",
     "renaissanceperiodization.com"),
    ("Grgic et al. 2018", "Effects of rest interval length on hypertrophy.",
     "pubmed.ncbi.nlm.nih.gov/28933059"),
]
edata = [[
    Paragraph(f"<b>{a}</b>", EVKEY),
    Paragraph(b, VAL),
    Paragraph(c, EVLINK),
] for a, b, c in evidence]
et = Table(edata, colWidths=[1.5*inch, 3.2*inch, 2.2*inch])
et.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 10),
    ("LINEBELOW", (0, 0), (-1, -1), 0.3, HAIRLINE),
    ("BACKGROUND", (0, 0), (-1, -1), BG_PANEL),
    ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
]))
story.append(et)

story.append(Spacer(1, 20))
story.append(Paragraph(
    "© TJFit  ·  tjfit.org  ·  This program is provided for educational purposes. "
    "Consult a physician before beginning any training program, especially if returning from injury "
    "or managing a chronic condition.",
    MUTED_S))

# ---------- Build with BaseDocTemplate for full template control ----------
PAGE_W, PAGE_H = LETTER
LEFT, RIGHT, TOP, BOTTOM = 0.6 * inch, 0.6 * inch, 0.85 * inch, 0.75 * inch

inner_frame = Frame(
    LEFT, BOTTOM,
    PAGE_W - LEFT - RIGHT,
    PAGE_H - TOP - BOTTOM,
    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    id="inner",
)
cover_frame = Frame(
    0, 0, 0.01, 0.01,  # tiny invisible frame — no flowables placed on cover
    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    id="coverframe",
)

doc = BaseDocTemplate(
    OUTPUT,
    pagesize=LETTER,
    title="TJFit · Hypertrophy 12-Week Mesocycle",
    author="TJFit",
    leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM,
)
doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[cover_frame], onPage=cover_page),
    PageTemplate(id="Inner", frames=[inner_frame], onPage=inner_page),
])

# Page 1 uses Cover template (decoration drawn by onPage; flowables go nowhere
# because the cover frame is tiny). The first flowable is a PageBreak that
# advances to Inner template for the real content.
flowables = [NextPageTemplate("Inner"), PageBreak()] + story

doc.build(flowables)
print(f"OK -> {OUTPUT}")
