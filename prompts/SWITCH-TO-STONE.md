# AI Migration and Bootstrap Prompts (`SWITCH-TO-STONE` · `v1.1.2`)

Use these four prompts sequentially when converting an existing application to **Stone Base `v1.1.2`** or scaffolding a new app inside the suite. Before running any prompt, load [the Stone Base Antigravity skill](../.agents/skills/stone-base/SKILL.md) (or [llms.txt](../llms.txt) &#8594; [spec/01](../spec/01-foundations-and-tokens.md)–[spec/06](../spec/06-domain-patterns.md)) or drop [STONE-SYSTEM-PORTABLE.md](../STONE-SYSTEM-PORTABLE.md) into `.agents/rules/`.

Choose your delivery track:
- **Track A (Pure CSS + Zero-Build JS):** Copy `css/stone-{tokens,base,components,shells,patterns}.css` + `js/stone-{boot,ui}.js` (and optional `css/stone-compat-v1_1.css` for legacy `.stone-btn[data-variant="accent-subtle|success|warning"]`).
- **Track B (Tailwind v4 `@theme inline`):** Import `css/stone-tokens.css` before `@import "tailwindcss";` and bind only Tier-2 tokens inside `@theme inline`.

---

## Prompt 1: Audit Existing App and Build Drift Inventory (Run First, Read-Only)

```markdown
You are a senior design systems engineer auditing this codebase before migrating it to **Stone Base v1.1.2**.

First, load `.agents/skills/stone-base/SKILL.md` (or read `STONE-SYSTEM-PORTABLE.md` / `llms.txt` → `spec/01` through `spec/06`). Do NOT modify any code yet.

Inspect this repository and produce a **Stone Base Drift Inventory** covering:
1. **Track & Styling System:** Identify CSS engine (Vanilla CSS / SSR vs. Tailwind v4 / React), storage namespace prefix, CSP rules (`file://` vs HTTP, inline script/style bans), and existing icons.
2. **Color, Contrast & Chart Inventory:** List hardcoded colors or Tier-1 `--stone-*`/`--accent-*` leaks in components, failing contrasts (<4.5:1 text/placeholders or <3.0:1 borders/focus rings), dark solid CTA hover headroom (<5.2:1), and multi-series charts needing `--color-chart-1..6`.
3. **Boxes & Selective Ceramic Transparency:** Map cards/wells/menus/modals to the 6-box model (`Canvas`, `Well`, `Surface`, `Raised`, `Overlay`, `Modal`), flag nested `Surface > Surface` or translucent blurs on content cards/inputs/menus/dialog backdrops (keep frosted `0.94–0.95` ceramic strictly on `.stone-topbar`, `.stone-floating-bar`, and `.stone-toast`).
4. **Typography, Quantized Spacing & Domain Gaps:** Flag `em` font sizes, `<16px` mobile inputs, `100vw`/`100vh`, physical `left`/`right`, fractional `--density-scale`, and missing domain primitives (worker presence badges, 5-state reservation slots, or 6-state job queue logs/waterfalls).
5. **Shell, Motion, JS & A11y Gaps:** Flag `transition: all`, `ease-in`, `scale(0)`, `inline onclick=`/`<style>` injection, missing editable guards on `Cmd+K`/`Ctrl+B`, un-centered RTL floating bars, `<44px` coarse mobile targets, and un-checked `:indeterminate` checkboxes.

Output only the inventory and a prioritized migration plan. Wait for approval before editing files.
```

---

## Prompt 2: Full Migration to Stone Base (`v1.1.2`)

```markdown
Convert this application to **Stone Base v1.1.2** according to the approved Drift Inventory using either Track A (Pure CSS `stone-tokens..patterns.css` + `stone-boot.js`/`stone-ui.js`) or Track B (Tailwind v4 `@theme inline` importing `stone-tokens.css`).

Execute in dependency order:

### Phase 1 — Tokens, Palette & Ceramic Chrome (`spec/01-foundations-and-tokens.md`)
- Install `css/stone-tokens.css` (`v1.1.2`: Warm Chalk `72°` Light with `surface 0.986` / `raised 0.998`, Obsidian Dark `72°`, monotonic Electric Cobalt `258°–260°` with `>= 5.2:1` Dark solid CTA hover headroom, `--color-border-control` `>= 3.22:1`, `--color-bg-skeleton`, `--color-text-placeholder`, `--color-chart-1..6`, and `0.94–0.95` ceramic tokens `--color-glass-topbar/dock/toast`).
- Add `<meta name="stone-storage-prefix" content="[APP_PREFIX]">` and load `js/stone-boot.js` synchronously in `<head>`. Ensure `.dark` toggle sets `html[data-theme-switching="true"]` cleanly with no inline `<style>` tags.

### Phase 2 — 6 Boxes, Controls & Selective Transparency (`spec/02` & `spec/04`)
- Refactor containers into `Canvas`, `Well`, `Surface`, `Raised`, `Overlay`, and `Modal` with `.stone-inset` edge tables and concentric `--outer-radius`/`--outer-pad` inheritance. Keep cards/menus/tooltips/modals solid (`alpha = 1.0`) and `dialog::backdrop` unblurred; reserve frosted ceramic glass for `.stone-topbar`, `.stone-floating-bar`, and `.stone-toast` (with `prefers-reduced-transparency` and `prefers-contrast` solid overrides).
- Standardize core buttons onto the 7 canonical variants (`primary`, `ink`, `secondary`, `surface`, `ghost`, `danger`, `danger-subtle`), add optional `css/stone-compat-v1_1.css` only if legacy buttons exist, enforce `44px` coarse/mobile hit height cleanly, and implement accessible checkboxes (`:indeterminate`, `:disabled`, `forced-colors`) and `.stone-choice-card`.

### Phase 3 — Typography, Logical Layout & Domain Modules (`spec/03` & `spec/06`)
- Enforce role-based `rem` type scale, quantized `4px / 8px` `--space-1..10`, `tabular-nums`, `16px` mobile inputs, `@container` reflow down to `320px`, logical properties (`inline-start`/`end`), and `<bdi>` around embedded LTR IDs/times/JSON.
- Consume `css/stone-patterns.css` (`@layer patterns;`) for Charts (`--color-chart-1..6` + opaque `.stone-chart-tooltip`), Worker Ops (`@container` Bento + presence pills + sticky tables), Reservations (`7-col` calendar + 5 non-color slot states), or Automation Queues (`.stone-sync-banner`, 6 lifecycle pills, `[data-row-expand]` inline logs, `.stone-waterfall`).

### Phase 4 — Suite Shell & CSP-Safe Runtime (`spec/05`)
- Mount `.stone-shell--compact` (`688px`/`880px`) or `.stone-shell--workspace` (`256px` `Ctrl+B` / `48px` collapsed rail, mobile drawer parity, `scroll-padding-block-start: 3rem`, `#main-content` skip link).
- Mount `StoneUI.mount(root, { storagePrefix })` cleanly; remove inline `onclick=` attributes; listen to semantic `CustomEvent`s (`stone:inspect`, `stone:selection-change`, `stone:dialog-action`, `stone:hold-confirm`); verify Top-Layer `popover="manual"` toasts and visible-row `.stone-floating-bar` RTL centering.

Finish by running Prompt 4 (Post-Migration Compliance Gate).
```

---

## Prompt 3: Bootstrap a New Suite App from Scratch

```markdown
Scaffold a new web application directly on **Stone Base v1.1.2** (`.agents/skills/stone-base/SKILL.md` / `spec/01`–`spec/06`).

Parameters:
- App Name & Prefix: [APP_NAME] (`<meta name="stone-storage-prefix" content="[PREFIX]">`)
- Shell & Container: [shell-compact (`md` 688px | `lg` 880px) | shell-workspace (`xl` 1136px)]
- Domains Included: [Charts | Worker Management | Reservations | Background Automation]

Requirements:
1. Track A: Load `stone-boot.js`, `stone-{tokens,base,components,shells,patterns}.css`, and `stone-ui.js` (zero inline scripts or `onclick=`). Track B: Import `stone-tokens.css` cleanly into `@theme inline`.
2. Build screens exclusively from Tier-2 semantic tokens and the 6-Box model plus domain recipes from `spec/06-domain-patterns.md`.
3. Keep `alpha = 1.0` opaque cards/inputs/menus/tooltips/modals; use ceramic `0.94` glass strictly on `.stone-topbar`, `.stone-floating-bar`, and `.stone-toast`.
4. Verify Light, `.dark`, `[dir="rtl"]`, `320px` touch reflow (`>= 44px` hit floor), `Ctrl+K` / `Ctrl+B` editable guards, and `prefers-reduced-motion` / `prefers-reduced-transparency`.
```

---

## Prompt 4: Post-Migration Compliance Audit Gate

```markdown
Perform a strict **Stone Base v1.1.2** compliance audit across code and UI. Run `python scripts/verify_stone.py` (if present) and `node --check` on all scripts, inspect Light, `.dark`, `[dir="rtl"]`, and `320px` viewports, and report findings (`Severity | Location | Before | After | Why`):

1. **Color, Contrast & Gamut:** Zero Tier-1 `--stone-*`/`--accent-*` or raw hex/oklch literals outside `stone-tokens.css`; `100%` sRGB gamut; Light `surface != raised`; Dark solid CTA hover `>= 5.2:1`; `--color-chart-1..6` and `--color-border-control` `>= 3.0:1`; placeholder `>= 4.5:1`; Dark skeleton visible.
2. **Ceramic Transparency Discipline:** Frosted blur ONLY on `.stone-topbar`, `.stone-floating-bar`, `.stone-toast` (`alpha >= 0.93`, `isolation: isolate`, solid `prefers-reduced-transparency` fallback); `dialog::backdrop` unblurred; cards/menus/tooltips opaque.
3. **Boxes, Forms & Targets:** Working concentric radii without CSS cycles; `>= 44px` coarse/mobile hit boxes without overlapping group `::after` zones; Danger Hold `>= 4.5:1`; full `:indeterminate`/`[readonly]`/`:disabled`/`.stone-choice-card` states.
4. **Suite Chrome, CSP & Copy:** Zero inline `onclick=` or `<style>` injection; `#main-content` skip link; editable-guarded hotkeys; RTL-centered `.stone-floating-bar` hidden behind open modals & scoped to visible rows; verb-first sentence-case copy and `<bdi>` on mixed-direction spans.

Conclude with `Approve` only when zero HIGH/Blocker issues remain.
```
