#!/usr/bin/env node
// Regenerates assets/og-image.png — the social-preview card referenced by
// the og:image / twitter:image meta tags in index.html.
//
// The hex-nut pattern is extracted live from assets/hero-hex.svg so this
// image can never drift out of sync with the real site graphic. To change
// the wording, edit the constants below and re-run:
//
//   npm install
//   npx playwright install chromium   # first time only, downloads the browser
//   npm run og:generate

import { chromium } from "playwright";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// --- Editable copy ---
const BRAND = "STACKNUTS";
const HEADLINE_LINES = ["Magento Modules,", "Bolted On Tight."];
const SUBHEAD = "Open source Magento 2 modules built by an Adobe Certified Professional.";

const OUT_WIDTH = 1200;
const OUT_HEIGHT = 630;

// --- Extract the real 54-nut pattern + center glyph from hero-hex.svg ---
const heroHexSvg = readFileSync(path.join(repoRoot, "assets/hero-hex.svg"), "utf8");
const colorMap = { s: "#b8c7d6", t: "#f2f2f3", a: "#5980a6" };

const cellRe =
  /<g\s+class="cell"\s+transform="([^"]+)"\s*>\s*<use href="#hex-nut" class="hex (s|t|a)" opacity="([\d.]+)"><\/use>\s*<\/g>/gs;
const nutUses = [...heroHexSvg.matchAll(cellRe)].map(([, transform, cls, opacity]) => {
  return `<use href="#nut" transform="${transform}" fill="${colorMap[cls]}" opacity="${opacity}"></use>`;
});
if (nutUses.length !== 54) {
  throw new Error(
    `Expected 54 hex nuts in hero-hex.svg, found ${nutUses.length}. ` +
      `Its structure may have changed — update the extraction regex in this script.`,
  );
}

