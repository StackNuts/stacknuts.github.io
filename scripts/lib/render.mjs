// Shared SVG -> PNG rendering core, used by both scripts/render-svg.mjs
// (single file, explicit size) and scripts/render-content.mjs (batch, size
// read from each SVG's own viewBox). No headless browser — @resvg/resvg-js
// (native Rust bindings).

import { Resvg } from "@resvg/resvg-js";
import { decompress } from "wawoff2";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, "../..");
const fontsDir = path.join(__dirname, "../fonts");

// Extracts + decodes the real brand fonts straight out of assets/styles.css's
// embedded base64 woff2 @font-face blocks (resvg's native binding can't load
// woff2 directly — it silently drops the glyphs — so this decodes to .ttf via
// wawoff2 and caches the result). styles.css stays the single source of truth
// for the actual font data; scripts/fonts/ is gitignored and rebuilt on demand.
export async function ensureFonts() {
  mkdirSync(fontsDir, { recursive: true });
  const cssPath = path.join(repoRoot, "assets/styles.css");
  const css = readFileSync(cssPath, "utf8");
  const blockRe = /\/\*\s*(\S+)\s*\*\/\s*\n@font-face\s*\{([^}]*)\}/g;
  const fontFiles = [];
  for (const match of css.matchAll(blockRe)) {
    const [, label, body] = match;
    if (label !== "latin") continue; // broadest subset per family+weight
    const famMatch = body.match(/font-family:\s*"([^"]+)"/);
    const weightMatch = body.match(/font-weight:\s*(\d+)/);
    const b64Match = body.match(/base64,([A-Za-z0-9+/=]+)"/);
    if (!famMatch || !weightMatch || !b64Match) continue;
    const family = famMatch[1].replace(/\s+/g, "-").toLowerCase();
    const weight = weightMatch[1];
    const outPath = path.join(fontsDir, `${family}-${weight}-latin.ttf`);
    const woff2 = Buffer.from(b64Match[1], "base64");
    const ttf = await decompress(woff2);
    writeFileSync(outPath, Buffer.from(ttf));
    fontFiles.push(outPath);
  }
  if (fontFiles.length === 0) {
    console.warn("Warning: no @font-face blocks found in assets/styles.css — rendering without custom fonts.");
  }
  return fontFiles;
}

function readIhdr(png) {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

// Reads an SVG's own natural pixel width from its viewBox (the 3rd number —
// origin offset in the first two doesn't matter) or width="" attribute.
// Every file under branding/content/ only declares a viewBox, no width/height
// attributes, so viewBox is the primary path; width="" is a fallback for
// anything that does set it explicitly.
export function naturalWidth(svg) {
  const wAttr = svg.match(/<svg\b[^>]*\bwidth="(\d+(?:\.\d+)?)"/);
  if (wAttr) return Math.round(Number.parseFloat(wAttr[1]));
  const vb = svg.match(/<svg\b[^>]*\bviewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/);
  if (vb) return Math.round(Number.parseFloat(vb[1]));
  return null;
}

// Renders one SVG file to <outputBase>.png (and, unless only1x, <outputBase>@2x.png).
// width is the target 1x pixel width; height is fed to resvg only implicitly
// (fitTo is width-only — resvg derives height from the SVG's own aspect ratio).
export async function renderOne(svgPath, outputBase, width, { only1x = false, fontFiles } = {}) {
  const svg = readFileSync(svgPath, "utf8");
  const fonts = fontFiles ?? (await ensureFonts());
  const targets = only1x ? [["", width]] : [["", width], ["@2x", width * 2]];
  const written = [];
  for (const [suffix, targetWidth] of targets) {
    const resvg = new Resvg(svg, {
      font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "Barlow" },
      fitTo: { mode: "width", value: targetWidth },
    });
    const png = resvg.render().asPng();
    const outPath = `${outputBase}${suffix}.png`;
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, png);
    written.push({ path: outPath, ...readIhdr(png) });
  }
  return written;
}
