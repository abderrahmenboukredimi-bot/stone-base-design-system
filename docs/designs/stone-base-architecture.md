# Stone Base — Level-0 Universal Design System Architecture

*   **Author:** Project Owner
*   **Status:** Implemented & Upgraded to **`v1.1.2`** (All-in-One Suite: Graphs, Workers, Reservations, Automation + Selective Ceramic Chrome; supersedes `v1.1.1a`)
*   **Date:** 2026-11-16

> [!NOTE]
> The canonical active specification now lives in [spec/01](../../spec/01-foundations-and-tokens.md)–[spec/06](../../spec/06-domain-patterns.md) (`v1.1.2`), [STONE-SYSTEM-PORTABLE.md](../../STONE-SYSTEM-PORTABLE.md), [the workspace `stone-base` skill](../../.agents/skills/stone-base/SKILL.md), and the automated CI/CLI verifier [scripts/verify_stone.py](../../scripts/verify_stone.py).

--------------------------------------------------------------------------------

## Overview

**Stone Base** is a ground-level, framework-agnostic design language and specification suite for building connected applications ranging from small single-purpose utilities to large multi-view workspaces under one visual, structural, and behavioral foundation. The deliverable consists of a machine-readable `llms.txt` index, modular Markdown specifications (`spec/01`–`spec/05`), a single-file portable reference (`STONE-SYSTEM-PORTABLE.md`), and deterministic AI migration prompts (`prompts/SWITCH-TO-STONE.md`).

## The Problem

Building multiple applications without a shared Level-0 design contract causes each project to accumulate ad-hoc colors, custom box elevations, divergent corner radii, inconsistent typography scales, mismatched interaction timings, and incompatible navigation headers. Converting or unifying those apps later requires manual redesign across every codebase because no canonical token schema, box taxonomy, or migration prompt exists.

## Goals

*   **G1 — Single Neutral Foundation:** Provide one verified Warm Chalk Light and Neutral Obsidian Dark ramp (`hue 72°`) paired with an Electric Cobalt interactive accent (`hue 258°–260°`) and three isolated 9-role status ramps (`danger` Crimson, `warning` Honey Amber, `success` Emerald), all 100% inside the sRGB gamut and passing both WCAG 2.2 AA contrast (`>= 4.5:1` text, `>= 3.0:1` UI boundaries and focus indicators) and APCA `Lc` (`>= 60/65/75`).
*   **G2 — Uniform Cross-App Box Taxonomy:** Standardize exactly 6 Box Primitives (`Canvas`, `Well`, `Surface`, `Raised`, `Overlay`, `Modal`), 4 padding presets (`xs`–`lg`), 4 container widths (`sm`–`xl`), a root `--density-scale` multiplier (`0.9` / `1.0` / `1.1`), and concentric radius math across all apps.
*   **G3 — Coherent Small-to-Big Suite Connection:** Connect compact tools (`shell-compact`) and large workspaces (`shell-workspace`) using one fixed top-leading Suite Switcher Anchor, one `0ms` `Cmd+K` app launcher, and dedicated sidebar chrome tokens.
*   **G4 — Deterministic AI Adoption:** Package the system as an `llms.txt`-indexed Markdown suite and four copy-pasteable prompts (`Audit`, `Migrate`, `Bootstrap`, `Compliance Gate`) so coding agents can convert existing or new apps cleanly.

## Non-Goals

*   Publishing a compiled npm UI component library or framework-specific runtime package (framework bindings can wrap the canonical HTML/CSS layer when needed).
*   Supporting multi-brand white-labeling or arbitrary runtime theme generators.
*   Introducing build pipelines, CSS preprocessors, or Node bundler dependencies into the zero-build reference showcase (`index.html`, `css/`, `js/`, `examples/`).

## Open Questions

*   None. All three architectural forks (deliverable scope, color polarity/accent model, and dual-shell adaptive suite model) were resolved with the project owner prior to drafting.

## Critical User Journeys (CUJs)

### CUJ 1: Switching an Existing App to Stone Base via AI Agent

*   **Given**: An existing web or client app with ad-hoc colors, cards, fonts, and transitions, plus access to `prompts/SWITCH-TO-STONE.md` and `STONE-SYSTEM-PORTABLE.md` (or `llms.txt`).
*   **When**: The owner runs Prompt 1 (Drift Inventory), reviews the gap list, runs Prompt 2 (Migration), and executes Prompt 4 (Compliance Gate).
*   **Then**: All component color literals map to Tier-2 semantic tokens, containers map to the 6 Stone Box Primitives with concentric radii, interactions obey frequency gates and reduced-motion rules, and the app adopts either `shell-compact` or `shell-workspace` with the Suite Switcher Anchor.

### CUJ 2: Moving Across Small and Large Suite Apps

