# TJFit PDF font notices

Verified against official upstream sources on 12 September 2026. The full license files in this directory are unaltered upstream texts. These notices cover the two bundled fonts used to generate the PDF font payloads, not every other typeface in the application.

| Font | Bundled file / metadata version | Copyright and license |
| --- | --- | --- |
| IBM Plex Sans Arabic Regular | `../IBMPlexSansArabic-Regular.woff2` / 1.005 | The binary records **Copyright 2019 IBM Corp. All rights reserved.** The upstream family license records **Copyright © 2017 IBM Corp. with Reserved Font Name "Plex"**. Both notices are retained here. [SIL OFL 1.1](IBM-Plex-Sans-Arabic-OFL.txt). |
| JetBrains Mono | `../JetBrainsMono-Variable.woff2` / 2.305 | **Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)**. [SIL OFL 1.1](JetBrains-Mono-OFL.txt). No Reserved Font Name is declared in this upstream license. |

## Official sources

- IBM: [repository](https://github.com/IBM/plex), [Arabic package license at bf260093582f04622aacc1e9f9ca604d7ccd0c42](https://github.com/IBM/plex/blob/bf260093582f04622aacc1e9f9ca604d7ccd0c42/packages/plex-sans-arabic/LICENSE.txt), [exact downloaded text](https://raw.githubusercontent.com/IBM/plex/bf260093582f04622aacc1e9f9ca604d7ccd0c42/packages/plex-sans-arabic/LICENSE.txt).
- JetBrains: [repository](https://github.com/JetBrains/JetBrainsMono), [license at 19371302b95d218af43299bce79ddbddd0bc364d](https://github.com/JetBrains/JetBrainsMono/blob/19371302b95d218af43299bce79ddbddd0bc364d/OFL.txt), [exact downloaded text](https://raw.githubusercontent.com/JetBrains/JetBrainsMono/19371302b95d218af43299bce79ddbddd0bc364d/OFL.txt).
- License author's [official OFL FAQ](https://openfontlicense.org/ofl-faq/), particularly 1.10–1.13 (notices and document embedding), 2.2 (WOFF conversion), 3.1 and 5.9 (modified fonts and names).

The upstream commit references pin the copied license texts; they do not assert that the existing local font binaries were downloaded from those exact commits.

## PDF preparation and embedding

`scripts/build-tjai-pdf-fonts.py` decompresses the Arabic WOFF2 into TTF and names that derivative **TJFit Unicode Arabic** (PostScript name `TJFitUnicodeArabic-Regular`). It creates a weight-400 static instance of the variable Latin font. The resulting base64 font data in `src/lib/tjai/pdf-fonts.ts` is used by server-side PDF generation and may also be distributed in the public source repository. Source WOFF2 files are unchanged.

Both input fonts and generated TTF payloads retain their original copyright and license records and have `OS/2.fsType = 0`. Compared with the previously generated Arabic payload, only the `name` and `head` tables changed; all glyph, character mapping, metrics, layout and shaping tables are unchanged. Arabic name records 1, 3, 4, 6, 16 and 17 identify the derivative; records 0, 13 and 14 retain IBM copyright and OFL metadata. Disabling timestamp recalculation makes generation deterministic; the Latin payload differs from the prior payload only in `head` metadata. The Latin input and payload do not contain an internal license-text/URL field, so keep the accompanying OFL notice when distributing the font assets.

OFL permits full or subset font embedding in PDF documents. This does not put the PDF's original content under OFL or require a font replacement for the current document-embedding use. The font software itself remains OFL-licensed.

Redistributing reusable font files or generated font payloads is distinct from embedding them in a PDF: preserve the copyright notices and full OFL text. The derivative's internal family and PostScript names were changed to respect the reserved name **Plex**; a `Tjai.ttf` filename or jsPDF alias alone would not suffice. Do not claim IBM or JetBrains endorsement. No separate font sale is authorized by OFL. The full licenses control over this explanatory note.

The public copies at `/fonts/licenses/` accompany the webfont distribution. Keep them synchronized with this directory in release packages.

## Verification fingerprints (SHA-256)

| File | SHA-256 |
| --- | --- |
| `IBMPlexSansArabic-Regular.woff2` | `7b67dafbd5714e645d4ff413ee41a650b44dd3ce56cbb3e268b0c9a12cd9b064` |
| `JetBrainsMono-Variable.woff2` | `b4d95930bba70de7a0c05739e27028998378ad17567276f550403e8a561f4b1f` |
| `IBM-Plex-Sans-Arabic-OFL.txt` | `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da` |
| `JetBrains-Mono-OFL.txt` | `a76abf002c49097d146e86740a3105a5d00450b1592e820a1109a8c5680cd697` |
| Derived `ARABIC_PDF_FONT` TTF bytes | `c83c7875a9e70db113b95969d1b16e6fabdcaab4017fc74b964a4a4a47660725` |
| Derived `LATIN_PDF_FONT` TTF bytes | `487b16db4ce31bf5dcfc46760c84604b336b3481cff7666ee2cd806542b7ef2a` |

Verification: existing Python 3.12.10 / fontTools 4.61.1 (the same installed runtime used for original generation); the Codex bundled Python lacked fontTools, so no dependency was installed or changed. Six focused PDF tests passed, including all ten paid bundles across all five site locales with no missing glyphs. Original WOFF2 hashes and copyright/license metadata were checked unchanged.
