# Stone Base v1.2 — Modern Color & Button System Overhaul

*   **Author:** Project Owner
*   **Status:** Historical Milestone (Implemented first as `v1.1.1a`, subsequently expanded & superseded into **`v1.1.2`** with `>= 5.2:1` Dark hover headroom, `--color-chart-1..6`, and `0.94` Ceramic Chrome)
*   **Date:** 2026-11-15 (Superseded 2026-11-16)

> [!NOTE]
> For the current `v1.1.2` tokens, contrast figures (`5.43:1` Dark accent hover, `5.45:1` Dark danger hover, `3.22:1` / `3.32:1` control borders, and `--color-chart-1..6`), see [spec/01-foundations-and-tokens.md](../../spec/01-foundations-and-tokens.md) and [spec/06-domain-patterns.md](../../spec/06-domain-patterns.md).

--------------------------------------------------------------------------------

## Overview

This design updates the **Stone Base** Level-0 color token contract, button variant styling, and all companion Markdown specifications and HTML reference pages ([index.html](../../index.html), [examples/compact-utility.html](../../examples/compact-utility.html), [examples/workspace-app.html](../../examples/workspace-app.html)) from desaturated Slate-Cobalt (`hue 248°`, chroma `0.095`) and buggy status button mappings to a high-craft, sRGB-verified modern UI color system modeled on live benchmarks from Tailwind v4 OKLCH, Radix Colors, Vercel Geist, and Linear.

## The Problem

The current v1.1 implementation passes nominal resting contrast on most swatches yet renders primary blue, destructive red, success green, warning amber, and subtle buttons as visually muted or inconsistent across Light and `.dark` modes, while containing functional CSS and documentation defects:

1. **Dark Mode Destructive Hover Contrast Failure (`2.06:1`):** In [css/stone-components.css](../../css/stone-components.css), `.stone-btn[data-variant="danger"]` maps `--btn-bg-hover` and `--btn-bg-active` to `var(--color-danger-text)` while keeping `#ffffff` foreground text. In `.dark`, `--color-danger-text` is light salmon (`#fa9b94`), causing hover/press contrast to drop to `2.06:1`.
2. **Broken & Boxy Subtle Destructive State:** `.stone-btn[data-variant="danger-subtle"]` assigns `var(--color-danger-bg)` identically to rest, hover, and active (zero interactive feedback) and strokes subtle buttons with harsh full-chroma `--color-danger-border` instead of a clean soft border.
3. **Sluggish Accent & Status Ramps:** In [css/stone-tokens.css](../../css/stone-tokens.css), `--accent-9` sits at chroma `0.095–0.098` (`#215786` Light / `#2e6697` Dark), reading as dull corporate denim rather than electric UI cobalt (`C = 0.20–0.22`). `--accent-2..5` washes (`C = 0.016–0.056`) flatten subtle/selected controls into gray. `--danger-solid` (`#ac2c2d`) reads brown-brick, `--warning-solid` (`82°`) reads mustard, and `--success-solid` (`148°`) flips foreground polarity (`#ffffff` on dark green in Light mode vs. `#13110e` on pale `#6ab676` in `.dark`).
4. **Missing Solid Hover/Active & Soft Semantic Tokens:** Tier 2 lacks `--color-danger-solid-hover`, `--color-danger-subtle-hover`, `--color-danger-subtle-active`, `--color-success-solid-hover`, and `--color-warning-solid-hover`, forcing component rules to overload text tokens for hover fills.
5. **Documentation & HTML Specimen Drift:**
   * [index.html](../../index.html) contrast matrix prints stale values (`14.2:1`, `8.3:1`, `6.4:1`, `3.3:1`, `Lc 84`) that disagree with actual [css/stone-tokens.css](../../css/stone-tokens.css) values (`18.03:1`, `7.57:1`, `6.09:1`, `4.41:1`), and describes `xs`/`sm` button sizes as `30px`/`34px` while CSS defines `1.75rem` (`28px`) and `2rem` (`32px`).
   * [docs/designs/stone-base-architecture.md](stone-base-architecture.md) still states `"verify no unrequested source-code files exist"` from v1.0, and [spec/01-foundations-and-tokens.md](../../spec/01-foundations-and-tokens.md) omits destructive hover and subtle hover rows from its WCAG verification table.
   * [README.md](../../README.md), [llms.txt](../../llms.txt), [STONE-SYSTEM-PORTABLE.md](../../STONE-SYSTEM-PORTABLE.md), and [prompts/SWITCH-TO-STONE.md](../../prompts/SWITCH-TO-STONE.md) hardcode `"Slate-Cobalt (248°)"` and old OKLCH/Hex values.
