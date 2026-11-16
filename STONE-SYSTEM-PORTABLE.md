# Stone Base `v1.1.2` — Portable Single-File Design System

Drop this file into any repository (`.agents/rules/`, `AGENTS.md`, `CLAUDE.md`, or `docs/DESIGN_SYSTEM.md`) to enforce the **Stone Base (`v1.1.2`)** design language across apps, graphs, worker dashboards, reservation pickers, and background automation consoles. Strictly under `24,000` bytes.

---

## 1. Non-Negotiable Architecture Rules

1. **Semantic Tokens Only (Two-Tier Contract):** Components consume Tier-2 roles ONLY (`--color-bg-*`, `--color-text-*`, `--color-border-*`, `--color-accent-*`, `--color-chart-*`, `--color-glass-*`, `--color-sidebar-*`). Never write hex/rgb/oklch literals or Tier-1 `--stone-*`/`--accent-*` variables inside component rules.
2. **Closed 6-Box Taxonomy:** Every surface uses `.stone-canvas` (`0`), `.stone-well` (`-1`), `.stone-surface` (`1`), `.stone-raised` (`1.5`), `.stone-overlay` (`2`, opaque `--stone-raised`), or `.stone-modal` (`3`). Never nest `Surface > Surface > Surface`; cap nesting at 1 `Well` inside `Surface`. Use `.stone-inset` for flush edge tables/media.
3. **Selective Lightweight Ceramic Transparency (`0.94–0.95` Alpha):** Apply frosted glass (`backdrop-filter: blur(12px) saturate(135%)` + `isolation: isolate` + `--color-glass-rim` bevel) STRICTLY on `.stone-topbar`, `.stone-floating-bar`, and `.stone-toast`. Cards, inputs, menus, chart tooltips, modal bodies, tables, and `dialog::backdrop` stay opaque/unblurred. Enforce `@media (prefers-reduced-transparency: reduce)` & `prefers-contrast: more` solid overrides.
4. **Concentric Radii & Quantized Grid:** `v1.1.2` uses fixed `rem` steps (`4px / 8px` grid; no fractional layout scale multipliers). Nested boxes with `<= 24px` padding obey `r_inner = max(4px, var(--outer-radius) - var(--outer-pad) - 1px)`. Progressive `corner-shape: squircle` applies inside `@supports`, excluding `[data-shape="pill"]`, `[data-shape="square"]`, and segmented/group buttons.
5. **Single Theme Switch (`.dark`) + CSP Safety:** Initialize theme/direction/corner pre-paint via `<script src="./js/stone-boot.js"></script>`. Suppress transition smears during theme toggle via `html[data-theme-switching="true"]` for 2 `rAF` frames (no inline `<style>` or `onclick=` handlers).
6. **Frequency-Gated Motion:** `0ms` on `Cmd+K` / hotkeys / adjacent tooltip handoff; `<= 150ms` opacity/bg on hovers/tabs; `160–260ms var(--ease-out)` on popovers/modals/drawers. Never use `transition: all`, `ease-in`, or `scale(0)`. Always guard hover styling inside `@media (hover: hover) and (pointer: fine)`.
7. **Suite Shells & Domain Continuity:** Small utilities use `.stone-shell--compact` (`--container-md` `688px` or `--container-lg` `880px` for reservations); workspaces use `.stone-shell--workspace` (`256px` `Ctrl+B` collapsible rail / `48px` collapsed rail + curved `--radius-xl` `.stone-sidebar-inset` + optional `>= 64rem` `.stone-inspector`). Keep `#main-content`, top-leading Suite Switcher, and `44px` mobile hit targets consistent everywhere.

---

## 2. Integration Tracks (Choose Track A or Track B)

### Track A — Pure CSS & Zero-Build JS (HTML / Vanilla / SSR)

```html
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="stone-storage-prefix" content="myapp">
  <script src="./js/stone-boot.js"></script>
  <link rel="stylesheet" href="./css/stone-tokens.css">
  <link rel="stylesheet" href="./css/stone-base.css">
  <link rel="stylesheet" href="./css/stone-components.css">
  <link rel="stylesheet" href="./css/stone-shells.css">
  <link rel="stylesheet" href="./css/stone-patterns.css"> <!-- Graphs, Calendars, Waterfalls -->
  <script src="./js/stone-ui.js" defer></script>
</head>
```

