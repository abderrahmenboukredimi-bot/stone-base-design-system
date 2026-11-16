---
name: stone-base
description: Apply the Stone Base v1.1.2 universal design system across web apps, dashboards, analytics charts, worker shift managers, calendar reservation tools, and background automation consoles. Use when scaffolding a new UI, migrating an existing app to Stone Base tokens/shells, styling graphs (`--color-chart-1..6`), or implementing selective 0.94 ceramic transparency.
---

# Stone Base (`v1.1.2`) Integration Skill

Follow these exact steps whenever building or migrating an application onto **Stone Base**:

## 1. Progressive Knowledge Loading (Keep Context Small)

1. Check [llms.txt](../../../llms.txt) for file locations, or read [STONE-SYSTEM-PORTABLE.md](../../../STONE-SYSTEM-PORTABLE.md) (`< 24 KB`) for the full compact contract.
2. Read the targeted spec module only for what your task touches:
   - Colors, contrast & theme switch: [spec/01-foundations-and-tokens.md](../../../spec/01-foundations-and-tokens.md)
   - Boxes, ceramic glass, radii & container widths: [spec/02-boxes-and-surfaces.md](../../../spec/02-boxes-and-surfaces.md)
   - Typography, spacing & RTL reflow: [spec/03-typography-and-layout.md](../../../spec/03-typography-and-layout.md)
   - Buttons, overlays, hold-confirm & motion gates: [spec/04-interactions-and-motion.md](../../../spec/04-interactions-and-motion.md)
   - Shells, suite switcher, A11y & microcopy: [spec/05-suite-shell-and-copy.md](../../../spec/05-suite-shell-and-copy.md)
   - **Graphs, Workers, Reservations & Automation:** [spec/06-domain-patterns.md](../../../spec/06-domain-patterns.md)
3. Load [references/tokens-and-tailwind.md](references/tokens-and-tailwind.md) when bridging Tailwind v4 or custom CSS frameworks, and [references/domains-v1_1_2.md](references/domains-v1_1_2.md) for live HTML pattern blueprints.

## 2. Choose Your Integration Track

- **Track A (Zero-Build CSS / HTML / SSR):**
  - Load `js/stone-boot.js` synchronously in `<head>` (pairing `<meta name="stone-storage-prefix" content="...">` and `viewport-fit=cover`).
  - Import layered styles: `css/stone-tokens.css`, `css/stone-base.css`, `css/stone-components.css`, `css/stone-shells.css`, and additive `css/stone-patterns.css` (`@layer patterns;`). Include optional `css/stone-compat-v1_1.css` only when preserving legacy v1.1 button variants (`accent-subtle`, `success`, `warning`).
  - Defer `js/stone-ui.js` (exposes `StoneUI.mount(root, { storagePrefix })` / `destroy()`, emits `CustomEvent`s `stone:inspect`, `stone:selection-change`, `stone:select`, `stone:dialog-action`, `stone:hold-confirm`).
- **Track B (Tailwind v4 / React / Framework):**
  - `@import "./stone-tokens.css";` before `@import "tailwindcss";` and map **only** Tier-2 semantic roles inside `@theme inline`. Never place raw OKLCH/hex literals or `--stone-*` primitives inside JSX/TSX components.

## 3. Mandatory `v1.1.2` Guardrails

- **Selective Ceramic Transparency:** Keep cards, menus, form inputs, scrolling tables/logs, modal bodies, and chart tooltips `100%` opaque, and keep `dialog::backdrop` unblurred. Apply `0.94–0.95` ceramic frosted blur ONLY to `.stone-topbar`, `.stone-floating-bar`, and `.stone-toast` (with `prefers-reduced-transparency` + `prefers-contrast` solid fallbacks).
- **Theme Switching Without CSP Violations:** Toggle `.dark` on `<html>` with `data-theme-switching="true"` over two `requestAnimationFrame` frames; avoid inline `<script>` and `onclick=` attributes.
- **Mobile & RTL Parity:** Enforce `>= 44px` hit height under `@media (pointer: coarse), (max-width: 30rem)`, use logical properties (`inline-start` / `inline-end`), wrap mixed-direction IDs/times in `<bdi>`, and verify `.stone-floating-bar` centers symmetrically and hides when any `<dialog open>` is active.

## 4. Verification Gate

After edits, run:
```powershell
python scripts/verify_stone.py
node --check js/stone-boot.js js/stone-ui.js
```