6. **Flat Tactile Edge & Hit-Area Overlap:** `danger` solid buttons omit bevel/ambient shadows; `primary`/`ink` `:active` stops reuse `--btn-bg-hover` rather than a distinct pressed depth; `xs`/`sm` `inset: -6px` `::after` targets overlap inside tight `.stone-btn-group` and compact clusters.

## Goals

*   **G1 — Modern App-Grade Vivid Controls on Calm Stone:** Raise primary interactive Cobalt (`hue 258°–260°`) solid chroma from `0.095` to `0.203–0.214` (2.1x saturation density) while keeping 85–90% of neutral surfaces in Warm Mineral Stone (`72°`, refined chroma `0.002–0.010`) so small interactive controls command clear focal priority.
*   **G2 — Crisp Semantic Hues Across Light & Dark:** Replace muddy brick red, mustard yellow, and polarity-flipping green with sRGB-gamut **Crimson (`24°–26°`)**, **Emerald (`158°`)**, and **Honey Amber (`74°–76°`)**, preserving unified `#ffffff` foreground ink across `primary`, `danger`, and `success` solid actions and dark ink on `warning` solid actions.
*   **G3 — Correct Light/Dark Hover Physics Within Strict AA:** Light solid buttons **deepen** on hover (`accent-9` -> `accent-10`, ~`-0.06 L`) for pressed contrast on pale stone; Dark solid buttons **illuminate** (`accent-9` `~0.525 L` -> `accent-10` `~0.568 L`) with brightened specular top-rims while keeping every rest, hover, and active state `>= 4.65:1` WCAG 2.2 AA and `100%` in-sRGB gamut.
*   **G4 — Soft/Subtle Button & Surface Tactile Parity:** Introduce dedicated `bg`, `bg-hover`, `bg-active`, and soft `border-subtle` semantic tokens for `accent`, `danger`, `success`, and `warning` soft buttons, add unified top highlight + bottom contact edge shadows on `danger`, and eliminate `::after` overlap inside button groups.
*   **G5 — Single-Source Truth Across MD, CSS, and HTML:** Synchronize every hex, OKLCH token, WCAG/APCA measurement table, and component prose across [spec/01-foundations-and-tokens.md](../../spec/01-foundations-and-tokens.md), [spec/02-boxes-and-surfaces.md](../../spec/02-boxes-and-surfaces.md), [spec/03-typography-and-layout.md](../../spec/03-typography-and-layout.md), [spec/04-interactions-and-motion.md](../../spec/04-interactions-and-motion.md), [spec/05-suite-shell-and-copy.md](../../spec/05-suite-shell-and-copy.md), [STONE-SYSTEM-PORTABLE.md](../../STONE-SYSTEM-PORTABLE.md), [prompts/SWITCH-TO-STONE.md](../../prompts/SWITCH-TO-STONE.md), [README.md](../../README.md), [llms.txt](../../llms.txt), [docs/designs/stone-base-architecture.md](stone-base-architecture.md), and all three HTML pages via automated CI/script verification.

## Non-Goals

