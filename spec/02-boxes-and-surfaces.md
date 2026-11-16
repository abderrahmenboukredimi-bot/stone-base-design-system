# 02 — Boxes, Surfaces, and Sizing (`v1.1.2`)

Every application in the suite constructs its visual structure from **6 standardized Box Primitives**, **4 Box Padding Sizes**, and **4 Container Max-Widths** quantized to a crisp `4px / 8px` spatial grid. No app may invent ad-hoc cards, custom shadows, or arbitrary border radii.

---

## The 6 Box Primitives

| Level | Primitive | Visual Job | Background Token | Border & Shadow (Light) | Border & Shadow (Dark) | Nesting Rule |
| --- | --- | --- | --- | --- | --- | --- |
| **0** | `Canvas` | Root viewport or `.stone-sidebar-inset` app ground | `--color-bg-canvas` | None | `1px solid var(--color-border-hairline)` when framed inside `SidebarInset` | Holds `Well`, `Surface`, `Raised` |
| **-1** | `Well` | Recessed regions: code blocks, input wells, empty dropzones, table summary footers | `--color-bg-well` | `1px solid var(--color-border-subtle)` + subtle top inner shadow | `1px solid var(--color-border-hairline)` | Lives on `Canvas` or 1 level inside `Surface`; never holds elevated shadows |
| **1** | `Surface` | Primary structured card, list container, chart card, table wrapper | `--color-bg-surface` | `border: 1px solid var(--color-border-hairline)` + `--shadow-bevel-surface`, `--shadow-1` | `border: 1px solid var(--color-border-hairline)` + `--shadow-bevel-surface`, `--shadow-1` | Max 1 child `Well` inside; never nest `Surface` inside `Surface` |
| **1.5** | `Raised` | Selectable option cards, active tiles, dragged items | `--color-bg-raised` | `border: 1px solid transparent` + `--shadow-bevel-surface`, `--shadow-2` | `border: 1px solid var(--color-border-hairline)` + `--shadow-bevel-surface`, `--shadow-2` | Interactive; lifts on hover/drag |
| **2** | `Overlay` | Dropdowns, menus, popovers, chart tooltips (unblurred opaque card) | `--color-bg-overlay` (`--stone-raised`) | `border: 1px solid var(--color-border-hairline)` + `--shadow-3` | `border: 1px solid var(--color-border-default)` + `--shadow-3` | `overscroll-behavior: contain`; keeps crisp `alpha = 1.0` legibility |
| **3** | `Modal` | Blocking dialogs (`<dialog>`), drawers, command palette | `--color-bg-overlay` over `--color-bg-scrim` (unblurred) | `border: 1px solid transparent` + `--shadow-5` | `border: 1px solid var(--color-border-default)` + `--shadow-5` | Background becomes inert via Top Layer `.showModal()`; `overscroll-behavior: contain` |

### Selective Ceramic Transparency (Floating & Stationary Chrome Only)

Only three bounded chrome surfaces use lightweight ceramic frosted glass (`0.94–0.95` alpha + `backdrop-filter: var(--glass-blur)` + `isolation: isolate` + specular top highlight):

- `.stone-topbar` &#8594; `background-color: var(--color-glass-topbar);`
- `.stone-floating-bar` &#8594; `background-color: var(--color-glass-dock);`
- `.stone-toast` &#8594; `background-color: var(--color-glass-toast);`

Inside `@media (prefers-reduced-transparency: reduce)` and `@media (prefers-contrast: more)`, all three resolve to solid opaque surfaces with `--glass-blur: none`. Cards, inputs, menus, chart tooltips, modal interiors, scrolling tables, and `dialog::backdrop` stay strictly unblurred and opaque.

### Box Sub-Primitive: `.stone-inset`

Use `.stone-inset` when media, code blocks, or edge-to-edge tables inside `.stone-surface` or `.stone-raised` should sit flush against the card's border rather than floating inside padding. Negate `--box-pad` via `margin-inline: calc(var(--box-pad) * -1)` and clip corners cleanly to match `--box-radius` minus `1px`.

---

## Box Padding, Sizes, and Quantized Spacing

All Stone apps share the same **4 Box Padding Classes** quantized strictly to `rem` tokens (use `.stone-table--compact` when denser row spacing is needed):

```css
:root {
  --box-pad-xs: var(--space-2);  /*  8px — chips, compact rows, toolbars */
  --box-pad-sm: var(--space-3);  /* 12px — compact cards, table cells, popovers */
  --box-pad-md: var(--space-4);  /* 16px — standard cards, panels, forms */
  --box-pad-lg: var(--space-5);  /* 24px — modal bodies, feature cards, empty states */
}
```

### Container Max-Widths (4 Standard Sizes)

