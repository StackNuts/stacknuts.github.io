#!/usr/bin/env node
// Generic SVG -> PNG renderer for branding artwork (and anything else under this
// repo). No headless browser — uses @resvg/resvg-js (native Rust bindings).
//
// Usage:
//   node scripts/render-svg.mjs <input.svg> <output-basename> <width> <height> [--1x-only]
//
// Writes <output-basename>.png at <width>x<height>, and — unless --1x-only is
// passed — <output-basename>@2x.png at 2*<width> x 2*<height>.
//
// Fonts: some SVGs (e.g. branding/content/stacknuts-open-graph-image.svg) use
// live <text> set in the real Barlow / Barlow Condensed webfonts. Those fonts
// live in assets/styles.css as base64 woff2 @font-face blocks; resvg's native
// binding can't load woff2 directly (silently drops the glyphs), so on every
// run this script extracts the "latin" subset of each family+weight, decodes
// it to .ttf via wawoff2, and caches the result in scripts/fonts/ (gitignored,
// regenerated on demand — styles.css remains the single source of truth for
// the actual font data).
//
// Examples:
//   node scripts/render-svg.mjs branding/content/stacknuts-open-graph-image.svg assets/og-image 1200 630 --1x-only
//   node scripts/render-svg.mjs assets/favicon.svg assets/favicon-32 32 32 --1x-only

import { Resvg } from "@resvg/resvg-js";
import { decompress } from "wawoff2";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const fontsDir = path.join(__dirname, "fonts");

const args = process.argv.slice(2).filter((a) => a !== "--1x-only");
const only1x = process.argv.includes("--1x-only");
const [inputArg, outputBaseArg, widthArg, heightArg] = args;

if (!inputArg || !outputBaseArg || !widthArg || !heightArg) {
  console.error("Usage: node scripts/render-svg.mjs <input.svg> <output-basename> <width> <height> [--1x-only]");
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputBase = path.resolve(outputBaseArg);
const width = Number.parseInt(widthArg, 10);
const height = Number.parseInt(heightArg, 10);
if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
  console.error(`Invalid width/height: "${widthArg}" x "${heightArg}"`);
  process.exit(1);
}

// --- Extract + decode the real brand fonts from assets/styles.css ---
async function ensureFonts() {
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

const svg = readFileSync(inputPath, "utf8");
const fontFiles = await ensureFonts();

const targets = only1x ? [["", width]] : [["", width], ["@2x", width * 2]];

for (const [suffix, targetWidth] of targets) {
  const resvg = new Resvg(svg, {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Barlow" },
    fitTo: { mode: "width", value: targetWidth },
  });
  const png = resvg.render().asPng();
  const outPath = `${outputBase}${suffix}.png`;
  writeFileSync(outPath, png);
  const dims = readIhdr(png);
  console.log(`Wrote ${path.relative(repoRoot, outPath)} (${dims.width}x${dims.height})`);
}