*Migration shim:* Add `css/stone-compat-v1_1.css` after `stone-components.css` only if migrating legacy `.stone-btn[data-variant="accent-subtle|success|warning"]` markup.

### Track B — Tailwind CSS v4 (`@theme inline`) Bridge

Import `stone-tokens.css` before Tailwind utilities and map only Tier-2 semantics in `@theme`:

```css
@import "./stone-tokens.css";
@import "tailwindcss";

@theme inline {
  --color-canvas: var(--color-bg-canvas);
  --color-well: var(--color-bg-well);
  --color-surface: var(--color-bg-surface);
  --color-raised: var(--color-bg-raised);
  --color-overlay: var(--color-bg-overlay);
  --color-accent: var(--color-accent-solid);
  --color-accent-hover: var(--color-accent-solid-hover);
  --color-danger: var(--color-danger-solid);
  --color-warning: var(--color-warning-solid);
  --color-success: var(--color-success-solid);
  --color-ink: var(--color-text-primary);
  --color-ink-muted: var(--color-text-secondary);
  --color-chart-1: var(--color-chart-1);
  --color-chart-2: var(--color-chart-2);
  --color-chart-3: var(--color-chart-3);
  --color-chart-4: var(--color-chart-4);
  --color-chart-5: var(--color-chart-5);
  --color-chart-6: var(--color-chart-6);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}
```

---

## 3. Canonical Token Reference (`v1.1.2` Verified Values)

- **Layer Order (`stone-tokens.css`):** `@layer reset, tokens, base, primitives, components, shells, patterns;`
- **Type Scale (`rem` only):** `--text-display` (`clamp(1.625rem, 1.25rem + 1.5vw, 2.25rem)` `1.10`), `--text-title` (`clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` `1.20`), `--text-heading` (`1.125rem` `1.30`), `--text-body` (`1rem` `1.50`), `--text-body-sm` (`0.875rem` `1.45`), `--text-caption` (`0.8125rem` `1.40`), `--text-overline` (`0.75rem` `1.40` `0.05em`). Inputs `< 48rem` hold `1rem` (`16px`) floor to block iOS auto-zoom.
- **Spacing & Containers:** `--space-1..10` (`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px`), `--topbar-height: 3rem`, `--container-sm: 28rem` (`448px`), `--container-md: 43rem` (`688px`), `--container-lg: 55rem` (`880px`), `--container-xl: 71rem` (`1136px`).
- **Radii (4 Tracks):** `--radius-xs: 4px` (micro checks/kbd), `--radius-sm: 6px` (buttons/inputs/slots), `--radius-md: 8px` (wells), `--radius-lg: 12px` (surfaces/popovers), `--radius-xl: 16px` (modals/SidebarInset), `--radius-full: 9999px` (capsules/docks).
- **Motion:** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out`, `--ease-drawer`; `--dur-press: 150ms`, `--dur-tooltip: 125ms`, `--dur-popover: 160ms`, `--dur-modal: 180ms`, `--dur-drawer: 260ms`.

### Light (`Warm Chalk 72°`) & Dark (`Obsidian 72°`) Palette Highlights (`100%` sRGB)

| Semantic Token | Light Hex (`WCAG`) | Dark Hex (`WCAG`) | Role |
| --- | --- | --- | --- |
| `--color-bg-well` | `#ebe9e6` (`L 0.934`) | `#070706` (`L 0.128`) | Recessed log / JSON / code well |
| `--color-bg-canvas` | `#f4f3f1` (`L 0.964`) | `#0e0e0d` (`L 0.162`) | Page ground canvas |
| `--color-bg-surface` | `#fbfaf9` (`L 0.986`) | `#161514` (`L 0.198`) | Primary card / table wrapper |
| `--color-bg-raised` / `overlay` | `#fffefe` (`L 0.998`) | `#1f1e1d` (`L 0.236`) | Raised card / tooltip / modal surface |
| `--color-bg-skeleton` | `#dddbd8` (`L 0.892`) | `#3a3937` (`L 0.345`) | Async skeleton bar |
| `--color-text-primary` | `#12100f` (`18.22:1`) | `#edebea` (`15.34:1`) | Primary body & headings |
| `--color-text-secondary` | `#504d4a` (`8.06:1`) | `#cfcdca` (`11.42:1`) | Captions, metadata |
| `--color-text-placeholder` | `#4d4a47` (`8.35:1`) | `#c7c5c2` (`10.45:1`) | Accessible placeholders (`opacity: 1`) |
| `--color-border-control` | `oklch(0 0 0 / 0.44)` (`3.22:1`) | `oklch(1 0 0 / 0.36)` (`3.32:1`) | Inputs, checkboxes, buttons, slots |
| `--color-border-focus` | `#1762d8` (`5.36:1`) | `#438ceb` (`5.36:1`) | `:focus-visible` `2px` outline |
| `--color-accent-solid` / hover | `#0f5ed6` (`5.83:1`) / `#0a50b9` (`7.37:1`) | `#0c59cc` (`6.35:1`) / `#1163df` (`5.43:1`) | Primary CTA (`#fff` label) |
| `--color-danger-solid` / hover | `#d21e27` (`5.30:1`) / `#b3171f` (`6.85:1`) | `#bf1721` (`6.24:1`) / `#cf1b25` (`5.45:1`) | Destructive CTA & Hold progress |
| `--color-success-solid` / hover | `#167a4e` (`5.32:1`) / `#116741` (`6.92:1`) | `#147248` (`5.98:1`) / `#167b4e` (`5.25:1`) | Confirmation / Completed badge |
| `--color-glass-topbar` / `dock` | `oklch(0.986 0.002 72 / 0.94)` | `oklch(0.198 0.003 72 / 0.94)` | Ceramic topbar & floating dock |
| `--color-chart-1` .. `--color-chart-6` | `#11739d`, `#1e8a85`, `#6d46b3`, `#b44591`, `#aa5016`, `#657f2f` (`>= 4.01:1`) | `#38a6ca`, `#42cac3`, `#9d7de7`, `#ed86c4`, `#ea8d52`, `#a7c76a` (`>= 5.64:1`) | 6-series charts & SLA trend lines |

