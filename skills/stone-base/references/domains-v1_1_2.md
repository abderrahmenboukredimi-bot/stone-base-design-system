# Reference: `v1.1.2` Domain Recipes (`css/stone-patterns.css`)

## 1. Graphs & Analytics (`examples/workspace-app.html`)

- Header strip: `.stone-surface` &#8594; `.stone-chart-card__header` + `.stone-chart-tabs` + `[role="tab"].stone-chart-tab`.
- SVG / Canvas frame: `.stone-chart-frame` with `.stone-chart-gridline` (`stroke-dasharray: 4 4`), `.stone-chart-axis-text` (`tabular-nums`), and `--color-chart-1..6`.
- Legend & Tooltip: `.stone-chart-legend` swatches + opaque `.stone-chart-tooltip` (`--color-bg-overlay`, `font-mono tabular-nums`), anchored and focus-accessible on graph items.

## 2. Worker Shift Management (`examples/workspace-app.html`)

- Container-query KPI tiles: `.stone-bento-grid` (`4 → 2 → 1` columns automatically).
- Sticky table + ringed pills: `.stone-inset.stone-inset--bottom.stone-table-wrap` + `table.stone-table.stone-table--interactive` + `.stone-badge[data-shape="pill"]` + `.stone-badge__dot`.
- Visible-row multi-select: Checkboxes `[data-select-all]` + `[data-row-select]` inside `tbody tr:not([hidden])` sync `.stone-floating-bar` (`[hidden]` automatically when any modal `<dialog open>` is active). Emit `stone:selection-sync` after filtering rows.

## 3. Studio Reservations (`examples/reservations.html`)

- Mount inside `.stone-shell--compact` + `.stone-container[data-width="lg"]` (`880px`).
- 7-column calendar: `.stone-calendar` &#8594; `.stone-calendar__grid` with `.stone-calendar__cell` (`min-block-size: 2.75rem` on touch/mobile, `[data-today="true"]`, `[data-range="start|middle|end"]`). Flip month chevrons with `.icon-directional`.
- 5 unambiguous slot states inside bounded `.stone-slot-list`: `.stone-slot[data-state="available|confirmed|pending|conflict|unavailable"]`.

## 4. Background Automation Runs (`examples/automation-runs.html`)

- Live status banner: `.stone-sync-banner` with Pause/Resume toggle.
- Queue table: All 6 lifecycle states (`Queued`, `Running`, `Retrying · Attempt N/M`, `Completed`, `Failed`, `Canceled`) + `[data-row-expand]` toggling `tr.stone-table__detail`.
- Split-pane inspector (`.stone-inspector`): 2-segment `.stone-waterfall` (`.stone-waterfall__queue` + `.stone-waterfall__exec[data-tone]`) + stacked `.stone-prop-row--block` JSON `<pre class="stone-well">`.
