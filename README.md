# Stone Base (`v1.1.2`)

A Level-0, framework-agnostic design system and vanilla HTML/CSS/JS starter kit for building cohesive utilities, analytics dashboards, worker shift managers, reservation flows, and background job monitors under one visual language (**Warm Chalk Light**, **Neutral Obsidian Dark**, **Electric Cobalt Accent**, selective **0.94 ceramic glass chrome**, and **100% sRGB chart tokens**).

---

## Live Showcase & Domain Suite Mockups

Open [index.html](index.html) directly via `file://` or any local HTTP server (no build tools required), or jump to any of the four suite applications via the Suite Switcher (`Ctrl+K`):

| Application | Archetype Shell | Domain Patterns Demonstrated |
| --- | --- | --- |
| [index.html](index.html) | `shell-workspace` (`880px`) | Complete token swatches (`--color-chart-1..6`), contrast matrix, 4 shape tracks, 7 core buttons, forms, overlays & domain previews |
| [examples/compact-utility.html](examples/compact-utility.html) | `shell-compact` (`688px`) | *Stone Converter* — URL-synced underline tabs (`?tab=`), ceramic topbar, `rem/px` converter, quantized spacing |
| [examples/workspace-app.html](examples/workspace-app.html) | `shell-workspace` (`1136px`) | *Worker Operations & Analytics* — `@container` Bento KPIs, interactive multi-series SVG charts (`--color-chart-1..4`), ringed worker presence pills, `:indeterminate` select-all, ceramic floating dock & 3-pane inspector |
| [examples/reservations.html](examples/reservations.html) | `shell-compact` (`880px`) | *Studio Reservations* — 7-column calendar (`>= 44px` touch cells), logical range rounding, 5 non-color slot states (`Available`, `Confirmed`, `Pending`, `Conflict`, `Unavailable`) & summary dialog |
| [examples/automation-runs.html](examples/automation-runs.html) | `shell-workspace` (`1136px`) | *Automation Runs* — Live sync banner, 6 lifecycle states, expandable `.stone-table__detail` inline logs, 2-segment waterfall traces & stacked JSON wells |

---

## Quick Start (Copy-Paste Zero-Build HTML Starter)

```html
<!DOCTYPE html>
<html lang="en" dir="ltr" data-corner="squircle">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="stone-storage-prefix" content="myapp">
  <title>My Stone App</title>
  <script src="./js/stone-boot.js"></script>
  <link rel="stylesheet" href="./css/stone-tokens.css">
  <link rel="stylesheet" href="./css/stone-base.css">
  <link rel="stylesheet" href="./css/stone-components.css">
  <link rel="stylesheet" href="./css/stone-shells.css">
  <link rel="stylesheet" href="./css/stone-patterns.css">
  <script src="./js/stone-ui.js" defer></script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div class="stone-shell--compact">
    <header class="stone-topbar">
      <div class="stone-topbar__start">
        <span class="stone-topbar__title">My Stone App</span>
      </div>
      <div class="stone-topbar__end">
        <button type="button" class="stone-btn" data-variant="ghost" data-size="sm" data-theme-toggle>Theme</button>
      </div>
    </header>
    <main id="main-content" class="stone-main" tabindex="-1">
      <div class="stone-container stone-stack" data-width="md">
        <section class="stone-surface pad-lg stone-stack">
          <h1 class="text-title">Ready on Stone Base v1.1.2</h1>
          <p class="text-body-sm text-secondary">Build cards, charts, slots, and tables with Tier-2 tokens.</p>
          <button type="button" class="stone-btn" data-variant="primary">Save Changes</button>
        </section>
      </div>
    </main>
  </div>
</body>
</html>
```

> **Upgrading from `v1.1` / `v1.1.1a`?** Include optional [css/stone-compat-v1_1.css](css/stone-compat-v1_1.css) right after `stone-components.css` to keep legacy button variants (`accent-subtle`, `success`, `warning`) and `--color-*-bg` aliases working without modifying markup.

---

## Using Stone Base with Antigravity / AI Coding Agents

1. **Automatic Workspace Skill:** Antigravity automatically discovers [the `stone-base` workspace skill](.agents/skills/stone-base/SKILL.md) (`STONE` design system guidance + Tailwind v4 `@theme` bridge + domain recipes).
2. **External Repositories:** Drop [STONE-SYSTEM-PORTABLE.md](STONE-SYSTEM-PORTABLE.md) into your repo's `.agents/rules/stone-base.md` or `AGENTS.md`, or paste prompts sequentially from [prompts/SWITCH-TO-STONE.md](prompts/SWITCH-TO-STONE.md) (**Track A Pure CSS** or **Track B Tailwind v4**).
3. **Run the Automated Compliance Gate:**
   ```powershell
   python scripts/verify_stone.py --static
   node --check js/stone-boot.js js/stone-ui.js js/stone-suite-chrome.js js/reference-docs.js
   ```
