# 03 — Typography and Layout (`v1.1.2`)

Stone Base separates **type scale**, **reading measure**, **quantized spatial rhythm**, and **structural grouping** so dense engineering tools and focused utilities stay legible from `320px` mobile screens up to wide multi-pane displays without layout breakage.

---

## Type Stack and Root Settings

Default to the platform's system sans-serif stack (native optical sizing, kerning tables, zero network font flash) paired with a crisp monospace stack for code, identifiers, chart values, and numeric columns. Apply font smoothing **once** on `:root`, never inside individual components.

```css
:root {
  --font-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas,
               "Liberation Mono", monospace;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: var(--font-sans);
  font-optical-sizing: auto;
}
```

---

## Role-Based Type Scale (`rem` Only)

Never use `em` for font sizes (`em` compounds through nested containers and silently breaks the scale). Every role pairs an exact `rem` size, unitless `line-height`, `font-weight`, and size-coupled `letter-spacing`.

| Role | CSS Token | Size (`rem` / `px` at 16px) | Unitless Leading | Weight | Tracking (`em`) | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| `display` | `--text-display` | `clamp(1.625rem, 1.25rem + 1.5vw, 2.25rem)` (`26–36px`) | `1.10` | `600` | `-0.02em` | Hero / top-level suite workspace title (`<h1>`) |
| `title` | `--text-title` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` (`20–24px`) | `1.20` | `600` | `-0.015em` | Page or modal header (`<h2>`) |
| `heading` | `--text-heading` | `1.125rem` (`18px`) | `1.30` | `600` | `-0.01em` | Card / section heading (`<h3>`) |
| `body` | `--text-body` | `1rem` (`16px`) | `1.50` | `400` | `0em` | Long-form prose, primary inputs on mobile |
| `body-sm` | `--text-body-sm` | `0.875rem` (`14px`) | `1.45` | `400` | `0em` | Standard UI labels, menus, desktop inputs, table cells |
| `caption` | `--text-caption` | `0.8125rem` (`13px`) | `1.40` | `400` | `0.005em` | Secondary metadata, timestamps, helper text, chart labels |
| `overline` | `--text-overline` | `0.75rem` (`12px`) | `1.40` | `500` | `0.05em` | Uppercase section eyebrows, badge categories |

### Typography Invariants

1. **Weight Floor:** Never apply weights `100–300` to text smaller than `18px`. UI text uses `400` (regular), `500` (subtle emphasis), and `600` (headings/actions).
2. **Wrapping Text Leading:** Tight leading (`1.1–1.25`) applies only to single-line or two-line headings. Descriptions and card summaries that wrap to 3+ lines must use `line-height >= 1.4`.
3. **Tabular Figures:** Apply `font-variant-numeric: tabular-nums` to timers, KPI counts, prices, chart tooltips, waterfall durations, and `.is-numeric` table columns (`text-align: end`). Keep running prose proportional.
4. **16px Mobile Input Floor:** iOS Safari auto-zooms when `<input>`, `<select>`, or `<textarea>` renders below `16px`. Keep inputs at `1rem` (`16px`) on narrow/touch viewports (stepping down to `0.875rem` only at `(min-width: 48rem) and (pointer: fine)`).
5. **Measure Cap:** Limit long-form paragraphs to `45–75` characters per line (`.prose { max-inline-size: 65ch; }` — `ch`/`em` is valid strictly for prose measure).
6. **Deliberate Wrapping & Truncation:**
   - Headings and short descriptions: `text-wrap: balance;`
   - Body paragraphs: `text-wrap: pretty; text-align: start;` (never `justify` in app UI)
   - Long tokens/URLs/IDs: `overflow-wrap: break-word;`
   - Badges/chips: `white-space: nowrap;`
   - Progressive vertical trim in LTR buttons/badges: `text-box: trim-both cap alphabetic;` gated via `:not(:dir(rtl))` so Arabic/RTL diacritics never clip.
   - Never truncate content without a reachable recovery path (expand toggle, detail inspector, or keyboard tooltip).
7. **Typographic Punctuation & Bidi:** Store copy in natural case (apply uppercase via CSS), render proper Unicode ellipses (`…`), em/en dashes (`—`, `–`), and curly quotes (`“ ”`) in prose, set `lang` and `dir` on `<html>`, and wrap mixed-direction IDs, run keys, times, and code values in `<bdi>`.

---

## Quantized Spacing Scale (`4px / 8px` Grid)

Spacing follows a constrained non-linear `rem` scale without runtime fractional scaling multipliers (`v1.1.2`):

```css
:root {
  --space-1:  0.25rem;  /*   4px */
  --space-2:  0.5rem;   /*   8px */
  --space-3:  0.75rem;  /*  12px */
  --space-4:  1rem;     /*  16px */
  --space-5:  1.5rem;   /*  24px */
  --space-6:  2rem;     /*  32px */
  --space-7:  3rem;     /*  48px */
  --space-8:  4rem;     /*  64px */
  --space-9:  6rem;     /*  96px */
  --space-10: 8rem;     /* 128px */
}
```

### Grouping Hierarchy (Order of Operations)

1. **Negative Space First:** Keep the gap *between* separate groups at least `2x` the gap *within* a group (`8px` within a field, `16px–24px` between adjacent groups).
2. **Background Shape Second:** Wrap related elements in a `.stone-surface` or `.stone-well` box when they must act as one unit.
3. **Hairline Separator Last:** Use `1px solid var(--color-border-separator)` only inside tables, accordion items, or chart metric headers where negative space alone cannot carry the boundary.

### Alignment and Control Clearance

- **Shared Leading Edges:** Align section headers, cards, and list items to shared vertical leading edges; indent nested details consistently by `16px` (`--space-4`).
- **Baseline Alignment:** Align mixed text sizes on the same row using `.stone-row-baseline` (`align-items: baseline;`).
- **Control Clearance:** Maintain `>= 12px` (`--space-3`) or distinct fused dividers (`.stone-btn-group`) between adjacent interactive targets so touch areas never overlap.

---

## Logical RTL, Overflow, and Responsive Reflow

- **Logical Properties Everywhere:** Use `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-end`, `border-start-start-radius`, and `text-align: start`. Pair any unavoidable physical `env(safe-area-inset-*)` offset with `[dir="rtl"]` mirror rules.
- **Visual Order Matches DOM Order:** Never reorder logical focus/reading flow using CSS `order` or `flex-direction: row-reverse`.
- **Prevent Track Blowouts:** Always use `minmax(0, 1fr)` on CSS Grid tracks and `min-inline-size: 0` on flex children holding text, code, charts, or tables.
- **Viewport Units:** Use `inline-size: 100%` (never `100vw`) and `100dvh` (never `100vh`) on full-height panes.
- **Container Queries First:** Components like `.stone-bento-grid` declare `container-type: inline-size` so multi-column metrics adapt cleanly inside narrow split views and drawers.
- **320px & 200% Zoom Guarantee:** Every screen and dialog must reflow cleanly at `320px` width and `200%` zoom without horizontal overflow.
