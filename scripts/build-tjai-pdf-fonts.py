"""Build PDF-compatible font payloads from fonts already bundled by TJFit."""
from pathlib import Path
from io import BytesIO
from base64 import b64encode
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


def name_arabic_derivative(font):
    """Reserve the upstream Plex name for upstream font distributions."""
    names = {
        1: "TJFit Unicode Arabic",
        3: "1.005;TJFit;TJFitUnicodeArabic-Regular",
        4: "TJFit Unicode Arabic Regular",
        6: "TJFitUnicodeArabic-Regular",
        16: "TJFit Unicode Arabic",
        17: "Regular",
    }
    table = font["name"]
    platforms = {(record.platformID, record.platEncID, record.langID) for record in table.names if record.nameID == 1}
    for name_id, text in names.items():
        for platform_id, encoding_id, language_id in platforms:
            table.setName(text, name_id, platform_id, encoding_id, language_id)
    # Copyright and OFL/license records (0, 13, 14) remain upstream-authored.


root = Path(__file__).resolve().parents[1]
result = [
    "// Generated from bundled fonts by scripts/build-tjai-pdf-fonts.py. No remote font requests.",
    "// IBM Plex Sans Arabic and JetBrains Mono font data remain SIL OFL-1.1; see src/fonts/licenses/README.md and public/fonts/licenses/.",
]
for name, source in [("ARABIC_PDF_FONT", "IBMPlexSansArabic-Regular.woff2"), ("LATIN_PDF_FONT", "JetBrainsMono-Variable.woff2")]:
    font = TTFont(root / "src/fonts" / source, recalcTimestamp=False)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": 400}, inplace=False)
    if name == "ARABIC_PDF_FONT":
        name_arabic_derivative(font)
    font.flavor = None
    output = BytesIO()
    font.save(output)
    result.append("export const " + name + " = '" + b64encode(output.getvalue()).decode("ascii") + "';")
(root / "src/lib/tjai/pdf-fonts.ts").write_text("\n".join(result) + "\n", encoding="utf-8")
print("PDF font payloads generated from existing bundled assets.")
