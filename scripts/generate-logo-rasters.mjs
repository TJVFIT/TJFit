/**
 * Raster brand assets from SVG lockups (see public/logo/*.svg).
 * Writes: favicon.ico, apple-touch-icon.png, og-image.png (with tagline + cyan glow), icons.
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

  const ogGlowSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <radialGradient id="ogGlow" cx="50%" cy="36%" r="48%">
          <stop offset="0%" stop-color="rgb(34,211,238)" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="rgb(10,10,11)" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="rgb(10,10,11)"/>
      <rect width="1200" height="630" fill="url(#ogGlow)"/>
    </svg>`
  );

  const taglineSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="110">
      <text x="600" y="62" text-anchor="middle" fill="#ffffff" font-family="Segoe UI,Inter,system-ui,sans-serif" font-size="14" font-weight="600" letter-spacing="0.35em">TRANSFORM · PERFORM · DOMINATE</text>
    </svg>`
  );

  const ogBase = await sharp(ogGlowSvg).png().toBuffer();

  const ogLogoBuf = await sharp(fullBuf)
    .resize({ height: 200, fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const lm = await sharp(ogLogoBuf).metadata();
  const lw = lm.width ?? 400;
  const lh = lm.height ?? 80;
  const lx = Math.floor((1200 - lw) / 2);
  const ly = Math.floor((630 - lh) / 2) - 40;

  const tagPng = await sharp(taglineSvg).png().toBuffer();

  await sharp(ogBase)
    .composite([
      { input: ogLogoBuf, left: lx, top: ly },
      { input: tagPng, left: 0, top: 518 }
    ])
    .png()
    .toFile(path.join(root, "public/og-image.png"));

  console.log("Logo rasters written (favicon.ico, apple-touch-icon.png, og-image.png, icons).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
