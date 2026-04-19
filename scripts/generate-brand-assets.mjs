/**
 * Brand pipeline:
 * - Drop `public/brand/logo-source.png` or `.jpg` as the canonical logo source.
 * - Each run writes `logo-main.png`, `logo-mark.png`, runtime favicons/icons, and OG images.
 * - With no source file, the existing `logo-main.png` is reused.
 * Run: node scripts/generate-brand-assets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const brandDir = path.join(root, "public/brand");
const sourcePng = path.join(brandDir, "logo-source.png");
const sourceJpg = path.join(brandDir, "logo-source.jpg");
const mainPng = path.join(brandDir, "logo-main.png");
const markPng = path.join(brandDir, "logo-mark.png");
const iconsDir = path.join(root, "public/icons");
const faviconIco = path.join(root, "public/favicon.ico");
const appleTouchIcon = path.join(root, "public/apple-touch-icon.png");
const ogDefault = path.join(root, "public/og-image.jpg");
const appDir = path.join(root, "src/app");

/** Only for OG canvas behind the lockup — not part of the logo asset */
const OG_CANVAS = { r: 10, g: 10, b: 11, alpha: 1 };
function resolveBrandInput() {
  if (fs.existsSync(sourcePng)) return sourcePng;
  if (fs.existsSync(sourceJpg)) return sourceJpg;
  return mainPng;
}

async function writeJpeg(pathname, input) {
  await sharp(input)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(pathname);
}

async function main() {
  fs.mkdirSync(brandDir, { recursive: true });
  fs.mkdirSync(iconsDir, { recursive: true });

  const inputPath = resolveBrandInput();
  if (!fs.existsSync(inputPath)) {
    console.error("Missing brand file. Add logo-source.png/jpg or logo-main.png under public/brand/.");
    process.exit(1);
  }

  const srcBuffer = fs.readFileSync(inputPath);
  const mainBuffer = await sharp(srcBuffer).png().toBuffer();
  fs.writeFileSync(mainPng, mainBuffer);

  const meta = await sharp(mainBuffer).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const cropH = Math.min(h, Math.max(Math.floor(h * 0.6), 1));

  const markCrop = await sharp(mainBuffer)
    .extract({ left: 0, top: 0, width: w, height: cropH })
    .resize({ width: 760, height: 760, fit: "inside" })
    .toBuffer();

  const markSquare = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: OG_CANVAS
    }
  })
    .composite([{ input: markCrop, gravity: "center" }])
    .png()
    .toBuffer();

  fs.writeFileSync(markPng, markSquare);

  const fav16 = await sharp(markSquare).resize(16, 16).png().toBuffer();
  const fav32 = await sharp(markSquare).resize(32, 32).png().toBuffer();
  const fav48 = await sharp(markSquare).resize(48, 48).png().toBuffer();
  const icon192 = await sharp(markSquare).resize(192, 192).png().toBuffer();
  const icon512 = await sharp(markSquare).resize(512, 512).png().toBuffer();
  const apple180 = await sharp(markSquare).resize(180, 180).png().toBuffer();

  const ico = await toIco([fav16, fav32, fav48]);
  fs.writeFileSync(faviconIco, ico);

  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(path.join(appDir, "icon.png"), icon512);

  fs.writeFileSync(appleTouchIcon, apple180);
  fs.writeFileSync(path.join(iconsDir, "icon-192.png"), icon192);
  fs.writeFileSync(path.join(iconsDir, "icon-512.png"), icon512);
  fs.writeFileSync(path.join(iconsDir, "favicon-16.png"), fav16);
  fs.writeFileSync(path.join(iconsDir, "favicon-32.png"), fav32);
  fs.writeFileSync(path.join(iconsDir, "favicon-48.png"), fav48);

  const logoForOg = await sharp(mainBuffer)
    .resize({ width: 720, height: 420, fit: "inside" })
    .png()
    .toBuffer();

  const ogCanvas = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: OG_CANVAS
    }
  })
    .composite([{ input: logoForOg, gravity: "center" }])
    .png()
    .toBuffer();

  await writeJpeg(ogDefault, ogCanvas);

  console.log("Brand assets written from public/brand/logo-source.*");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
