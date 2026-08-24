# StackNuts — brand guidelines

The StackNuts identity: open-source Magento 2 modules, built by a developer for developers. Practical, workshop-honest, no marketing gloss.

This document is grounded in two sources of truth: the banner artwork in `branding/content/` (GitHub org README banner, LinkedIn banner, Open Graph image — all built outside this repo and dropped in as the reference design) and the live site (`index.html`, `assets/styles.css`). Nothing here should describe a treatment that isn't actually present in one of those two places.

## Foundation

Built on the **Industry** design system, run in a **dark scope** — the system's steel field with paper type reversed out of it, rather than its default light ground. The site has no light/dark toggle; dark is the only mode it ships.

Seven actual colours, darkest to lightest (`--brand-7` is out of strict lightness order — see below) — everything else in `styles.css` is one of these seven, or a role alias built from them:

```
--brand-1   #22384d   ground — the page field
--brand-2   #416180   accent, pressed
--brand-3   #597ea3   accent, hover
--brand-4   #5980a6   accent — buttons, tags, links
--brand-5   #a6bace   steel — the mark's back nuts, eyebrows, outline borders, body links
--brand-6   #f2f2f3   paper — headings, body, most of the wordmark
--brand-7   #6a8daf   the mark's front nut, only — lighter than --brand-4 so it reads
                      against the ground; kept short of --brand-5 so it stays visibly
                      its own nut rather than blending with the back pair
```

Component CSS reads these through role aliases, not the numbers directly: `--ground` (`--brand-1`), `--color-text` (`--brand-6`), `--color-accent` (`--brand-4`), `--color-accent-600` / `--color-accent-700` (`--brand-3` / `--brand-2`, hover/pressed). `--brand-5` and `--brand-7` have no alias — they're used directly. `--brand-5` used to be two near-identical values (a computed `--steel` and a fixed `--mark-steel` six percent apart) that had drifted apart for no real reason; they're unified now. `--brand-7` is a deliberate, newer departure from the banners as originally exported — see The mark, below.

Two ground values maximum in any one piece: the steel field, and hairline dividers over it. No second accent — Industry is a mono scheme, and StackNuts stays mono. No decorative colour beyond the steel.

Text tints are expressed as `color-mix(in srgb, var(--color-text) N%, transparent)`:
78% body copy, 75% secondary body copy, 50% fine print/meta, 45% footer labels.

## Type

- **Barlow Condensed** (weight 600 default, 700 for section headings) — headings, buttons, the wordmark, card titles. Wide tracking on small-caps labels (`.14em`–`.16em`), tight on the hero display size (`-.005em`); the general heading tracking elsewhere is `-.015em`.
- **Barlow** — body copy, 15px base, 1.55 line height.
- Eyebrows: 11px, uppercase, `.16em` tracking, `var(--brand-5)`, weight 600.

## The mark

Three hex nuts in a stack: two behind in `var(--brand-5)` (`#a6bace`, full opacity), one in front in `var(--brand-7)` (`#6a8daf`). The front nut carries the mark's one accent colour — that's the two-tone relationship that reads as the mark. Don't flatten it to one colour, and don't swap the front nut back to paper/white — that was a past drift in the site build that has since been corrected.

The front nut is `--brand-7` (`#6a8daf`), not the general `--color-accent` (`#5980a6`) — a deliberate lift in lightness (same hue and saturation, +5% lightness) so the mark pops against the dark ground at small sizes (nav, favicon) without drifting close enough to `--brand-5` to blur the front/back distinction. This is the one place this document departs from the banner exports as originally delivered — carry `--brand-7` forward into any new banner or export rather than reverting to the exported `#5980a6`.

**Wordmark: STACKNUTS.** One word, no space, Barlow Condensed 600, `.14em` tracking, always uppercase.

The lockup is mark + wordmark with the wordmark optically centred on the front nut. The GitHub README banner adds a tagline and repo URL beneath it; the LinkedIn banner and OG image use just the tagline.

## The blueprint object

Every card and framed element wears the Industry treatment: `class="card blueprint"` — a hairline border (`var(--color-divider)`), square corners (`border-radius: 0`), no surface fill. They're line drawings, not panels.

The one solid-filled object on any board is the primary button: accent fill, still square.

Never round a card, never give a card a surface fill.

## The nut pattern

