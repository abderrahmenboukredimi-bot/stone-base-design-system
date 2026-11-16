# 06 — Graphs & Operational Domain Patterns (`v1.1.2`)

To support analytics dashboards, worker shift consoles, calendar/slot reservations, and background job queues without bloating the core utility stylesheets, **Stone Base `v1.1.2`** pairs 6 library-agnostic OKLCH graph tokens with additive layout recipes in `css/stone-patterns.css` (`@layer patterns;`).

---

## 1. Graphs & Data Visualizations

### Color Palette (`--color-chart-1..6`)

Do not reuse semantic `danger`, `warning`, or `success` hues for generic multi-series metrics. Consume `--color-chart-1..6`, calibrated across interstitial hues, `100%` sRGB-valid, and `>= 3.0:1` non-text contrast against Light Well/Surface/Raised and Dark Canvas/Surface/Raised:

| Series Token | Hue Family | Light Mode Hex (`on Surface`) | Dark Mode Hex (`on Surface`) | Usage Priority |
| --- | --- | --- | --- | --- |
| `--color-chart-1` | Cerulean (`228°`) | `#11739d` (`5.07:1`) | `#38a6ca` (`6.50:1`) | Primary series / Area fill |
| `--color-chart-2` | Teal (`192°`) | `#1e8a85` (`4.01:1`) | `#42cac3` (`9.05:1`) | Secondary comparison series |
| `--color-chart-3` | Plum (`296°`) | `#6d46b3` (`6.34:1`) | `#9d7de7` (`5.64:1`) | Target / SLA reference line |
| `--color-chart-4` | Berry (`342°`) | `#b44591` (`4.80:1`) | `#ed86c4` (`7.64:1`) | Trend / capacity ceiling |
| `--color-chart-5` | Ochre (`48°`) | `#aa5016` (`5.24:1`) | `#ea8d52` (`7.30:1`) | Secondary category 5 |
| `--color-chart-6` | Moss (`125°`) | `#657f2f` (`4.33:1`) | `#a7c76a` (`9.53:1`) | Secondary category 6 |

### Chart Structural Tokens & Markup Recipe

- **Header Metric Tabs (`.stone-chart-card__header` + `.stone-chart-tabs`):** Render metric selector tabs separated cleanly by `--color-border-separator` dividers directly inside `.stone-surface` (never nested `Surface` cards inside a chart card). Active tabs use an inset accent underline (`var(--color-accent-solid)`).
- **Gridlines & Axes:** Dashed `1px` horizontal rules use `--color-chart-grid` (`stroke-dasharray: 4 4`); vertical gridlines are omitted to minimize noise. Axis labels use `--color-chart-axis` + `tabular-nums`.
- **Series Separation:** Stacked or adjacent bars separate cleanly via `1px` gaps or `var(--color-bg-surface)` strokes so overlapping series stay clear.
- **Accessible Opaque Tooltips (`.stone-chart-tooltip`):** Charts trigger focus/hover tooltips styled with opaque `--color-bg-overlay` (`100%` legible), series swatches (`.stone-chart-legend__swatch`), and `font-mono tabular-nums` figures—never blurred glass over dense lines.

---

## 2. Worker Management & Shift Ops (`examples/workspace-app.html`)

- **Bento KPI Cards (`.stone-bento-grid`):** Uses `container-type: inline-size` to step cleanly `4 → 2 → 1` columns inside any workspace frame, aligned to baseline.
- **Ringed Presence Pills:** `.stone-badge[data-shape="pill"]` paired with `.stone-badge__dot` (`6px` circle colored from `currentColor`) renders unambiguous status (`On Shift`, `Busy`, `Break`, `Off Duty`) inside sticky-header interactive tables (`thead th` stays sticky on scroll).
- **Row Selection & Floating Dock:** Filtering visible workers updates `tbody tr[hidden]` and dispatches `stone:selection-sync`. `StoneUI` recalculates `:indeterminate` select-all checkboxes exclusively over `tr:not([hidden])`, updates counts with `Intl.PluralRules`, and reveals centered ceramic `.stone-floating-bar` while keeping it `[hidden]` under modal `<dialog open>`.
- **Dual Inspector Parity:** Desktop (`>= 64rem`) renders sticky 3-pane `.stone-inspector`; `< 64rem` opens a synced `<dialog>` inspector sheet.

---

## 3. Reservations & Calendar Slot Pickers (`examples/reservations.html`)

- **Shell & Width:** Mounts in `.stone-shell--compact` paired with `--container-lg` (`880px`) so the 7-column calendar and daily slot pane sit cleanly side by side without sidebar clutter.
- **Calendar Grid (`.stone-calendar`):** `.stone-calendar__cell` enforces `44px` height on touch/mobile, highlights `[data-today="true"]`, renders `[data-range="start|middle|end"]` logical start/end rounding, and mirrors month arrows cleanly via `.icon-directional`.
- **5 Non-Color-Only Slot States (`.stone-slot` inside bounded `.stone-slot-list`):**

| Slot State | Selector | Visual & Non-Color Cue |
| --- | --- | --- |
| **Available** | `[data-state="available"]` | `1px solid var(--color-border-control)` frame + `Available` Cobalt pill |
| **Confirmed** | `[data-state="confirmed"]` | Emerald tint + `3px` logical start-edge border + check glyph |
| **Pending / Hold** | `[data-state="pending"]` | Amber tint + `1px dashed` border + clock glyph (`Held 4m`) |
| **Conflict / Alert** | `[data-state="conflict"]` | Crimson tint + `1.5px solid` border + alert glyph + `Resolve` action |
| **Unavailable** | `[data-state="unavailable"]` | Disabled surface (`--color-bg-disabled`) + `-45deg` diagonal hatch + `cursor: not-allowed` |

---

## 4. Background Automation & Job Queues (`examples/automation-runs.html`)

- **Live Sync Banner (`.stone-sync-banner`):** Non-blocking status strip above the queue table reporting active worker-pool cadence and offering a Pause/Resume toggle without interrupting row inspection.
- **6 Standardized Queue Lifecycle Tones:**
  1. `Queued` — Neutral badge + dot (`var(--color-neutral-border)`)
  2. `Running` — Cobalt `accent` badge + dot
  3. `Retrying · Attempt N/M` — Amber `warning` badge + dot
  4. `Completed` — Emerald `success` badge + dot
  5. `Failed · N/M attempts` — Crimson `danger` badge + dot
  6. `Canceled` — Neutral badge (no dot)
- **Inline Log Expansion:** Rows include `[data-row-expand]` disclosure toggles revealing `.stone-table__detail` (`colspan` well with `white-space: pre-wrap` terminal step logs).
- **Stage Waterfall & JSON Payloads:** Split-pane `.stone-inspector` combines 2-segment `.stone-waterfall` bars (neutral `.stone-waterfall__queue` wait + semantic `.stone-waterfall__exec[data-tone]` run duration) with stacked `.stone-prop-row--block` JSON payloads rendered inside a single `.stone-well` box.
