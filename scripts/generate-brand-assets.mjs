/**
 * From public/brand/tjfit-logo-main.png:
 * - Favicon / apple-touch / PWA icons / tjfit-mark: monogram crop only (sharp tab + small UI).
 * - og-default.png: full lockup centered on wide canvas (social previews).
 * Run: node scripts/generate-brand-assets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/brand/tjfit-logo-main.png");
const iconsDir = path.join(root, "public/icons");
const ogDir = path.join(root, "public/og");

const BG = { r: 10, g: 10, b: 11, alpha: 1 };

async function main() {
  if (!fs.existsSync(src)) {
    console.error("Missing source:", src);
    process.exit(1);
  }
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(ogDir, { recursive: true });

  const meta = await sharp(src).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const cropH = Math.min(h, Math.max(Math.floor(h * 0.58), 1));

  const mark128 = await sharp(src)
    .extract({ left: 0, top: 0, width: w, height: cropH })
    .resize(128, 128, { fit: "contain", background: BG })
    .png()
    .toBuffer();

  await sharp(mark128).toFile(path.join(iconsDir, "tjfit-mark.png"));

  const fav16 = await sharp(mark128).resize(16, 16, { fit: "contain", background: BG }).png().toBuffer();
  const fav32 = await sharp(mark128).resize(32, 32, { fit: "contain", background: BG }).png().toBuffer();

  fs.writeFileSync(path.join(iconsDir, "favicon-16.png"), fav16);
  fs.writeFileSync(path.join(iconsDir, "favicon-32.png"), fav32);

  const ico = await toIco([fav16, fav32]);
  fs.writeFileSync(path.join(root, "public/favicon.ico"), ico);

  await sharp(mark128)
    .resize(180, 180, { fit: "contain", background: BG })
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));

  await sharp(mark128)
    .resize(192, 192, { fit: "contain", background: BG })
    .png()
    .toFile(path.join(iconsDir, "icon-192.png"));

  await sharp(mark128)
    .resize(512, 512, { fit: "contain", background: BG })
    .png()
    .toFile(path.join(iconsDir, "icon-512.png"));

  const logoForOg = await sharp(src)
    .resize({ width: 480, height: 480, fit: "inside", background: BG })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: BG
    }
  })
    .composite([{ input: logoForOg, gravity: "center" }])
    .png()
    .toFile(path.join(ogDir, "og-default.png"));

  console.log("Brand assets generated under public/icons, public/og, public/favicon.ico");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