---

## 4. Core Primitives & Domain Playbook

- **Buttons (`.stone-btn`):** 7 core variants (`primary`, `ink`, `secondary`, `surface`, `ghost`, `danger`, `danger-subtle`). `[data-toggle-emphasis="accent"][aria-pressed="true"]` opts into Cobalt pressed fill. `.stone-hold-btn` uses darkened `--color-danger-solid-active` (`>= 7.4:1`) and cancels on `blur`/`Escape`. Coarse/mobile buttons force `44px` height cleanly.
- **Forms & Tables:** Inputs use `--color-border-control` + `1rem` mobile floor; `.stone-checkbox` handles `:checked`, `:indeterminate`, `:disabled`, and `forced-colors`; `.stone-choice-card` frames selectable tier cards; `thead th` stays sticky on scrollable tables; `[data-select-all]` computes `:indeterminate` over `tbody tr:not([hidden])` and syncs `.stone-floating-bar` (`[hidden]` behind modals).
- **4 Operational Domains (`css/stone-patterns.css`):**
  1. **Graphs:** `.stone-chart-card__header` + `.stone-chart-tabs` + `.stone-chart-frame` + opaque `.stone-chart-tooltip` (`tabular-nums`).
  2. **Worker Ops:** `@container` `.stone-bento-grid`, ringed `.stone-badge[data-shape="pill"]` + `.stone-badge__dot`, sticky roster, `>= 64rem` trailing `.stone-inspector` + mobile dialog.
  3. **Reservations:** `.stone-calendar` (7-col grid, `>= 44px` cells, logical range rounding) + `.stone-slot-list` with 5 non-color states (`available`, `confirmed`, `pending`, `conflict`, `unavailable`).
  4. **Automation Queues:** `.stone-sync-banner`, 6 lifecycle tones, `[data-row-expand]` `.stone-table__detail` logs, 2-segment `.stone-waterfall` bars, and stacked `.stone-prop-row--block` JSON payloads inside `.stone-well`.
- **RTL, A11y & Copy:** Logical properties only (`margin-inline-start`, `inset-inline`, `100%` / `100dvh`), `<bdi>` around embedded LTR IDs/times/JSON, Unicode `→`/`↔`/`…`, native `<button>`/`<a href>`/`<dialog>`, and verb-first sentence-case labels.