| Token | Value | Use Case |
| --- | --- | --- |
| `--container-sm` | `28rem` (`448px`) | Auth boxes, confirmation dialogs, narrow mobile utilities |
| `--container-md` | `43rem` (`688px`) | Settings forms, reading panes, focused `shell-compact` converters |
| `--container-lg` | `55rem` (`880px`) | Multi-card views, `shell-compact` reservation & calendar flows |
| `--container-xl` | `71rem` (`1136px`) | Full dashboards, charts, and data tables inside `shell-workspace` |

**Sizing Rule:** Never give a card or form a percentage width across grid columns. Assign `max-inline-size` from `--container-*` and `inline-size: 100%` so the box holds its ideal size until the viewport narrows past it. Never set fixed `height` on text-holding boxes; use `min-block-size`, or `max-block-size` paired with `overflow-y: auto`.

---

## Corner Radii and Concentric Math

Stone Base `v1.1.2` organizes shapes into **4 Functional Tracks** over `--radius: 0.5rem` (`8px`) plus progressive `corner-shape: squircle` behind `@supports (corner-shape: squircle)` on box primitives and standard buttons (excluding `[data-shape="pill"]`, `[data-shape="square"]`, and segmented/group items):

| Track | Elements | Radius Token | Geometry |
| --- | --- | --- | --- |
| **1. Architectural Sheets** | `Surface`, `Raised`, `Overlay`, `Modal`, `SidebarInset`, Bento cards | `--radius-lg` (`12px`) / `--radius-xl` (`16px`) | `corner-shape: squircle` behind `@supports` |
| **2. Interactive Controls** | Toolbar buttons, inputs, selects, calendar cells, time slots | `--radius-sm` (`6px`) / `--radius-md` (`8px`) | `6px–8px` rounded or squircle |
| **3. Micro Controls** | Checkboxes, `<kbd>` caps, inline code spans | `--radius-xs` (`4px`) | Standard `4px` `border-radius` |
| **4. Capsules & Pills** | Hero CTAs (`data-shape="pill"`), `.stone-chip`, `.stone-trend-pill`, `.stone-floating-bar`, switches | `--radius-full` (`9999px`) | Full stadium capsule (always circular) |

```css
:root {
  --radius:      0.5rem;                        /*  8px base */
  --radius-xs:   calc(var(--radius) * 0.5);     /*  4px — checkboxes, tight badges, kbd caps */
  --radius-sm:   calc(var(--radius) * 0.75);    /*  6px — inputs, buttons, slots, menu items */
  --radius-md:   var(--radius);                 /*  8px — small/medium cards, wells */
  --radius-lg:   calc(var(--radius) * 1.5);     /* 12px — standard Surface cards, popovers */
  --radius-xl:   calc(var(--radius) * 2);       /* 16px — modals, drawers, SidebarInset shell */
  --radius-full: 9999px;                        /* pills, avatars, switches, floating docks */
}
```

### Concentric Radius Rule

`.stone-surface`, `.stone-raised`, `.stone-overlay`, and `.stone-modal` expose their resolved outer corner radius (`--outer-radius`) and box padding (`--outer-pad`) to direct children so inner wells compute without self-referential CSS cycles:

$$r_{\text{inner}} = \max(4\text{px},\; r_{\text{outer}} - \text{padding} - 1\text{px})$$

- Example: A `Modal` with `--radius-xl` (`16px`) and `12px` (`.pad-sm`) computes `max(4px, 16px - 12px - 1px) = 4px`.
- Past `24px` (`.pad-lg` or `--box-pad > 24px`) of padding, treat layers as visually independent and apply each component's standard radius token.

---

## Elevation Shadows vs. Borders

Light mode pairs whisper-quiet hairline rings with two-part cast + contact shadows plus specular top highlights (`--shadow-bevel-surface`). Dark mode relies on stepped Obsidian lightness (`Canvas 0.162` &#8594; `Surface 0.198` &#8594; `Raised 0.236`) plus hairline edges.

### Surface Edge Rules

1. **Forced-Colors Protection:** Boxes relying on `box-shadow` for their perimeter keep `border: 1px solid transparent;` (or `--color-border-hairline`) so Windows High Contrast / `forced-colors: active` renders a crisp border.
2. **Content Image Outlines:** Give raster photos and thumbnails `outline: 1px solid var(--color-image-outline); outline-offset: -1px;` so edges stay crisp on Light Chalk and Dark Obsidian.
3. **Edge Discipline (`SC 1.4.11 >= 3.0:1`):** Decorative containers use `--color-border-hairline`. Secondary/surface controls, inputs, checkboxes, switches, and progress tracks enforce `--color-border-control` (`3.22:1` Light / `3.32:1` Dark) or `--color-border-default` (`>= 3.8:1`).