*   Introducing multi-theme brand builders or runtime hue sliders outside `.dark` / Light Stone polarity.
*   Shipping out-of-gamut Display P3 fallback forks before an sRGB base proves insufficient (all v1.2 values sit cleanly inside sRGB so cross-monitor rendering matches).
*   Rewriting layout grids, suite dual-shell structure (`shell-compact` / `shell-workspace`), or container/typography scales beyond color/button alignment fixes.

## Target Architecture & Verified Color Matrix

### Comparative Live Benchmarks Inspected

| System | Primary Blue Solid | Hover Direction (Light / Dark) | Soft / Subtle Treatment |
| --- | --- | --- | --- |
| **Tailwind v4** | `Blue 600`: `oklch(0.546 0.245 262.88)` (`#155dfc`, `5.26:1`) | Step `600 -> 700` darken (`#1447e6`) | `100 -> 200` tinted bg + `700` ink |
| **Radix Colors v3** | `Blue 9`: `#0090ff` (`3.18:1` WCAG / high APCA) | Light `#0588f0` darken; Dark `#3b9eff` brighten | Steps `3 -> 4 -> 5` fill + Step `6/7` border + inset `rgba(255,255,255,0.22)` rim |
| **Vercel Geist** | Light `#0068d6` (`5.29:1`) / Dark `#0072f5` (`4.64:1`) | Light `#0057b8` darken; Dark `#1a85ff` brighten (`3.62:1`) | Blue `100/200/300` stepped dark & light washes |
| **Stone v1.1 (Old)** | Light `#215786` / Dark `#2e6697` (`C=0.095–0.098`) | Light `#134671`; Dark `#4077aa` (**Dark Danger hover bug `#fa9b94`: `2.06:1`**) | Flat `danger-bg` across rest/hover/active + dark rusty border |
| **Stone `v1.1.1a` (Implemented)** | **Electric Cobalt (`258°–260°`)** Light `#1264e2` (`5.30:1`) / Dark `#1160d8` (`5.71:1`) | Light `#0e55c1` (`6.82:1` deepen); Dark `#166eeb` (`4.68:1` illuminate) | Dedicated subtle `bg` -> `bg-hover` -> `bg-active` + soft `border-subtle` |

### Key Token Additions (Tier 2 Contract)

Add missing semantic action state roles in [css/stone-tokens.css](../../css/stone-tokens.css) so no component ever borrows a text token for a button fill:

```text
--color-danger-solid-hover     --color-danger-solid-active
--color-danger-subtle          --color-danger-subtle-hover     --color-danger-subtle-active     --color-danger-border-subtle
--color-success-solid-hover    --color-success-subtle          --color-success-subtle-hover     --color-success-border-subtle
--color-warning-solid-hover    --color-warning-subtle          --color-warning-subtle-hover     --color-warning-border-subtle
--color-accent-solid-active    --color-ink-solid-active        --color-border-control
```

*   **Implemented Neutrals (`Warm Chalk Light` & `Neutral Obsidian Dark`, `72°`, 100% sRGB):**
    *   Light: `well` `#edebe9`, `1` (canvas) `#f8f6f4`, `surface`/`raised` `#fffefe`, `3..5` `#e8e7e5 -> #dddbd8 -> #d1cecb`, `7` `#797673` (`4.48:1` vs surface/raised), `9..10` `#141311 -> #090807`, `11` `#514f4c` (`8.14:1` / `Lc 87.9`), `12` `#12100f` (`18.86:1` / `Lc 105.0`).
    *   Dark (Obsidian): `well` `#070706`, `1` (canvas) `#0e0e0d`, `surface` `#161514`, `raised` `#1f1e1d`, `3..5` `#272624 -> #32302f -> #3c3b39`, `7` `#7c7976` (`3.85:1` vs raised), `9..10` `#f0efee -> #fdfcfc`, `11` `#cfcdca` (`11.42:1` / `Lc 75.3`), `12` `#edebea` (`15.34:1` / `Lc 94.4`).