*   **Given**: A user works inside a small single-purpose utility (`shell-compact`) and switches to a large multi-view dashboard (`shell-workspace`).
*   **When**: The user presses `Cmd+K` (instant `0ms` overlay) or clicks the fixed top-leading Suite Switcher trigger.
*   **Then**: Both apps expose identical stone surface polarity, focus indicators, button press feedback (`scale(0.97)`), and switcher placement while adapting side navigation (`none` vs. `256px` collapsible `Cmd+B` inset rail) and density (`0.9` / `1.0` / `1.1`).

## Technical Plan (Architecture)

```text
+-------------------------------------------------------------------+
| llms.txt  &  README.md  (Discovery Index & Entry Guide)           |
+-------------------------------------------------------------------+
        |
        +---> spec/01-foundations-and-tokens.md (OKLCH Tier 1 & Tier 2 + WCAG/APCA)
        +---> spec/02-boxes-and-surfaces.md     (6 Boxes, 4 Sizes, Concentric Radii)
        +---> spec/03-typography-and-layout.md  (rem Type Scale, Spacing, RTL, Reflow)
        +---> spec/04-interactions-and-motion.md(Frequency Gate, Springs, Icons)
        +---> spec/05-suite-shell-and-copy.md   (Dual Shell, Cmd+K, A11y, UX Copy)
        |
        +---> STONE-SYSTEM-PORTABLE.md          (Single-File Agent Drop-In)
        +---> prompts/SWITCH-TO-STONE.md        (Audit -> Migrate -> Bootstrap -> Gate)
```

*   **Color & Token Architecture (`spec/01`):** 12-step functional OKLCH ramps (following Radix role ordering) for Warm Chalk Light / Neutral Obsidian Dark (`72°`) and Electric Cobalt Accent (`252°–260°`), plus 9-role status ramps (`danger` Crimson `22°–26°`, `warning` Honey Amber `70°–80°`, `success` Emerald `158°`). Dark mode elevates surfaces upward in lightness (`well 0.128` -> `canvas 0.162` -> `surface 0.198` -> `raised 0.236`) paired with `--color-border-hairline` + `--shadow-bevel-*` top-edge highlights, `--color-border-control` on framed controls, and `--color-border-default` (`>= 3.8:1`) on interactive inputs. Theme toggling relies exclusively on `.dark` with transition suppression.
*   **Container & Box Architecture (`spec/02`):** Closed 6-level surface stack (`Canvas`, `Well`, `Surface`, `Raised`, `Overlay`, `Modal`), 4-track shape grammar with progressive `@supports (corner-shape: squircle)`, Bento KPI metric tiles, centered glass Floating Toolbelt (`.stone-floating-bar`), 4 padding steps scaled by `--density-scale`, 4 `max-width` container constraints, forced-colors `border: 1px solid transparent` safety under shadows, and concentric inner/outer radius subtraction.
*   **Typography & Layout (`spec/03`):** Role-based `rem` type scale with responsive `clamp()` on large titles, unitless line heights (`>= 1.4` for wrapping blocks), size-specific tracking, `16px` mobile input floor, `tabular-nums`, logical RTL properties, and `320px` / `200%` zoom reflow.
*   **Motion & Craft (`spec/04`):** Frequency classification (`0ms` for keyboard/Cmd+K `100+/day`), custom curves (`--ease-out`, `--ease-in-out`, `--ease-drawer`), critically damped Apple springs (`damping: 1.0`, `response: 0.3–0.4`), `scale(0.97)` pointer-down feedback across 12 semantic `.stone-btn` variants, origin-aware `var(--transform-origin)` popovers, `prefers-reduced-motion`, and `@media (hover: hover) and (pointer: fine)` gating.
*   **Suite Shell (`spec/05`):** Dual-shell structure (`48px` `shell-compact` vs. `256px` rail + curved `--radius-xl` `<SidebarInset>` `shell-workspace`) sharing one top-leading switcher anchor, `Cmd+K` launcher, WCAG 2.2 AA keyboard/focus/target rules, and unified UX microcopy.

## Alternatives Considered

### Deliverable Scope: Executable CSS/HTML Specimen or React Package vs. Pure Markdown + Token Contract

*   **Pros of CSS/HTML Specimen or React Package:** Provides runnable stylesheets or prebuilt React + Tailwind v4 components directly in the workspace.
*   **Cons:** Couples the Level-0 design system to web CSS/DOM tooling or a specific React/Tailwind stack, requiring rework for non-React or mobile clients.
*   **Reason for Rejection:** Rejected by author: selected Pure Markdown Specification + Framework-Agnostic CSS Token Contract + AI Migration Prompts to maintain zero framework lock-in across any future app stack.

### Color Polarity: Pure Achromatic or Cool Slate vs. Warm Mineral Stone + Single Muted Accent

*   **Pros of Achromatic / Cool Slate:** Maximum neutrality (`0` chroma) or crisp technical look (`~250°` slate) without choosing an interactive accent hue.
*   **Cons:** Pure black/white/gray surfaces feel stark and lack an accent channel for active focus/selection states without borrowing status hues.
*   **Reason for Rejection:** Rejected by author: selected Warm Mineral Stone Neutral (`~72°` Warm Chalk Light / Neutral Obsidian Dark) paired with Electric Cobalt (`258°–260°` in `v1.1.1a`) for tactile mineral character and clear primary-action signaling.