const glyphRe =
  /<g class="cell glyph" transform="([^"]+)">\s*<path\s+class="hex s"\s+opacity="([\d.]+)"\s+d="([^"]+)"\s*><\/path>\s*<\/g>/s;
const glyphMatch = heroHexSvg.match(glyphRe);
if (!glyphMatch) {
  throw new Error("Could not find the center Magento glyph in hero-hex.svg — its structure may have changed.");
}
const [, glyphTransform, glyphOpacity, glyphD] = glyphMatch;
const glyphUse = `<g transform="${glyphTransform}" fill="#b8c7d6" opacity="${glyphOpacity}"><path d="${glyphD}"></path></g>`;

const hexMarkup = [...nutUses, glyphUse].join("\n        ");

// --- Build the mockup page ---
const stylesheetHref = "file://" + path.join(repoRoot, "assets/styles.css");

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="${stylesheetHref}" />
    <style>
      html,
      body {
        margin: 0;
        width: ${OUT_WIDTH}px;
        height: ${OUT_HEIGHT}px;
        overflow: hidden;
        background: #22384d;
      }
      .og {
        width: ${OUT_WIDTH}px;
        height: ${OUT_HEIGHT}px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 90px;
        box-sizing: border-box;
        color: #f2f2f3;
        font-family: "Barlow", system-ui, sans-serif;
        position: relative;
      }
      .brand-row {
        display: flex;
        align-items: center;
        gap: 18px;
        margin-bottom: 44px;
      }
      .brand-row span {
        font-family: "Barlow Condensed", system-ui, sans-serif;
        font-weight: 600;
        font-size: 32px;
        letter-spacing: 0.14em;
      }
      h1 {
        font-family: "Barlow Condensed", system-ui, sans-serif;
        font-weight: 700;
        font-size: 78px;
        line-height: 1.04;
        letter-spacing: -0.005em;
        margin: 0 0 26px;
      }
      p {
        font-size: 28px;
        max-width: 820px;
        color: color-mix(in srgb, #f2f2f3 78%, transparent);
        margin: 0;
        line-height: 1.4;
      }
      .hexes {
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.55;
      }
    </style>
  </head>
  <body>
    <div class="og">
      <svg class="hexes" width="530" height="481" viewBox="-204 -185 408 370" aria-hidden="true">
        <defs>
          <g id="nut">
            <path
              d="M43.5 9.365v13.271L32 29.271 20.5 22.636V9.365L32 2.73Zm-20.8 1.27v10.729L32 26.729l9.3-5.365V10.635L32 5.27Z"
            ></path>
            <path
              d="M37.6 16a5.6 5.6 0 1 1-11.2 0 5.6 5.6 0 0 1 11.2 0Zm-2.2 0a3.4 3.4 0 1 0-6.8 0 3.4 3.4 0 0 0 6.8 0Z"
            ></path>
          </g>
        </defs>
        ${hexMarkup}
      </svg>
      <div class="brand-row">
        <svg width="46" height="41" viewBox="0 0 64 56" aria-hidden="true">
          <g fill="#b8c7d6" opacity="0.72">
            <path
              d="M 31.5 30.365 L 31.5 43.636 L 20 50.271 L 8.5 43.636 L 8.5 30.365 L 20 23.73 Z M 10.7 31.635 L 10.7 42.364 L 20 47.729 L 29.3 42.364 L 29.3 31.635 L 20 26.27 Z"
            ></path>
            <path
              d="M 25.6 37 A 5.6 5.6 0 1 1 14.4 37 A 5.6 5.6 0 0 1 25.6 37 Z M 23.4 37 A 3.4 3.4 0 1 0 16.6 37 A 3.4 3.4 0 0 0 23.4 37 Z"
            ></path>
            <path
              d="M 55.5 30.365 L 55.5 43.636 L 44 50.271 L 32.5 43.636 L 32.5 30.365 L 44 23.73 Z M 34.7 31.635 L 34.7 42.364 L 44 47.729 L 53.3 42.364 L 53.3 31.635 L 44 26.27 Z"
            ></path>
            <path
              d="M 49.6 37 A 5.6 5.6 0 1 1 38.4 37 A 5.6 5.6 0 0 1 49.6 37 Z M 47.4 37 A 3.4 3.4 0 1 0 40.6 37 A 3.4 3.4 0 0 0 47.4 37 Z"
            ></path>
          </g>
          <g fill="#f2f2f3">
            <path
              d="M 43.5 9.365 L 43.5 22.636 L 32 29.271 L 20.5 22.636 L 20.5 9.365 L 32 2.73 Z M 22.7 10.635 L 22.7 21.364 L 32 26.729 L 41.3 21.364 L 41.3 10.635 L 32 5.27 Z"
            ></path>
            <path
              d="M 37.6 16 A 5.6 5.6 0 1 1 26.4 16 A 5.6 5.6 0 0 1 37.6 16 Z M 35.4 16 A 3.4 3.4 0 1 0 28.6 16 A 3.4 3.4 0 0 0 35.4 16 Z"
            ></path>
          </g>
        </svg>
        <span>${BRAND}</span>
      </div>
      <h1>${HEADLINE_LINES.join("<br />")}</h1>
      <p>${SUBHEAD}</p>
    </div>
  </body>
</html>
`;

// --- Render ---
// Written to a real file and loaded via file:// (rather than page.setContent,
// which serves the page from a different origin than the file:// stylesheet
// link and silently blocks the embedded @font-face rules from applying).
const tmpFile = path.join(os.tmpdir(), `stacknuts-og-${Date.now()}.html`);
writeFileSync(tmpFile, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: OUT_WIDTH, height: OUT_HEIGHT }, deviceScaleFactor: 1 });
await page.goto("file://" + tmpFile, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready); // wait for the embedded @font-face rules to actually apply
await page.waitForTimeout(100);

const hexBox = await page.evaluate(() => {
  const el = document.querySelector(".hexes");
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
});
if (hexBox.left < 0 || hexBox.top < 0 || hexBox.right > OUT_WIDTH || hexBox.bottom > OUT_HEIGHT) {
  console.warn("Warning: the hex graphic extends outside the canvas and will be cropped:", hexBox);
}

const outPath = path.join(repoRoot, "assets/og-image.png");
await page.screenshot({ path: outPath });
await browser.close();
rmSync(tmpFile);

console.log(`Wrote ${outPath} (${OUT_WIDTH}x${OUT_HEIGHT})`);