*   **Implemented Core Accent (`Electric Cobalt`, `252°–260°`, 100% sRGB):**
    *   Light: `accent-2` `#e3edfd`, `accent-3` `#cde0fc`, `accent-4` `#b5d1fc`, `accent-7` `#4080e4` (`3.83:1`), `accent-8` `#206ae1` (`4.98:1` focus ring), **`accent-9` `#1264e2` (`5.30:1`, `Lc 80.9`)**, **`accent-10` `#0e55c1` (`6.82:1`, `Lc 87.8`)**, `accent-11` `#0c50b9` (`7.26:1` / `Lc 84.2` on surface), `accent-12` `#062c69` (`11.37:1` / `Lc 88.2` on `accent-2`).
    *   Dark: `accent-2` `#0f1d31`, `accent-3` `#122747`, `accent-4` `#16325c`, `accent-7` `#3d81e4` (`4.73:1`), `accent-8` `#4f99f9` (`6.27:1` ring), **`accent-9` `#1160d8` (`5.71:1`, `Lc 83.1`)**, **`accent-10` `#166eeb` (`4.68:1`, `Lc 77.2`)**, `accent-11` `#a9d0fc` (`11.36:1` / `Lc 75.1` on surface), `accent-12` `#cbe2fd` (`12.84:1` / `Lc 86.1` on `accent-2`).
*   **Implemented Destructive (`Crimson`, `22°–26°`, 100% sRGB):**
    *   Light: `danger-bg` `#feebea` -> `bg-hover` `#fddbd7` -> `bg-active` `#fcc8c4`; `danger-border-subtle` `#f99e97`; **`danger-solid` `#d61e27` (`5.15:1`)** -> **`danger-solid-hover` `#b61820` (`6.68:1`)** -> `#9e131a` (`8.21:1`); `danger-text` `#a4151c` (`6.81:1` / `Lc 75.8` on `danger-bg`).
    *   Dark: `danger-bg` `#331312` -> `bg-hover` `#481918` -> `bg-active` `#5c1f1e`; `danger-border-subtle` `#8a2f2d`; **`danger-solid` `#cc1b25` (`5.58:1`)** -> **`danger-solid-hover` `#de232b` (`4.78:1`)** -> `#b91921` (`6.49:1`); `danger-text` `#fcb4b0` (`9.88:1` / `Lc 70.3` on `danger-bg`).
*   **Implemented Success (`Emerald`, `158°`, 100% sRGB, unified `#ffffff` solid label polarity):**
    *   Light: `success-bg` `#e0f5e8` -> `bg-hover` `#c7edd5` -> `#ade3c2`; `success-border-subtle` `#85c7a0`; **`success-solid` `#177e50` (`5.09:1`)** -> **`success-solid-hover` `#126a43` (`6.62:1`)** -> `#0e5c39` (`8.08:1`); `success-text` `#0e5a38` (`7.25:1` / `Lc 79.3`).
    *   Dark: `success-bg` `#062415` -> `bg-hover` `#05321d` -> `#073f26`; `success-border-subtle` `#155b3a`; **`success-solid` `#177b4e` (`5.30:1`)** -> **`success-solid-hover` `#198454` (`4.69:1`)** -> `#136e46` (`6.25:1`); `success-text` `#83deab` (`10.27:1` / `Lc 73.5`).
*   **Implemented Warning (`Honey Amber`, `70°–80°`, 100% sRGB, dark stone ink):**
    *   Light: `warning-bg` `#feefd7` -> `bg-hover` `#fce1b7` -> `#fbd297`; `warning-border-subtle` `#ebb25d`; `warning-solid` `#fab42c` (`10.49:1` / `Lc 69.9`) -> `hover` `#eba327` (`8.89:1` / `Lc 61.7`) -> `#e39c25`; `warning-text` `#774c0c` (`6.57:1` / `Lc 77.1`).
    *   Dark: `warning-bg` `#2c1c05` -> `bg-hover` `#3b2705` -> `#4b3206`; `warning-border-subtle` `#704b0e`; `warning-solid` `#f3a82b` (`9.61:1` / `Lc 64.7`) -> `hover` `#fbb644` (`10.96:1` / `Lc 71.2`) -> `#e19b25`; `warning-text` `#f7bd65` (`9.76:1` / `Lc 71.0`).

