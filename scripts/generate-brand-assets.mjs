/**
 * Brand pipeline:
 * - Drop `public/brand/tjfit-logo-source.jpg` or `.png` (flat export). On each run we strip the
 *   outer backdrop via edge-connected flood fill (near-white pixels touching the image border →
 *   transparent), then write `tjfit-logo-main.png` and build icons + OG.
 * - With no source file, uses existing `tjfit-logo-main.png` as-is.
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
const mainPng = path.join(brandDir, "tjfit-logo-main.png");
const iconsDir = path.join(root, "public/icons");
const ogDir = path.join(root, "public/og");
const appDir = path.join(root, "src/app");

/** Only for OG canvas behind the lockup — not part of the logo asset */
const OG_CANVAS = { r: 10, g: 10, b: 11, alpha: 1 };
/** Letterboxing for `fit: "contain"` — transparent edges */
const PAD = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * Remove pixels that are “background-coloured” and connected to the image edge (handles flat
 * white plates on JPEG/PNG without eating the monogram interior, which is not edge-connected).
 */
async function stripEdgeConnectedBackdrop(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const n = w * h;
  const corners = [
    0,
    (w - 1) * 4,
    ((h - 1) * w) * 4,
    ((h - 1) * w + (w - 1)) * 4
  ];
  let sr = 0;
  let sg = 0;
  let sb = 0;
  for (const o of corners) {
    sr += data[o];
    sg += data[o + 1];
    sb += data[o + 2];
  }
  const bgR = sr / 4;
  const bgG = sg / 4;
  const bgB = sb / 4;
  /** JPEG + anti-alias: allow deviation from sampled backdrop */
  const tol = 52;

  const isBg = (pi) => {
    const o = pi * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    return (
      Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) <= tol &&
      r + g + b >= 520
    );
  };

  const vis = new Uint8Array(n);
  const q = [];

  const tryEnqueue = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const pi = y * w + x;
    if (vis[pi] || !isBg(pi)) return;
    vis[pi] = 1;
    q.push(pi);
  };

  for (let x = 0; x < w; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    tryEnqueue(0, y);
    tryEnqueue(w - 1, y);
  }

  while (q.length > 0) {
    const pi = q.pop();
    const o = pi * 4;
    data[o + 3] = 0;
    const x = pi % w;
    const y = (pi / w) | 0;
    if (x > 0) {
      const npi = pi - 1;
      if (!vis[npi] && isBg(npi)) {
        vis[npi] = 1;
        q.push(npi);
      }
    }
    if (x + 1 < w) {
      const npi = pi + 1;
      if (!vis[npi] && isBg(npi)) {
        vis[npi] = 1;
        q.push(npi);
      }
    }
    if (y > 0) {
      const npi = pi - w;
      if (!vis[npi] && isBg(npi)) {
        vis[npi] = 1;
        q.push(npi);
      }
    }
    if (y + 1 < h) {
      const npi = pi + w;
      if (!vis[npi] && isBg(npi)) {
        vis[npi] = 1;
        q.push(npi);
      }
    }
  }

  return sharp(data, {
    raw: { width: w, height: h, channels: 4 }
  })
    .png()
    .toBuffer();
}

function resolveBrandInput() {
  const jpg = path.join(brandDir, "tjfit-logo-source.jpg");
  const png = path.join(brandDir, "tjfit-logo-source.png");
  if (fs.existsSync(jpg)) return { path: jpg, strip: true };
  if (fs.existsSync(png)) return { path: png, strip: true };
  return { path: mainPng, strip: false };
}

async function main() {
  fs.mkdirSync(brandDir, { recursive: true });
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(ogDir, { recursive: true });

  const input = resolveBrandInput();
  if (!fs.existsSync(input.path)) {
    console.error("Missing brand file. Add tjfit-logo-source.jpg/png or tjfit-logo-main.png under public/brand/");
    process.exit(1);
  }

  let srcBuffer = fs.readFileSync(input.path);
  if (input.strip) {
    srcBuffer = await stripEdgeConnectedBackdrop(srcBuffer);
    fs.writeFileSync(mainPng, srcBuffer);
    console.log("Wrote tjfit-logo-main.png (edge-stripped from source).");
  } else if (!fs.existsSync(mainPng)) {
    fs.writeFileSync(mainPng, srcBuffer);
  }

  if (!input.strip && !fs.existsSync(mainPng)) {
    console.error("Missing:", mainPng);
    process.exit(1);
  }

  if (!input.strip) {
    srcBuffer = fs.readFileSync(mainPng);
  }

  const meta = await sharp(srcBuffer).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const cropH = Math.min(h, Math.max(Math.floor(h * 0.58), 1));

  const mark128 = await sharp(srcBuffer)
    .extract({ left: 0, top: 0, width: w, height: cropH })
    .resize(128, 128, { fit: "contain", background: PAD })
    .png()
    .toBuffer();

  await sharp(mark128).toFile(path.join(iconsDir, "tjfit-mark.png"));

  const fav16 = await sharp(mark128).resize(16, 16, { fit: "contain", background: PAD }).png().toBuffer();
  const fav32 = await sharp(mark128).resize(32, 32, { fit: "contain", background: PAD }).png().toBuffer();
  const fav48 = await sharp(mark128).resize(48, 48, { fit: "contain", background: PAD }).png().toBuffer();
  const fav96 = await sharp(mark128).resize(96, 96, { fit: "contain", background: PAD }).png().toBuffer();

  fs.writeFileSync(path.join(iconsDir, "favicon-16.png"), fav16);
  fs.writeFileSync(path.join(iconsDir, "favicon-32.png"), fav32);
  fs.writeFileSync(path.join(iconsDir, "favicon-48.png"), fav48);
  fs.writeFileSync(path.join(iconsDir, "favicon-96.png"), fav96);

  const ico = await toIco([fav16, fav32, fav48]);
  fs.writeFileSync(path.join(root, "public/favicon.ico"), ico);

  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(path.join(appDir, "icon.png"), fav48);

  await sharp(mark128).resize(180, 180, { fit: "contain", background: PAD }).png().toFile(path.join(iconsDir, "apple-touch-icon.png"));

  await sharp(mark128).resize(192, 192, { fit: "contain", background: PAD }).png().toFile(path.join(iconsDir, "icon-192.png"));

  await sharp(mark128).resize(512, 512, { fit: "contain", background: PAD }).png().toFile(path.join(iconsDir, "icon-512.png"));

  const logoForOg = await sharp(srcBuffer)
    .resize({ width: 480, height: 480, fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: OG_CANVAS
    }
  })
    .composite([{ input: logoForOg, gravity: "center" }])
    .png()
    .toFile(path.join(ogDir, "og-default.png"));

  console.log("Brand icons + OG written.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
