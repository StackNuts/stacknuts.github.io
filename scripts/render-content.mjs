#!/usr/bin/env node
// Renders every SVG in branding/content/ to PNG (1x + 2x) in branding/rendered/,
// at each file's own natural size (read from its viewBox — see naturalWidth()
// in scripts/lib/render.mjs). Re-run any time branding/content/ changes;
// branding/rendered/ is generated output, not a second source of truth.
//
// Usage:
//   npm run render:all

import { readFileSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderOne, naturalWidth, ensureFonts, repoRoot } from "./lib/render.mjs";

const contentDir = path.join(repoRoot, "branding/content");
const outDir = path.join(repoRoot, "branding/rendered");

const svgFiles = readdirSync(contentDir)
  .filter((f) => f.endsWith(".svg"))
  .sort();

if (svgFiles.length === 0) {
  console.error(`No .svg files found in ${path.relative(repoRoot, contentDir)}`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const fontFiles = await ensureFonts();

for (const file of svgFiles) {
  const svgPath = path.join(contentDir, file);
  const svg = readFileSync(svgPath, "utf8");
  const width = naturalWidth(svg);
  if (!width) {
    console.warn(`Skipping ${file} — no viewBox or width found to size the render from.`);
    continue;
  }
  const base = path.join(outDir, path.basename(file, ".svg"));
  const written = await renderOne(svgPath, base, width, { fontFiles });
  for (const w of written) {
    console.log(`Wrote ${path.relative(repoRoot, w.path)} (${w.width}x${w.height})`);
  }
}
