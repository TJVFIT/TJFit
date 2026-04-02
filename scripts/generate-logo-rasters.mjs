/**
 * Raster brand assets from SVG lockups (see public/logo/*.svg).
 * Writes: favicon.ico, apple-touch-icon.png, og-image.png, icons/icon-192.png, icons/icon-512.png
 * Run: node scripts/generate-logo-rasters.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconSvg = path.join(root, "public/logo/tj-icon.svg");
const fullSvg = path.join(root, "public/logo/tj-full.svg");
const bg = { r: 10, g: 10, b: 11, alpha: 1 };

async function main() {
  if (!fs.existsSync(iconSvg) || !fs.existsSync(fullSvg)) {
    console.error("Missing public/logo/tj-icon.svg or tj-full.svg");
    process.exit(1);
  }

  const iconBuf = fs.readFileSync(iconSvg);
  const fullBuf = fs.readFileSync(fullSvg);

  fs.mkdirSync(path.join(root, "public/icons"), { recursive: true });

  const mark128 = await sharp(iconBuf)
    .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const fav16 = await sharp(mark128).resize(16, 16, { fit: "contain" }).png().toBuffer();
  const fav32 = await sharp(mark128).resize(32, 32, { fit: "contain" }).png().toBuffer();
  const fav48 = await sharp(mark128).resize(48, 48, { fit: "contain" }).png().toBuffer();
  const ico = await toIco([fav16, fav32, fav48]);
  fs.writeFileSync(path.join(root, "public/favicon.ico"), ico);

  await sharp(mark128)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, "public/icons/icon-192.png"));

  await sharp(mark128)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, "public/icons/icon-512.png"));

  const appleIcon = await sharp(iconBuf)
    .resize(140, 140, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 180, height: 180, channels: 4, background: bg }
  })
    .composite([{ input: appleIcon, gravity: "center" }])
    .png()
    .toFile(path.join(root, "public/apple-touch-icon.png"));

  const ogLogo = await sharp(fullBuf)
    .resize(520, 140, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: { r: 10, g: 10, b: 11 } }
  })
    .composite([{ input: ogLogo, gravity: "center" }])
    .png()
    .toFile(path.join(root, "public/og-image.png"));

  console.log("Logo rasters written (favicon.ico, apple-touch-icon.png, og-image.png, icons).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
