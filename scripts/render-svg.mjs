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
// live <text> set in the real Barlow / Barlow Condensed webfonts, extracted
// from assets/styles.css and cached in scripts/fonts/ — see scripts/lib/render.mjs.
//
// To render every file in branding/content/ at once, see render-content.mjs
// (npm run render:all) instead of calling this in a loop.
//
// Examples:
//   node scripts/render-svg.mjs branding/content/stacknuts-open-graph-image.svg assets/og-image 1200 630 --1x-only
//   node scripts/render-svg.mjs assets/favicon.svg assets/favicon-32 32 32 --1x-only

import path from "node:path";
import { renderOne, repoRoot } from "./lib/render.mjs";

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

const written = await renderOne(inputPath, outputBase, width, { only1x });
for (const w of written) {
  console.log(`Wrote ${path.relative(repoRoot, w.path)} (${w.width}x${w.height})`);
}