### Suite Chrome: Single Top Bar or Persistent Rail Across All Sizes vs. Dual-Shell Adaptive Suite

*   **Pros of Single Unified Shell:** Eliminates maintaining two shell specs (`shell-compact` and `shell-workspace`).
*   **Cons:** A persistent side rail cramps tiny single-screen utilities, whereas a top-bar-only shell forces deep workspaces into nested horizontal tabs or hidden drawers.
*   **Reason for Rejection:** Rejected by author: selected Dual-Shell Adaptive Suite so small utilities stay uncluttered while big workspaces keep persistent navigation and inset framing under one shared switcher anchor.

--------------------------------------------------------------------------------

## Non-Functional Requirements

*   **Accessibility & Contrast:** Every valid foreground/background pair verified `>= 4.5:1` (`>= 3.0:1` for UI borders and focus rings) in both Light and Dark modes, `100%` within sRGB gamut. Keyboard parity, `:focus-visible` perimeters, `24x24px` target floor (`40–44px` target), and `prefers-reduced-motion` fallbacks ship as hard invariants.
*   **AI Context Efficiency:** `llms.txt` and `STONE-SYSTEM-PORTABLE.md` avoid redundant prose so agents can load exact rules within tight context budgets.

--------------------------------------------------------------------------------

### Additional Resources

*   Vercel Geist Design System (`https://vercel.com/geist/introduction`) — dual-canvas background layering, 1px borders vs. floating blur materials, and concentric grid/radius rules.
*   Radix Colors & Radix Themes (`https://www.radix-ui.com/colors`) — 12-step functional neutral scale (including Sand), `<Box>`/`<Card>`/`<Container>`/`<Inset>` taxonomy, and proportional theme scaling.
*   shadcn/ui (`https://ui.shadcn.com/docs/theming`) — OKLCH semantic surface tokens, `--sidebar-*` chrome isolation, `<SidebarInset>` framing, and `llms.txt` index structure.
*   Base UI (`https://base-ui.com`) — root `isolation: isolate` stacking, `var(--transform-origin)` positioning exports, `[data-starting-style]` transitions, and `.md` spec endpoints.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files Created

1. `llms.txt` (Create) — Machine-readable root index and non-negotiable invariant checklist.
2. `README.md` (Create) — System overview, shell/density matrix, and adoption workflow.
3. `spec/01-foundations-and-tokens.md` (Create) — Tier 1/2 OKLCH palettes, `.dark` switching contract, and computed WCAG/APCA contrast table.
4. `spec/02-boxes-and-surfaces.md` (Create) — 6 Box Primitives, `<Inset>`, 4 box sizes, 4 container widths, `--density-scale`, concentric radii, shadows, and forced-colors borders.
5. `spec/03-typography-and-layout.md` (Create) — Role-based `rem` type scale, spacing scale, grouping order, RTL logical properties, and `320px`/200% reflow guarantees.
6. `spec/04-interactions-and-motion.md` (Create) — Frequency gate, custom easing/spring configs, press feedback, origin-aware overlays, icon stroke pairing, and reduced-motion fallbacks.
7. `spec/05-suite-shell-and-copy.md` (Create) — `shell-compact` and `shell-workspace` specifications, `Cmd+K` launcher, WCAG 2.2 AA rules, and UX writing rules.
8. `prompts/SWITCH-TO-STONE.md` (Create) — Four sequential AI migration/bootstrap/compliance prompts.
9. `STONE-SYSTEM-PORTABLE.md` (Create) — Condensed single-file drop-in rulebook.
10. `docs/designs/stone-base-architecture.md` (Create) — Architectural design record.

### Verification Plan

*   **Automated Color, Gamut & Doc-Sync Verification:** Run `verify_stone_v1_1_1a.py --sync-check` in `scratch/` to confirm `0` out-of-gamut sRGB colors and `0` WCAG 2.2 AA / APCA `Lc` failures across all 36 Light and 36 Dark checks, while asserting 100% Tier-1 OKLCH parity between `css/stone-tokens.css`, `spec/01-foundations-and-tokens.md`, `STONE-SYSTEM-PORTABLE.md`, and `index.html`.
*   **HTML Structure, JS Syntax & Live Chromium Verification:** Verify every relative link across `llms.txt`, `README.md`, `spec/*.md`, `prompts/*.md`, `STONE-SYSTEM-PORTABLE.md`, `docs/designs/*.md`, and all HTML pages via `verify_stone_html.py` + `verify_docs.py`; check JS syntax with `node --check js/stone-ui.js js/reference-docs.js`; verify live hover/active rendering, computed contrast, and `320px`/`1440px` Light + `.dark` layouts in headless Chromium on `index.html`, `examples/compact-utility.html`, and `examples/workspace-app.html`.

--------------------------------------------------------------------------------

*Drafted with EGM*
