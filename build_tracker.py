"""
HabitTracker.xlsx — Mindset Shift Stack Clone
Gamified XP + leveling system, light modern aesthetic
"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule, DataBarRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.chart import BarChart, LineChart, Reference
from datetime import date, timedelta
import random

random.seed(7)
wb = Workbook()
TODAY = date.today()
YEAR  = TODAY.year

# ── PALETTE ────────────────────────────────────────────────────────────────
P = {
    "white":    "FFFFFF",
    "bg":       "F7F8FC",
    "surface":  "FFFFFF",
    "muted":    "F0F2F8",
    "muted2":   "E4E7F0",

    "txt1":     "111827",   # near-black
    "txt2":     "4B5563",
    "txt3":     "9CA3AF",

    "border":   "E5E7EB",
    "border2":  "D1D5DB",

    # Primary — deep violet (brand color)
    "brand":    "5B21B6",   # violet-800
    "brand_md": "7C3AED",   # violet-600
    "brand_lt": "EDE9FE",   # violet-100
    "brand_xl": "F5F3FF",   # violet-50

    # XP gold
    "xp":       "D97706",   # amber-600
    "xp_lt":    "FEF3C7",   # amber-100
    "xp_md":    "F59E0B",   # amber-400

    # Levels
    "lv1":      "6B7280",   # gray  — Novice
    "lv2":      "16A34A",   # green — Apprentice
    "lv3":      "2563EB",   # blue  — Achiever
    "lv4":      "7C3AED",   # violet— Champion
    "lv5":      "D97706",   # amber — Legend
    "lv6":      "DC2626",   # red   — Elite
    "lv_lt":    "F3F4F6",

    # Category accents
    "cat_fit":  "10B981",   # emerald — Fitness
    "cat_hlt":  "0EA5E9",   # sky     — Health
    "cat_mnd":  "8B5CF6",   # violet  — Mindset
    "cat_fcs":  "F59E0B",   # amber   — Focus
    "cat_biz":  "EF4444",   # red     — Business
    "cat_soc":  "EC4899",   # pink    — Social

    # Completion states
    "done_bg":  "D1FAE5", "done_fg":  "065F46",
    "skip_bg":  "FEF3C7", "skip_fg":  "92400E",
    "miss_bg":  "FEE2E2", "miss_fg":  "991B1B",

    # Heatmap
    "h0": "F3F4F6",
    "h1": "DDD6FE",
    "h2": "A78BFA",
    "h3": "7C3AED",
    "h4": "4C1D95",
}

# ── LEVEL SYSTEM ──────────────────────────────────────────────────────────
LEVELS = [
    (0,    100,  "🌱 Seed",        P["lv1"]),
    (101,  300,  "🌿 Sprout",      P["lv2"]),
    (301,  600,  "🌳 Sapling",     P["lv3"]),
    (601,  1000, "🔥 Achiever",    P["lv4"]),
    (1001, 1750, "⚡ Champion",    P["lv5"]),
    (1751, 3000, "💎 Legend",      P["lv6"]),
    (3001, 9999, "👑 Elite",       P["xp"]),
]

# ── HABITS ────────────────────────────────────────────────────────────────
HABITS = [
    # (icon, name, category, frequency, xp_per_completion, accent)
    ("💧", "Drink 8 Glasses of Water", "Health",    "Daily",   10, P["cat_hlt"]),
    ("🏋️", "30-Min Workout",           "Fitness",   "Daily",   25, P["cat_fit"]),
    ("🧘", "Meditate 10 Min",          "Mindset",   "Daily",   20, P["cat_mnd"]),
    ("📚", "Read 30 Minutes",          "Focus",     "Daily",   20, P["cat_fcs"]),
    ("🚫", "No Social Media 1hr AM",   "Mindset",   "Daily",   15, P["cat_mnd"]),
    ("🙏", "Gratitude Journal",        "Mindset",   "Daily",   15, P["cat_mnd"]),
    ("👟", "10,000 Steps",             "Fitness",   "Daily",   20, P["cat_fit"]),
    ("😴", "Sleep by 11pm",            "Health",    "Daily",   15, P["cat_hlt"]),
    ("💼", "Deep Work 2 Hours",        "Business",  "Daily",   30, P["cat_biz"]),
    ("📞", "Connect with Someone",     "Social",    "Weekly",  20, P["cat_soc"]),
    ("🥗", "Eat Clean All Day",        "Health",    "Daily",   15, P["cat_hlt"]),
    ("✍️", "Write / Journal",          "Focus",     "Daily",   15, P["cat_fcs"]),
]
N = len(HABITS)
CATEGORIES = ["Fitness", "Health", "Mindset", "Focus", "Business", "Social", "Other"]
DAYS14 = [(TODAY - timedelta(days=13-i)) for i in range(14)]
DAYS30 = [(TODAY - timedelta(days=29-i)) for i in range(30)]

# ── STYLE HELPERS ─────────────────────────────────────────────────────────
def f(h):            return PatternFill("solid", fgColor=h)
def ft(bold=False, sz=11, col="111827", italic=False):
    return Font(name="Arial", bold=bold, size=sz, color=col, italic=italic)
def al(h="left", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)
def bb(col="E5E7EB"):
    return Border(bottom=Side(style="thin", color=col))
def ba(col="E5E7EB"):
    s = Side(style="thin", color=col)
    return Border(left=s, right=s, top=s, bottom=s)
def bl(col, thick=False):
    return Border(left=Side(style="medium" if thick else "thin", color=col))
def bbl(accent, btm_col="E5E7EB"):
    return Border(left=Side(style="medium", color=accent),
                  bottom=Side(style="thin", color=btm_col))
def set_w(ws, d):
    for col, w in d.items():
        ws.column_dimensions[col].width = w
def fill_rect(ws, r1, r2, c1, c2, hex_):
    for r in range(r1, r2+1):
        for c in range(c1, c2+1):
            ws.cell(row=r, column=c).fill = f(hex_)
def spacer(ws, row, h=8):
    ws.row_dimensions[row].height = h
    fill_rect(ws, row, row, 1, 25, P["bg"])

def page_header(ws, row, col1, col2, title, subtitle, accent):
    """Two-row page header: big title + subtitle."""
    ws.merge_cells(start_row=row, start_column=col1,
                   end_row=row, end_column=col2)
    c = ws.cell(row=row, column=col1, value=title)
    c.fill = f(P["surface"]); c.alignment = al("left")
    c.font = Font(name="Arial", bold=True, size=18, color=P["txt1"])
    c.border = Border(left=Side(style="thick", color=accent),
                      bottom=Side(style="thin", color=P["border"]))
    ws.row_dimensions[row].height = 46

    ws.merge_cells(start_row=row+1, start_column=col1,
                   end_row=row+1, end_column=col2)
    c2 = ws.cell(row=row+1, column=col1, value=subtitle)
    c2.fill = f(P["muted"]); c2.alignment = al("left")
    c2.font = Font(name="Arial", size=9, italic=True, color=P["txt3"])
    c2.border = Border(left=Side(style="thick", color=accent),
                       bottom=Side(style="thin", color=P["border"]))
    ws.row_dimensions[row+1].height = 18

def section(ws, row, col1, col2, text, accent):
    ws.merge_cells(start_row=row, start_column=col1,
                   end_row=row, end_column=col2)
    c = ws.cell(row=row, column=col1, value=text)
    c.fill = f(P["muted"]); c.alignment = al("left")
    c.font = Font(name="Arial", bold=True, size=10, color=accent)
    c.border = Border(left=Side(style="thick", color=accent),
                      bottom=Side(style="thin", color=P["border2"]))
    ws.row_dimensions[row].height = 26

def th(ws, row, col, text, accent):
    c = ws.cell(row=row, column=col, value=text)
    c.fill = f(P["muted"]); c.alignment = al("center")
    c.font = Font(name="Arial", bold=True, size=9, color=P["txt2"])
    c.border = Border(bottom=Side(style="medium", color=accent),
                      top=Side(style="thin", color=P["border"]))
    return c

# ══════════════════════════════════════════════════════════════════════════════
#  SHEET: HABITS SETUP
# ══════════════════════════════════════════════════════════════════════════════
ws_s = wb.active
ws_s.title = "Habits Setup"
ws_s.sheet_view.showGridLines = False
ws_s.freeze_panes = "B4"
ws_s.sheet_properties.tabColor = P["txt3"]
fill_rect(ws_s, 1, 120, 1, 12, P["bg"])

page_header(ws_s, 1, 1, 10, "   ⚙  Habits Setup",
            "Add, remove or customise your habits. XP per completion drives your level.", P["brand"])
spacer(ws_s, 3, 6)

set_w(ws_s, {"A":5,"B":28,"C":14,"D":13,"E":11,"F":11,
             "G":8,"H":10,"I":10,"J":26})

hdrs = ["#","Habit Name","Category","Frequency","XP Value",
        "Target/Wk","Icon","Active?","Color","Notes"]
for j, h in enumerate(hdrs, 1):
    th(ws_s, 4, j, h, P["brand"])
ws_s.row_dimensions[4].height = 24

cat_dv  = DataValidation(type="list",
    formula1='"'+ ",".join(CATEGORIES) +'"')
freq_dv = DataValidation(type="list",
    formula1='"Daily,Weekdays,Weekends,3x/week,Weekly"')
yn_dv   = DataValidation(type="list", formula1='"Yes,No"')
for dv in [cat_dv, freq_dv, yn_dv]:
    ws_s.add_data_validation(dv)

for i, (icon, name, cat, freq, xp, accent) in enumerate(HABITS, 5):
    ws_s.row_dimensions[i].height = 22
    bg = P["surface"] if i % 2 == 0 else P["muted"]
    data = [i-4, name, cat, freq, xp, 7 if freq=="Daily" else 1, icon, "Yes", accent, ""]
    for j, val in enumerate(data, 1):
        c = ws_s.cell(row=i, column=j, value=val)
        c.fill = f(bg)
        c.font = Font(name="Arial", size=10,
                      color=accent if j==2 else P["xp"] if j==5 else P["txt2"])
        c.alignment = al("center" if j in [1,3,4,5,6,7,8] else "left")
        c.border = bb()

cat_dv.add("C5:C104"); freq_dv.add("D5:D104"); yn_dv.add("H5:H104")

ws_s.conditional_formatting.add("H5:H104",
    CellIsRule("equal", ['"Yes"'], fill=f(P["done_bg"]),
               font=Font(name="Arial", color=P["done_fg"], bold=True, size=10)))
ws_s.conditional_formatting.add("H5:H104",
    CellIsRule("equal", ['"No"'], fill=f(P["miss_bg"]),
               font=Font(name="Arial", color=P["miss_fg"], size=10)))

# XP value note
note_row = 5 + N + 1
ws_s.merge_cells(f"A{note_row}:J{note_row}")
c = ws_s.cell(row=note_row, column=1,
    value="💡  XP Values guide: Low effort = 10 XP  ·  Medium = 15–20 XP  ·  Hard = 25–30 XP  ·  Elite = 40+ XP")
c.fill = f(P["xp_lt"]); c.alignment = al("center")
c.font = Font(name="Arial", size=9, italic=True, color=P["xp"])
c.border = Border(left=Side(style="thick", color=P["xp_md"]))
ws_s.row_dimensions[note_row].height = 22

# ══════════════════════════════════════════════════════════════════════════════
#  SHEET: CHECK-IN  (daily XP logging)
# ══════════════════════════════════════════════════════════════════════════════
ws_ci = wb.create_sheet("Check-In")
ws_ci.sheet_view.showGridLines = False
ws_ci.freeze_panes = "D5"
ws_ci.sheet_properties.tabColor = P["cat_fit"]
fill_rect(ws_ci, 1, 35, 1, 22, P["bg"])

page_header(ws_ci, 1, 1, 20, "   ✅  Daily Check-In",
            "Mark each habit daily. XP earns automatically. Momentum never resets.", P["cat_fit"])
spacer(ws_ci, 3, 6)

ws_ci.column_dimensions["A"].width = 30
ws_ci.column_dimensions["B"].width = 12
ws_ci.column_dimensions["C"].width = 10
for j in range(4, 20):
    ws_ci.column_dimensions[get_column_letter(j)].width = 10.5

# Row 4 headers
for col, (txt, accent, bg) in enumerate([
    ("HABIT",        P["brand"],    P["muted"]),
    ("⚡ XP/Habit",  P["xp"],      P["xp_lt"]),
    ("🔥 Streak",    P["cat_fit"], P["muted"]),
], 1):
    c = ws_ci.cell(row=4, column=col, value=txt)
    c.fill = f(bg); c.font = Font(name="Arial", bold=True, size=9, color=accent)
    c.alignment = al("center")
    c.border = Border(bottom=Side(style="medium", color=accent))

for di, d in enumerate(DAYS14):
    col = di + 4
    is_today = d == TODAY
    is_wknd  = d.weekday() >= 5
    c = ws_ci.cell(row=4, column=col, value=d.strftime("%a\n%d %b"))
    c.fill = f(P["brand_lt"] if is_today else P["muted"])
    c.font = Font(name="Arial", bold=True, size=9,
                  color=P["brand"] if is_today else P["txt3"] if is_wknd else P["txt2"])
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = Border(bottom=Side(style="medium",
                      color=P["brand"] if is_today else P["border2"]))
ws_ci.row_dimensions[4].height = 32

ci_dv = DataValidation(type="list", formula1='"✅,⏭,❌,—"',
                        showErrorMessage=False)
ws_ci.add_data_validation(ci_dv)

for i, (icon, name, cat, freq, xp, accent) in enumerate(HABITS, 5):
    ws_ci.row_dimensions[i].height = 26
    bg = P["surface"] if i % 2 == 0 else P["muted"]

    # Habit name
    c = ws_ci.cell(row=i, column=1, value=f"{icon}  {name}")
    c.fill = f(bg); c.font = Font(name="Arial", size=10, bold=True, color=accent)
    c.border = Border(right=Side(style="thin", color=P["border"]),
                      bottom=Side(style="thin", color=P["border"]))

    # XP per habit (pulls from setup)
    c = ws_ci.cell(row=i, column=2,
                   value=f"='Habits Setup'!E{i-0}")
    c.fill = f(P["xp_lt"]); c.font = Font(name="Arial", bold=True, size=11, color=P["xp"])
    c.alignment = al("center"); c.border = bb()

    # Streak count
    streak_f = f'=COUNTIF(D{i}:Q{i},"✅")'
    c = ws_ci.cell(row=i, column=3, value=streak_f)
    c.fill = f(P["muted"]); c.font = Font(name="Arial", bold=True, size=11, color=P["cat_fit"])
    c.alignment = al("center"); c.border = bb()

    # 14 day check-in cells
    for j, d in enumerate(DAYS14, 4):
        is_today = d == TODAY
        c = ws_ci.cell(row=i, column=j, value="—")
        c.fill = f(P["brand_xl"] if is_today else bg)
        c.font = Font(name="Arial", size=13, color=P["txt3"])
        c.alignment = al("center"); c.border = ba()
        ci_dv.add(c)

ci_rng = f"D5:Q{4+N}"
ws_ci.conditional_formatting.add(ci_rng,
    CellIsRule("equal", ['"✅"'], fill=f(P["done_bg"]),
               font=Font(name="Arial", bold=True, size=13, color=P["done_fg"])))
ws_ci.conditional_formatting.add(ci_rng,
    CellIsRule("equal", ['"❌"'], fill=f(P["miss_bg"]),
               font=Font(name="Arial", bold=True, size=13, color=P["miss_fg"])))
ws_ci.conditional_formatting.add(ci_rng,
    CellIsRule("equal", ['"⏭"'], fill=f(P["skip_bg"]),
               font=Font(name="Arial", size=13, color=P["skip_fg"])))

# XP row total at bottom
xp_row = 5 + N
ws_ci.row_dimensions[xp_row].height = 26
ws_ci.merge_cells(f"A{xp_row}:C{xp_row}")
c = ws_ci.cell(row=xp_row, column=1, value="⚡  XP EARNED TODAY")
c.fill = f(P["xp_lt"]); c.font = Font(name="Arial", bold=True, size=10, color=P["xp"])
c.border = Border(top=Side(style="medium", color=P["xp_md"]))

for j in range(4, 4+14):
    # Sum XP: for each ✅ in this column, multiply by the habit's XP value
    xp_formula = "+".join([
        f'IF(D{r}="✅",\'Habits Setup\'!E{r},0)'
        if j == 4 else
        f'IF({get_column_letter(j)}{r}="✅",\'Habits Setup\'!E{r},0)'
        for r in range(5, 5+N)
    ])
    col_ltr = get_column_letter(j)
    c = ws_ci.cell(row=xp_row, column=j,
                   value=f"={xp_formula.replace('D', col_ltr)}")
    c.fill = f(P["xp_lt"]); c.font = Font(name="Arial", bold=True, size=11, color=P["xp"])
    c.alignment = al("center"); c.border = Border(top=Side(style="medium", color=P["xp_md"]))

# ══════════════════════════════════════════════════════════════════════════════
#  SHEET: XP & LEVELS  (the gamification hub)
# ══════════════════════════════════════════════════════════════════════════════
ws_xp = wb.create_sheet("XP & Levels")
ws_xp.sheet_view.showGridLines = False
ws_xp.sheet_properties.tabColor = P["xp_md"]
fill_rect(ws_xp, 1, 60, 1, 20, P["bg"])

page_header(ws_xp, 1, 1, 16, "   ⚡  XP & Levels",
            "Your momentum never resets. Every ✅ earns XP. Keep stacking.", P["xp_md"])
spacer(ws_xp, 3, 8)

set_w(ws_xp, {"A":22,"B":16,"C":16,"D":16,"E":16,
              "F":4,"G":20,"H":14,"I":12,"J":14,"K":16})

# ── AVATAR / LEVEL DISPLAY (rows 4-18, cols A-E) ─────────────────────────
# We need a running XP total. Store 30-day XP log in a hidden area (cols M onwards)
# For now, use a manual "Total XP" input cell that users update, or
# calculate from Check-In sheet.

# Total XP formula: sum all ✅ × XP values across the full check-in range
# Using a SUMPRODUCT across Check-In D5:Q(4+N) × Habits Setup E5:E(4+N)
total_xp_formula = (
    f"=SUMPRODUCT((COUNTIF(OFFSET('Check-In'!D5,ROW('Check-In'!D5:D{4+N})"
    f"-ROW('Check-In'!D5),0,1,14),\"✅\"))*('Habits Setup'!E5:E{4+N}))"
)
# Simpler and reliable formula:
# Total XP = sum for each habit row: COUNTIF(D:Q,"✅") * XP value
xp_parts = "+".join([
    f"(COUNTIF('Check-In'!D{r}:Q{r},\"✅\")*'Habits Setup'!E{r})"
    for r in range(5, 5+N)
])
total_xp_formula = f"={xp_parts}"

# Avatar card (rows 4-18, A-E)
for r in range(4, 19):
    ws_xp.row_dimensions[r].height = 22
    for col in range(1, 6):
        ws_xp.cell(row=r, column=col).fill = f(P["brand_lt"])

ws_xp.merge_cells("A4:E4")
c = ws_xp.cell(row=4, column=1, value="YOUR AVATAR")
c.fill = f(P["brand"]); c.font = Font(name="Arial", bold=True, size=9, color="FFFFFF")
c.alignment = al("center")
ws_xp.row_dimensions[4].height = 20

# Avatar emoji — changes based on level
# Uses nested IF based on total XP cell (B8)
avatar_formula = (
    '=IF(B8>=3001,"👑",IF(B8>=1751,"💎",IF(B8>=1001,"⚡",'
    'IF(B8>=601,"🔥",IF(B8>=301,"🌳",IF(B8>=101,"🌿","🌱"))))))'
)
ws_xp.merge_cells("A5:E10")
c = ws_xp.cell(row=5, column=1, value=avatar_formula)
c.fill = f(P["brand_lt"])
c.font = Font(name="Arial", size=52)
c.alignment = Alignment(horizontal="center", vertical="center")
ws_xp.row_dimensions[5].height = 70
for r in range(6, 11):
    ws_xp.row_dimensions[r].height = 14

# Level name
level_formula = (
    '=IF(B8>=3001,"👑 ELITE",IF(B8>=1751,"💎 LEGEND",IF(B8>=1001,"⚡ CHAMPION",'
    'IF(B8>=601,"🔥 ACHIEVER",IF(B8>=301,"🌳 SAPLING",IF(B8>=101,"🌿 SPROUT","🌱 SEED"))))))'
)
ws_xp.merge_cells("A11:E12")
c = ws_xp.cell(row=11, column=1, value=level_formula)
c.fill = f(P["brand_lt"])
c.font = Font(name="Arial", bold=True, size=16, color=P["brand"])
c.alignment = al("center")
ws_xp.row_dimensions[11].height = 28
ws_xp.row_dimensions[12].height = 8

# Total XP display
ws_xp.merge_cells("A13:B13")
ws_xp.cell(row=13, column=1, value="TOTAL XP").fill = f(P["brand_lt"])
ws_xp.cell(row=13, column=1).font = Font(name="Arial", size=8, color=P["brand"], bold=True)
ws_xp.cell(row=13, column=1).alignment = al("center")

ws_xp.merge_cells("C13:E13")
c = ws_xp.cell(row=13, column=3, value=total_xp_formula)
c.fill = f(P["xp_lt"]); c.font = Font(name="Arial", bold=True, size=20, color=P["xp"])
c.alignment = al("center"); ws_xp.row_dimensions[13].height = 30

# Progress to next level
ws_xp.merge_cells("A14:B14")
ws_xp.cell(row=14, column=1, value="NEXT LEVEL AT").fill = f(P["brand_lt"])
ws_xp.cell(row=14, column=1).font = Font(name="Arial", size=8, color=P["txt2"])
ws_xp.cell(row=14, column=1).alignment = al("center")

next_xp_formula = (
    '=IF(C13>=3001,"MAX LEVEL 👑",IF(C13>=1751,3001,IF(C13>=1001,1751,'
    'IF(C13>=601,1001,IF(C13>=301,601,IF(C13>=101,301,101))))))'
)
ws_xp.merge_cells("C14:E14")
c = ws_xp.cell(row=14, column=3, value=next_xp_formula)
c.fill = f(P["brand_lt"]); c.font = Font(name="Arial", bold=True, size=14, color=P["brand"])
c.alignment = al("center"); ws_xp.row_dimensions[14].height = 26

# Progress bar (REPT)
ws_xp.merge_cells("A15:E15")
prog_formula = (
    '=IF(C13>=3001,"▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  MAX",'
    'LET(pct,MIN(C13/C14,1),'
    'REPT("▓",ROUND(pct*20,0))&REPT("░",20-ROUND(pct*20,0))'
    '&"  "&TEXT(pct,"0%")))'
)
c = ws_xp.cell(row=15, column=1, value=prog_formula)
c.fill = f(P["brand_lt"])
c.font = Font(name="Courier New", size=11, color=P["brand_md"])
c.alignment = al("center"); ws_xp.row_dimensions[15].height = 24

# Days tracked
ws_xp.merge_cells("A16:B16")
ws_xp.cell(row=16, column=1, value="DAYS TRACKED").fill = f(P["brand_lt"])
ws_xp.cell(row=16, column=1).font = Font(name="Arial", size=8, color=P["txt2"])
ws_xp.cell(row=16, column=1).alignment = al("center")
ws_xp.merge_cells("C16:E16")
days_f = f'=SUMPRODUCT((COUNTIF(OFFSET(\'Check-In\'!D5,ROW(INDIRECT("1:{N}"))-1,0,1,14),"✅")>0)*1)'
days_simple = "+".join([f'IF(COUNTIF(\'Check-In\'!D{r}:Q{r},"✅")>0,1,0)' for r in range(5,5+N)])
c = ws_xp.cell(row=16, column=3,
               value=f"={days_simple}")
c.fill = f(P["brand_lt"]); c.font = Font(name="Arial", bold=True, size=14, color=P["brand"])
c.alignment = al("center"); ws_xp.row_dimensions[16].height = 24

ws_xp.merge_cells("A17:E17")
c = ws_xp.cell(row=17, column=1,
               value='"Momentum, not motivation."')
c.fill = f(P["brand_lt"])
c.font = Font(name="Arial", italic=True, size=9, color=P["brand_md"])
c.alignment = al("center"); ws_xp.row_dimensions[17].height = 20
ws_xp.row_dimensions[18].height = 6
for col in range(1, 6):
    ws_xp.cell(row=18, column=col).fill = f(P["brand_lt"])
    ws_xp.cell(row=18, column=col).border = Border(
        bottom=Side(style="medium", color=P["brand"]))

# ── LEVEL THRESHOLDS TABLE (col G onwards) ───────────────────────────────
section(ws_xp, 4, 7, 11, "   Level Progression", P["brand"])
for j, h in enumerate(["Level","Title","XP Range","Status"], 7):
    th(ws_xp, 5, j, h, P["brand"])
ws_xp.row_dimensions[5].height = 22

level_data = [
    (1, "🌱 Seed",       "0 – 100",    P["lv1"]),
    (2, "🌿 Sprout",     "101 – 300",  P["lv2"]),
    (3, "🌳 Sapling",    "301 – 600",  P["lv3"]),
    (4, "🔥 Achiever",   "601 – 1,000",P["lv4"]),
    (5, "⚡ Champion",   "1,001 – 1,750",P["lv5"]),
    (6, "💎 Legend",     "1,751 – 3,000",P["lv6"]),
    (7, "👑 Elite",      "3,001+",     P["xp"]),
]
for i, (lv, title, xp_range, col) in enumerate(level_data, 6):
    ws_xp.row_dimensions[i].height = 22
    bg = P["surface"] if i%2==0 else P["muted"]
    for j, (val, fc) in enumerate([
        (lv, P["txt2"]), (title, col), (xp_range, P["txt2"])
    ], 7):
        c = ws_xp.cell(row=i, column=j, value=val)
        c.fill = f(bg); c.font = Font(name="Arial", size=10, color=fc,
                                      bold=(j==8))
        c.alignment = al("center"); c.border = bb()

    # Status — current level highlighted
    status_f = f'=IF(AND(C13>={[0,101,301,601,1001,1751,3001][i-6]},C13<={[100,300,600,1000,1750,3000,9999][i-6]}),"◀ CURRENT","—")'
    c = ws_xp.cell(row=i, column=10, value=status_f)
    c.fill = f(bg)
    c.font = Font(name="Arial", size=9, color=col)
    c.alignment = al("center"); c.border = bb()

# ── XP per Habit breakdown ────────────────────────────────────────────────
spacer(ws_xp, 19, 10)
section(ws_xp, 20, 1, 11, "   XP Breakdown by Habit", P["xp_md"])
for j, h in enumerate(["Habit","XP/Rep","✅ Count","Total XP","% of Total"], 1):
    th(ws_xp, 21, j, h, P["xp_md"])
ws_xp.row_dimensions[21].height = 22

for i, (icon, name, cat, freq, xp, accent) in enumerate(HABITS, 22):
    ws_xp.row_dimensions[i].height = 22
    bg = P["surface"] if i%2==0 else P["muted"]

    c = ws_xp.cell(row=i, column=1, value=f"{icon}  {name}")
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=accent,bold=True); c.border=bb()

    c = ws_xp.cell(row=i, column=2,
                   value=f"='Habits Setup'!E{i-17}")
    c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["xp"])
    c.alignment=al("center"); c.border=bb()

    count_f = f"=COUNTIF('Check-In'!D{i-17}:Q{i-17},\"✅\")"
    c = ws_xp.cell(row=i, column=3, value=count_f)
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["txt1"])
    c.alignment=al("center"); c.border=bb()

    c = ws_xp.cell(row=i, column=4, value=f"=B{i}*C{i}")
    c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["xp"])
    c.alignment=al("center"); c.border=bb()

    c = ws_xp.cell(row=i, column=5, value=f"=IFERROR(D{i}/C13,0)")
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["brand_md"])
    c.alignment=al("center"); c.border=bb(); c.number_format="0%"

# Total row
tr = 22+N
ws_xp.row_dimensions[tr].height = 24
c = ws_xp.cell(row=tr, column=1, value="TOTAL XP EARNED")
c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["xp"])
c.border=Border(top=Side(style="medium",color=P["xp_md"]))
c = ws_xp.cell(row=tr, column=4, value=f"=SUM(D22:D{tr-1})")
c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=13,color=P["xp"])
c.alignment=al("center"); c.border=Border(top=Side(style="medium",color=P["xp_md"]))

# ── XP History (30 days) ──────────────────────────────────────────────────
spacer(ws_xp, tr+1, 10)
section(ws_xp, tr+2, 1, 11, "   30-Day XP Log  (update daily)", P["cat_fit"])
hist_start = tr+3

for j, h in enumerate(["Date","XP Earned","Habits Done","Running Total"], 1):
    th(ws_xp, hist_start, j, h, P["cat_fit"])
ws_xp.row_dimensions[hist_start].height = 22

running = 0
for i, d in enumerate(DAYS30, hist_start+1):
    ws_xp.row_dimensions[i].height = 20
    xp_day = random.randint(50, 220) if d < TODAY else 0
    running += xp_day
    bg = P["surface"] if i%2==0 else P["muted"]

    c = ws_xp.cell(row=i, column=1, value=d.strftime("%d %b %Y"))
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["txt2"]); c.border=bb()

    c = ws_xp.cell(row=i, column=2, value=xp_day if d < TODAY else 0)
    c.fill=f(P["xp_lt"] if xp_day>0 else bg)
    c.font=Font(name="Arial",bold=True if xp_day>0 else False,size=10,color=P["xp"] if xp_day>0 else P["txt3"])
    c.alignment=al("center"); c.border=bb()

    done_day = random.randint(6, N) if d < TODAY else 0
    c = ws_xp.cell(row=i, column=3, value=done_day if d < TODAY else 0)
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["cat_fit"])
    c.alignment=al("center"); c.border=bb()

    c = ws_xp.cell(row=i, column=4,
                   value=f"=SUM(B{hist_start+1}:B{i})" if i>hist_start+1 else f"=B{i}")
    c.fill=f(P["brand_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["brand"])
    c.alignment=al("center"); c.border=bb()

# ══════════════════════════════════════════════════════════════════════════════
#  SHEET: DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
ws_d = wb.create_sheet("Dashboard", 0)
ws_d.sheet_view.showGridLines = False
ws_d.sheet_properties.tabColor = P["brand"]
fill_rect(ws_d, 1, 60, 1, 20, P["bg"])

page_header(ws_d, 1, 1, 18, "   Mindset Shift Stack Tracker",
            f'=TEXT(TODAY(),"dddd, mmmm d, yyyy")  ·  Keep the momentum going.',
            P["brand"])
spacer(ws_d, 3, 10)

# Column widths
for col in range(1, 20):
    ws_d.column_dimensions[get_column_letter(col)].width = 7.5
ws_d.column_dimensions["A"].width = 32
ws_d.column_dimensions["B"].width = 14
ws_d.column_dimensions["C"].width = 10
ws_d.column_dimensions["D"].width = 8
ws_d.column_dimensions["E"].width = 8
# Gap columns
for gap in [6, 11, 16]:
    ws_d.column_dimensions[get_column_letter(gap)].width = 1.5

# ── KPI CARDS (rows 4-9) ─────────────────────────────────────────────────
KPI = [
    ("TOTAL XP ⚡",
     f"='XP & Levels'!C13",
     None, P["xp"],      P["xp_lt"],    1, 5),
    ("CURRENT LEVEL",
     f"='XP & Levels'!D11",
     None, P["brand"],   P["brand_lt"], 7, 11),
    ("DONE TODAY ✅",
     f"=COUNTIF('Check-In'!Q5:Q{4+N},\"✅\")",
     None, P["cat_fit"], "E8F5E9",      12, 16),
    ("TODAY'S RATE",
     f"=IFERROR(COUNTIF('Check-In'!Q5:Q{4+N},\"✅\")/COUNTA('Habits Setup'!B5:B{4+N}),0)",
     "0%", P["cat_mnd"], P["brand_lt"],  17, 20),
]

for label, formula, num_fmt, accent, card_bg, sc, ec in KPI:
    for r in range(4, 10):
        ws_d.row_dimensions[r].height = 18
        for col in range(sc, ec+1):
            ws_d.cell(row=r, column=col).fill = f(card_bg)
    # Stripe
    for col in range(sc, ec+1):
        ws_d.cell(row=4, column=col).fill = f(accent)
    ws_d.row_dimensions[4].height = 5
    # Label
    ws_d.merge_cells(start_row=5, start_column=sc, end_row=5, end_column=ec)
    c = ws_d.cell(row=5, column=sc, value=label)
    c.fill=f(card_bg); c.font=Font(name="Arial",size=8,color=accent,bold=True)
    c.alignment=al("center"); ws_d.row_dimensions[5].height=20
    # Value
    ws_d.merge_cells(start_row=6, start_column=sc, end_row=8, end_column=ec)
    c = ws_d.cell(row=6, column=sc, value=formula)
    c.fill=f(card_bg); c.font=Font(name="Arial",bold=True,size=26,color=accent)
    c.alignment=al("center")
    if num_fmt: c.number_format=num_fmt
    ws_d.row_dimensions[6].height=28
    ws_d.row_dimensions[7].height=14
    ws_d.row_dimensions[8].height=14
    for col in range(sc, ec+1):
        ws_d.cell(row=9,column=col).fill=f(card_bg)
        ws_d.cell(row=9,column=col).border=Border(bottom=Side(style="medium",color=accent))
    ws_d.row_dimensions[9].height=5

fill_rect(ws_d, 4, 9, 6, 6, P["bg"])
fill_rect(ws_d, 4, 9, 11, 11, P["bg"])
fill_rect(ws_d, 4, 9, 16, 16, P["bg"])

spacer(ws_d, 10, 10)

# ── AVATAR MINI-CARD ───────────────────────────────────────────────────────
section(ws_d, 11, 1, 5, "   Your Avatar", P["brand"])
for r in range(12, 19):
    ws_d.row_dimensions[r].height = 20
    for col in range(1, 6):
        ws_d.cell(row=r, column=col).fill = f(P["brand_lt"])

ws_d.merge_cells("A12:E15")
c = ws_d.cell(row=12, column=1,
    value='=IF(\'XP & Levels\'!C13>=3001,"👑",IF(\'XP & Levels\'!C13>=1751,"💎",IF(\'XP & Levels\'!C13>=1001,"⚡",IF(\'XP & Levels\'!C13>=601,"🔥",IF(\'XP & Levels\'!C13>=301,"🌳",IF(\'XP & Levels\'!C13>=101,"🌿","🌱"))))))')
c.fill=f(P["brand_lt"]); c.font=Font(name="Arial",size=42)
c.alignment=Alignment(horizontal="center",vertical="center")
ws_d.row_dimensions[12].height=56
ws_d.row_dimensions[13].height=10; ws_d.row_dimensions[14].height=10

ws_d.merge_cells("A16:E16")
c = ws_d.cell(row=16, column=1,
    value="='XP & Levels'!D11")
c.fill=f(P["brand_lt"]); c.font=Font(name="Arial",bold=True,size=13,color=P["brand"])
c.alignment=al("center")

ws_d.merge_cells("A17:E17")
c = ws_d.cell(row=17, column=1,
    value='=\'XP & Levels\'!C13&" XP  ·  Next: "&\'XP & Levels\'!E14&" XP"')
c.fill=f(P["brand_lt"]); c.font=Font(name="Arial",size=9,color=P["brand_md"])
c.alignment=al("center")

ws_d.merge_cells("A18:E18")
prog2 = (
    '=IF(\'XP & Levels\'!C13>=\'XP & Levels\'!E14,"▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  MAX",'
    'REPT("▓",ROUND(MIN(\'XP & Levels\'!C13/\'XP & Levels\'!E14,1)*20,0))'
    '&REPT("░",20-ROUND(MIN(\'XP & Levels\'!C13/\'XP & Levels\'!E14,1)*20,0))'
    '&"  "&TEXT(MIN(\'XP & Levels\'!C13/\'XP & Levels\'!E14,1),"0%"))'
)
c = ws_d.cell(row=18, column=1, value=prog2)
c.fill=f(P["brand_lt"]); c.font=Font(name="Courier New",size=10,color=P["brand_md"])
c.alignment=al("center"); ws_d.row_dimensions[18].height=22
for col in range(1,6):
    ws_d.cell(row=18,column=col).border=Border(bottom=Side(style="medium",color=P["brand"]))

spacer(ws_d, 19, 6)

# ── TODAY'S HABITS TABLE ──────────────────────────────────────────────────
section(ws_d, 20, 1, 20, "   Today's Habits", P["cat_fit"])
for j, (h, w) in enumerate(zip(
    ["HABIT","CATEGORY","XP","STATUS","STREAK","PROGRESS BAR"],
    [32,14,8,10,10,32]), 1):
    ws_d.column_dimensions[get_column_letter(j)].width = w
    th(ws_d, 21, j, h, P["cat_fit"])
ws_d.row_dimensions[21].height = 22

for i, (icon, name, cat, freq, xp, accent) in enumerate(HABITS, 22):
    ws_d.row_dimensions[i].height = 26
    bg = P["surface"] if i%2==0 else P["muted"]
    ci_row = i - 17  # check-in sheet row

    c = ws_d.cell(row=i, column=1, value=f"{icon}  {name}")
    c.fill=f(bg); c.font=Font(name="Arial",size=10,bold=True,color=accent); c.border=bb()

    c = ws_d.cell(row=i, column=2, value=f"='Habits Setup'!C{ci_row+4}")
    c.fill=f(bg); c.font=Font(name="Arial",size=9,color=P["txt2"])
    c.alignment=al("center"); c.border=bb()

    c = ws_d.cell(row=i, column=3, value=f"='Habits Setup'!E{ci_row+4}")
    c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["xp"])
    c.alignment=al("center"); c.border=bb()

    # Today's status from last column of check-in (col Q = 14th day = today)
    c = ws_d.cell(row=i, column=4, value=f"='Check-In'!Q{ci_row+4}")
    c.fill=f(bg); c.font=Font(name="Arial",size=13); c.alignment=al("center"); c.border=bb()

    c = ws_d.cell(row=i, column=5, value=f"='Check-In'!C{ci_row+4}")
    c.fill=f(bg); c.font=Font(name="Arial",bold=True,size=11,color=P["cat_fit"])
    c.alignment=al("center"); c.border=bb()

    rate_f = f"=IFERROR('Check-In'!C{ci_row+4}/14,0)"
    bar = (f'=REPT("█",ROUND({rate_f}*20,0))'
           f'&REPT("░",20-ROUND({rate_f}*20,0))'
           f'&"  "&TEXT({rate_f},"0%")')
    c = ws_d.cell(row=i, column=6, value=bar)
    c.fill=f(bg); c.font=Font(name="Courier New",size=9,color=accent)
    c.alignment=al("left"); c.border=bb()

# Status conditional formatting on col D
status_rng = f"D22:D{21+N}"
ws_d.conditional_formatting.add(status_rng,
    CellIsRule("equal",['"✅"'],fill=f(P["done_bg"]),
               font=Font(name="Arial",bold=True,size=13,color=P["done_fg"])))
ws_d.conditional_formatting.add(status_rng,
    CellIsRule("equal",['"❌"'],fill=f(P["miss_bg"]),
               font=Font(name="Arial",bold=True,size=13,color=P["miss_fg"])))
ws_d.conditional_formatting.add(status_rng,
    CellIsRule("equal",['"⏭"'],fill=f(P["skip_bg"]),
               font=Font(name="Arial",size=13,color=P["skip_fg"])))

spacer(ws_d, 22+N, 10)
# Quote
qr = 23+N
ws_d.merge_cells(f"A{qr}:F{qr}")
ws_d.row_dimensions[qr].height=42
c = ws_d.cell(row=qr,column=1,
    value='"Momentum, not motivation. Every rep compounds."')
c.fill=f(P["brand_lt"]); c.font=Font(name="Arial",italic=True,size=11,color=P["brand"])
c.alignment=Alignment(horizontal="center",vertical="center",wrap_text=True)
c.border=Border(left=Side(style="thick",color=P["brand"]))

# ══════════════════════════════════════════════════════════════════════════════
#  SHEET: HEATMAP
# ══════════════════════════════════════════════════════════════════════════════
ws_hm = wb.create_sheet("Heatmap")
ws_hm.sheet_view.showGridLines = False
ws_hm.sheet_properties.tabColor = P["cat_mnd"]
fill_rect(ws_hm, 1, 20, 1, 58, P["bg"])

page_header(ws_hm, 1, 1, 57,
            f"   🗓  Completion Heatmap — {YEAR}",
            "One cell per day. Purple intensity = XP earned. Your momentum visualised.", P["brand"])
spacer(ws_hm, 3, 6)

ws_hm.column_dimensions["A"].width = 4
for w in range(2, 58):
    ws_hm.column_dimensions[get_column_letter(w)].width = 2.6

MONTHS_LBL = ["Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec"]
jan1 = date(YEAR, 1, 1)
def woy(d): return (d - jan1).days // 7

for m in range(1, 13):
    ci = woy(date(YEAR,m,1))+2
    if ci > 56: continue
    c = ws_hm.cell(row=4, column=ci, value=MONTHS_LBL[m-1])
    c.font=Font(name="Arial",bold=True,size=8,color=P["txt2"])
    c.fill=f(P["bg"])
ws_hm.row_dimensions[4].height=14

for ri, lbl in enumerate(["M","T","W","T","F","S","S"],5):
    ws_hm.row_dimensions[ri].height=13
    c = ws_hm.cell(row=ri, column=1, value=lbl)
    c.font=Font(name="Arial",size=8,color=P["txt3"]); c.alignment=al("center")
    c.fill=f(P["bg"])

MAX_XP_DAY = sum(xp for _,_,_,_,xp,_ in HABITS)
for day_offset in range(365):
    d = date(YEAR,1,1)+timedelta(days=day_offset)
    if d > TODAY: break
    col_idx=woy(d)+2; row_idx=d.weekday()+5
    if col_idx>56 or row_idx>11: continue
    xp_earned = random.randint(0,MAX_XP_DAY) if d<TODAY else 0
    pct = xp_earned/MAX_XP_DAY
    cell=ws_hm.cell(row=row_idx,column=col_idx)
    cell.value=xp_earned if xp_earned>0 else None
    cell.alignment=al("center")
    if pct==0:      hex_=P["h0"]
    elif pct<=0.25: hex_=P["h1"]
    elif pct<=0.5:  hex_=P["h2"]
    elif pct<=0.75: hex_=P["h3"]
    else:           hex_=P["h4"]
    cell.fill=f(hex_)
    cell.font=Font(name="Arial",size=7,color="FFFFFF" if pct>0.5 else P["txt3"])

# Today border
td_col=woy(TODAY)+2; td_row=TODAY.weekday()+5
ws_hm.cell(row=td_row,column=td_col).border=ba(P["xp_md"])

ws_hm.row_dimensions[13].height=10; ws_hm.row_dimensions[14].height=16
c=ws_hm.cell(row=14,column=1,value="Less"); c.font=Font(name="Arial",size=8,color=P["txt3"]); c.fill=f(P["bg"])
for li,(hex_,lbl) in enumerate(zip([P["h0"],P["h1"],P["h2"],P["h3"],P["h4"]],
    ["None","Low","Mid","High","Max"]),2):
    ws_hm.column_dimensions[get_column_letter(li)].width=7
    c=ws_hm.cell(row=14,column=li,value=lbl)
    c.fill=f(hex_); c.font=Font(name="Arial",size=7,color="FFFFFF" if li>3 else P["txt2"])
    c.alignment=al("center")
c=ws_hm.cell(row=14,column=7,value="More"); c.font=Font(name="Arial",size=8,color=P["txt3"]); c.fill=f(P["bg"])

# ══════════════════════════════════════════════════════════════════════════════
#  SHEET: ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════
ws_an = wb.create_sheet("Analytics")
ws_an.sheet_view.showGridLines = False
ws_an.sheet_properties.tabColor = P["cat_fcs"]
fill_rect(ws_an,1,80,1,20,P["bg"])

page_header(ws_an,1,1,18,"   📈  Analytics & Insights",
            "Track your weekly momentum, XP velocity, and category performance.", P["cat_fcs"])
spacer(ws_an,3,8)

set_w(ws_an,{"A":14,"B":10,"C":10,"D":10,"E":10,"F":10,
             "G":10,"H":10,"I":12,"J":10,"K":4,
             "L":18,"M":12,"N":12,"O":12})

# 14-day trend table
section(ws_an,4,1,10,"   14-Day XP Trend",P["brand"])
for j,h in enumerate(["Date","XP Earned","Done","Rate","","","","","7-Day XP Avg",""],1):
    th(ws_an,5,j,h,P["brand"])
ws_an.row_dimensions[5].height=22

for i,d in enumerate(DAYS14,6):
    ws_an.row_dimensions[i].height=20
    xp_day=random.randint(60,220) if d<TODAY else 0
    done=random.randint(6,N) if d<TODAY else 0
    bg=P["surface"] if i%2==0 else P["muted"]
    for j,(val,fg,nf) in enumerate([
        (d.strftime("%d %b"),P["txt2"],None),
        (xp_day,P["xp"],None),
        (done,P["cat_fit"],None),
        (f"=IFERROR(C{i}/{N},0)",P["brand"],"0%"),
    ],1):
        c=ws_an.cell(row=i,column=j,value=val)
        c.fill=f(P["xp_lt"] if j==2 and xp_day>0 else bg)
        c.font=Font(name="Arial",size=10,color=fg); c.alignment=al("center"); c.border=bb()
        if nf: c.number_format=nf
    avg_f=f"=AVERAGE(B6:B{i})" if i<12 else f"=AVERAGE(B{i-6}:B{i})"
    c=ws_an.cell(row=i,column=9,value=avg_f)
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["brand"])
    c.alignment=al("center"); c.border=bb()

spacer(ws_an,20,10)

# Weekly summary
section(ws_an,21,1,10,"   Weekly XP Summary (Last 8 Weeks)",P["cat_fit"])
for j,h in enumerate(["Week","Mon","Tue","Wed","Thu","Fri","Sat","Sun","Total XP","Rate"],1):
    th(ws_an,22,j,h,P["cat_fit"])
ws_an.row_dimensions[22].height=22

for w in range(8):
    r=23+w; ws_an.row_dimensions[r].height=20
    week_end=TODAY-timedelta(days=TODAY.weekday())-timedelta(weeks=w)
    bg=P["surface"] if w%2==0 else P["muted"]
    c=ws_an.cell(row=r,column=1,value=f"Wk {week_end.strftime('%d %b')}")
    c.fill=f(bg); c.font=Font(name="Arial",size=9,color=P["txt2"]); c.border=bb()
    for d in range(7):
        xp_d=random.randint(80,MAX_XP_DAY)
        c=ws_an.cell(row=r,column=d+2,value=xp_d)
        c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["txt1"])
        c.alignment=al("center"); c.border=bb()
    c=ws_an.cell(row=r,column=9,value=f"=SUM(B{r}:H{r})")
    c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["xp"])
    c.alignment=al("center"); c.border=bb()
    c=ws_an.cell(row=r,column=10,value=f"=IFERROR(I{r}/(7*{MAX_XP_DAY}),0)")
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["brand"])
    c.alignment=al("center"); c.number_format="0%"; c.border=bb()

ar=31; ws_an.row_dimensions[ar].height=22
for j in range(1,11):
    cl=get_column_letter(j)
    c=ws_an.cell(row=ar,column=j,
                 value="AVERAGE" if j==1 else f"=AVERAGE({cl}23:{cl}30)")
    c.fill=f(P["brand_lt"]); c.alignment=al("center" if j>1 else "left")
    c.font=Font(name="Arial",bold=True,size=10,color=P["brand"])
    c.border=Border(top=Side(style="medium",color=P["brand"]))
    if j==10: c.number_format="0%"

spacer(ws_an,32,10)

# Category breakdown
section(ws_an,33,12,16,"   By Category",P["cat_fcs"])
for j,h in enumerate(["Category","# Habits","XP Earned","% of Total"],12):
    th(ws_an,34,j,h,P["cat_fcs"])
ws_an.row_dimensions[34].height=22

cat_accents={"Fitness":P["cat_fit"],"Health":P["cat_hlt"],"Mindset":P["cat_mnd"],
             "Focus":P["cat_fcs"],"Business":P["cat_biz"],"Social":P["cat_soc"],"Other":P["txt3"]}
for i,cat in enumerate(CATEGORIES,35):
    ws_an.row_dimensions[i].height=20
    bg=P["surface"] if i%2==0 else P["muted"]
    accent=cat_accents.get(cat,P["txt2"])
    c=ws_an.cell(row=i,column=12,value=cat)
    c.fill=f(bg); c.font=Font(name="Arial",size=10,bold=True,color=accent); c.border=bb()
    c=ws_an.cell(row=i,column=13,
        value=f'=COUNTIFS(\'Habits Setup\'!C5:C104,L{i},\'Habits Setup\'!H5:H104,"Yes")')
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["txt1"])
    c.alignment=al("center"); c.border=bb()
    xp_cat=random.randint(100,800)
    c=ws_an.cell(row=i,column=14,value=xp_cat)
    c.fill=f(P["xp_lt"]); c.font=Font(name="Arial",bold=True,size=10,color=P["xp"])
    c.alignment=al("center"); c.border=bb()
    c=ws_an.cell(row=i,column=15,value=f"=IFERROR(N{i}/SUM(N35:N41),0)")
    c.fill=f(bg); c.font=Font(name="Arial",size=10,color=P["brand"])
    c.alignment=al("center"); c.number_format="0%"; c.border=bb()

# Charts
line=LineChart()
line.title="14-Day XP Trend"; line.y_axis.title="XP Earned"
line.style=10; line.height=11; line.width=20
data_r=Reference(ws_an,min_col=2,max_col=2,min_row=5,max_row=19)
cats_r=Reference(ws_an,min_col=1,max_col=1,min_row=6,max_row=19)
line.add_data(data_r,titles_from_data=True); line.set_categories(cats_r)
line.series[0].graphicalProperties.line.solidFill="D97706"
line.series[0].graphicalProperties.line.width=25000
ws_an.add_chart(line,"A34")

bar=BarChart(); bar.type="col"; bar.title="Weekly Total XP"
bar.y_axis.title="XP"; bar.style=10; bar.height=11; bar.width=20
data_b=Reference(ws_an,min_col=9,max_col=9,min_row=22,max_row=30)
cats_b=Reference(ws_an,min_col=1,max_col=1,min_row=23,max_row=30)
bar.add_data(data_b,titles_from_data=True); bar.set_categories(cats_b)
bar.series[0].graphicalProperties.solidFill="5B21B6"
ws_an.add_chart(bar,"A49")

# ══════════════════════════════════════════════════════════════════════════════
# FINAL
# ══════════════════════════════════════════════════════════════════════════════
wb.active = wb["Dashboard"]
OUT = "/Users/adityapandey/Desktop/HabitTracker/HabitTracker.xlsx"
wb.save(OUT)
print(f"Saved → {OUT}")