A single 54-nut hexagonal assembly, reused across the site and the banners in two colourways:

- **Site colourway** — `#b8c7d6` / `#f2f2f3` (paper) / `#5980a6` (accent), cycling per nut. `#b8c7d6` is a one-off used only inside `hero-hex.svg` / `about-lattice.svg`'s own embedded styles — those files hardcode their fills and don't read the site's CSS custom properties, so they weren't touched by the `--brand-N` cleanup above and still don't match `--brand-5` exactly.
- **Banner colourway** — `#a6bace` (`--brand-5`) / `#f2f2f3` / `#5980a6`, cycling per nut.

Scale and opacity both grow together, roughly `1.0`–`2.0` scale against `0.36`–`0.90` opacity, so the pattern reads as parts of varying size and weight rather than a flat texture.

Three established treatments:

**Hex of nuts, centred glyph** — `assets/hero-hex.svg`. The 54 nuts packed into a hexagonal cluster with the centre cell cleared for a small mark (currently the Magento glyph). Interactive on hover — cells pulse to a light accent tint (`#eef6ff`) and scale up 1.2×; disabled under `prefers-reduced-motion`.

**Lattice diffusion** — `assets/about-lattice.svg`. The same nuts tiled edge-to-edge and dropped in as a low-opacity (0.13) CSS `background-image` behind the About section — texture, not a focal graphic.

**Nut cloud** — the banner treatment (`branding/content/*.svg`). The same 54-nut assembly scattered across the canvas, growing in scale and opacity toward the corner that holds the logo lockup, so it fills the margin without competing with the type.

Drop the pattern entirely at narrow widths rather than shrinking it.

## Voice

Workshop metaphors, used sparingly and only where they're true: "bolted on tight", "one turn of the wrench", "from the trenches". Never stacked — one per section at most.

No invented metrics, no customer counts, no badges that aren't earned. The modules are free and open source; say so plainly rather than dressing it up. Credentials are stated once, factually, with a link to verify.

Sponsorship is asked for without obligation — the work stays free either way.

## Asset inventory

- `branding/assets/` — mark and lockup source SVGs: `stacknuts-logo.svg` (mark only, hardcoded fills — a standalone coloured export of the mark, not the same file as `assets/logo.svg` on the site, which strips the fills so `<use fill="...">` can drive the colour from CSS instead), `stacknuts-logo-full.svg` (mark + wordmark, accent-coloured wordmark, transparent ground), `stacknuts-logo-full-dark.svg` (same lockup, on the `#22384d` ground, paper-coloured wordmark), plus `hex-magento.svg` and `lattice-repeatable.svg` supporting pattern pieces.
- `branding/content/` — finished banner artwork, full nut-cloud + lockup, ready to publish as-is: `stacknuts-github-readme-banner.svg` (1280×320, org-level, includes the `github.com/StackNuts` line), `stacknuts-linkedin-banner.svg` (1584×396), `stacknuts-open-graph-image.svg` (1200×630 canvas cropped to a 1100×530 safe area, headline + subhead copy), and one per-module GitHub README banner — `stacknuts-cloudflare-cache-readme-banner.svg`, `stacknuts-sort-rules-readme-banner.svg`, `stacknuts-csp-debug-readme-banner.svg` (1280×260 — shorter than the org banner, module name + one-liner in place of the generic tagline, no repo URL line — redundant when the banner is already sitting at the top of that exact repo's README). All text in every file here is flattened to path outlines, not live `<text>` — that's what makes them render identically wherever they're dropped (GitHub's `<img>` sandbox won't load embedded webfonts reliably).
- `assets/` (site) — `logo.svg` (mark-only symbols, `#logo-nut-pair` / `#logo-nut-center`, consumed via `<use fill="...">` so the CSS scope controls colour), `favicon.svg` (32×32, fixed hex colours matching the mark), `hero-hex.svg`, `about-lattice.svg`, `styles.css`, `og-image.png` / `favicon-32.png` / `apple-touch-icon.png` — all rendered straight from their SVG sources by `scripts/render-svg.mjs` (`npm run render <svg> <out-basename> <width> <height>`; no headless browser, generates 1x + 2x).
- `Stack Nuts Site.dc.html` → `index.html` — the site; edit the source and re-export, never the compiled file.

## Notes

Magento and the Magento logo are Adobe trademarks, used only as a compatibility indicator.