## Alternatives Considered

1. **Cobalt `258°–260°` vs. Purplish Indigo (`270°–277°`) vs. Desaturated Steel (`248°`):**
   * *Trade-off:* Pure Indigo (`#4f39f6`) boosts contrast on `#ffffff` slightly further (`6.44:1`) but shifts the accent identity from blue toward violet. Keeping Warm Mineral Stone (`72°`) neutrals paired with Electric Cobalt (`258°–260°`) delivers crisp modern blue identity directly aligned with the neutral stone palette without purple cast.
2. **Dark Mode Solid Hover Luminance (`+ΔL` Brightening Within AA vs. `-ΔL` Darkening vs. Bright-Blue + Dark-Ink Inversion):**
   * *Trade-off:* Bright-blue buttons with black text in dark mode (e.g., `#5ea4ff` + `#0b0e14`) clash visually with white-text Light CTAs and weaken perceived authority of primary actions. Darkening on dark mode feels backwards visually. Calibrating Dark rest near `L=0.520–0.532` and Dark hover near `L=0.566–0.578` provides genuine hover brightening (`+4.6% L` + top bevel sheen boost) while holding strict `>= 4.65:1` white-text WCAG AA contrast.

## Risks & Mitigations

*   **Token Divergence Across 3 Files:** Defining literals separately in `css/stone-tokens.css`, `spec/01`, and `STONE-SYSTEM-PORTABLE.md` caused previous silent drift (`index.html` showed stale contrast numbers). *Mitigation:* Add an automated verification assertion checking that every OKLCH literal and WCAG table cell in `spec/01`, `STONE-SYSTEM-PORTABLE.md`, and `index.html` matches `css/stone-tokens.css` programmatically.
*   **Tight Dark-Mode Hover Contrast Headroom:** Dark `accent-10` (`4.68:1`) and `success-solid-hover` (`4.69:1`) sit closer to the `4.5:1` floor than Light mode (`6.82:1`). *Mitigation:* Locked solver outputs (`verify_stone_v1_1_1a.py`) enforce `>= 4.68:1` WCAG AA and `Lc >= 60/65/75` across all 36 Light + 36 Dark checks, while preserving pure `#ffffff` crisp font smoothing.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Files to Modify

1. **`css/stone-tokens.css`** — Replace Tier-1 Light & `.dark` `--stone-*`, `--accent-*`, `--danger-*`, `--warning-*`, and `--success-*` OKLCH steps with the verified v1.2 scales. Add Tier-2 `--color-danger-solid-hover`, `--color-danger-solid-active`, `--color-danger-subtle`, `--color-danger-subtle-hover`, `--color-danger-subtle-active`, `--color-danger-border-subtle`, `--color-success-solid-hover`, `--color-success-subtle`, `--color-success-subtle-hover`, `--color-success-border-subtle`, `--color-warning-solid-hover`, `--color-warning-subtle`, `--color-warning-subtle-hover`, `--color-warning-border-subtle`, `--color-accent-solid-active`, `--color-ink-solid-active`, `--color-border-control`, and subtle button hover shadow/bevel variables (`--shadow-bevel-cta-hover`). Unify `--color-success-on-solid: #ffffff` across both Light and `.dark`.
2. **`css/stone-components.css`** —
   * Fix `.stone-btn[data-variant="danger"]`: use `--btn-bg-hover: var(--color-danger-solid-hover)`, `--btn-bg-active: var(--color-danger-solid-active)`, and add `--btn-shadow: var(--shadow-bevel-cta), var(--shadow-1)`.
   * Fix `.stone-btn[data-variant="danger-subtle"]`: map `--btn-bg: var(--color-danger-subtle)`, `--btn-bg-hover: var(--color-danger-subtle-hover)`, `--btn-bg-active: var(--color-danger-subtle-active)`, `--btn-border: var(--color-danger-border-subtle)`.
   * Add `.stone-btn[data-variant="success"]` / `success-subtle` (or verify clean button variant coverage across semantic action showcases) plus refine `accent-subtle` border to subtle/hover balance, distinct `--btn-bg-active` steps on `primary` / `ink`, and crisp border visibility on `secondary` (`--color-border-control`) & `surface` (`--color-border-control` + hover lift).
   * Scope `xs`/`sm` `::after { inset: -6px; }` cleanly so `.stone-btn-group > .stone-btn` omits overhanging pseudo-hit zones that collide with siblings.
3. **`spec/01-foundations-and-tokens.md`** — Update hue/chroma narrative from `Slate-Cobalt (248°)` to `Electric Cobalt (258°–260°)`; update Tier-1 & Tier-2 tables + CSS block to exact v1.2 values; regenerate and verify **every** foreground/background pair in the contrast matrix (explicitly including `danger` hover, `danger-subtle` rest/hover, `success` rest/hover, `warning` rest/hover, and `accent-subtle` hover in both Light & `.dark`).
4. **`spec/02-boxes-and-surfaces.md`, `spec/03-typography-and-layout.md`, `spec/04-interactions-and-motion.md`, `spec/05-suite-shell-and-copy.md`** — Update references to `xs`/`sm` hit zones (`28px`/`32px` visible box), updated Light/Dark bevel & hover behavior (`deepen Light, illuminate Dark`), and any v1.2 button variant rules (`success`, `danger-subtle` border rule).
5. **`STONE-SYSTEM-PORTABLE.md`, `prompts/SWITCH-TO-STONE.md`, `README.md`, `llms.txt`, `docs/designs/stone-base-architecture.md`** — Sync embedded token contract, prompt checklists, overview prose, and replace obsolete v1.0 pre-code verification statements in [docs/designs/stone-base-architecture.md](stone-base-architecture.md) with accurate v1.2 suite structure.
6. **`index.html`, `examples/compact-utility.html`, `examples/workspace-app.html`** — Update swatch grid subtitles/copy metadata (`Electric Cobalt (258°–260°)`, `Crimson 26°`, `Emerald 158°`, `Amber 74°`), regenerate the WCAG/APCA contrast table rows from programmatic outputs (eliminating stale `14.2:1`/`8.3:1`/`6.4:1` rows), fix `xs (28px)`/`sm (32px)` prose, and add live interactive showcases for `danger`, `danger-subtle`, `success`, and `accent-subtle` hover/press comparison in both Light & `.dark`.

### Verification Plan

1. **Automated Palette, Gamut, Contrast & Doc-Sync Script:** Write/run `verify_stone_v1_2.py` to assert `100%` sRGB in-gamut across every Light & `.dark` variable in [css/stone-tokens.css](../../css/stone-tokens.css), verify `0` WCAG 2.2 AA failures (`>= 4.5:1` text & button labels, `>= 3.0:1` UI borders/focus rings across rest, hover, active, subtle), and verify byte-exact parity between `css/stone-tokens.css`, `spec/01-foundations-and-tokens.md`, `STONE-SYSTEM-PORTABLE.md`, and `index.html`.
2. **Existing Structural & Syntax Gates:** Run `verify_stone_html.py` (Tier-2 token enforcement, link integrity, no raw colors outside `stone-tokens.css`) and `node --check js/stone-ui.js js/reference-docs.js`.
3. **Live Headless Browser Visual & Computed-Style Verification:** Launch local static server, open `index.html`, `examples/compact-utility.html`, and `examples/workspace-app.html` via browser subagent (`Model: "flash"`), inspect button strips in Light and `.dark`, actively hover & press `primary`, `danger`, `danger-subtle`, `accent-subtle`, `secondary`, and `surface` controls, test `320px` and `1440px` layouts, and inspect fresh PNG screenshots with `read_file`.
