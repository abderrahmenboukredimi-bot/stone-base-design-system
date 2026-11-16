# 04 — Interactions and Motion (`v1.1.2`)

Stone Base motion is restrained, interruptible, and physically grounded. Motion exists strictly to provide press feedback, clarify spatial origin, preserve continuity, or soften rare entrances.

---

## Step 1: Interaction Frequency Gate (Mandatory)

Before adding any transition or animation, classify the interaction by daily frequency:

| Daily Frequency | Examples | Motion Decision |
| --- | --- | --- |
| **100+ times / day** | Keyboard shortcuts, `Cmd+K` suite switcher open/close, command search filtering, rapid keyboard list stepping, adjacent tooltip switch | **0ms. No animation.** Instant state swap. |
| **Tens of times / day** | Row hovers, tab switching, sidebar collapse toggle, button hover tint, slot selection | **Near-imperceptible only:** `<= 150ms` on `opacity` or `background-color` (or instant). No bounce, no entrance keyframes. |
| **Occasional** | Menus, dropdowns, popovers, dialogs, drawers, toasts, hold-to-confirm | **Standard UI transition:** `150–180ms` `--ease-out` (up to `260ms` `--ease-drawer` for sheets). |
| **Rare / First-Time** | Initial empty states, onboarding reveals | **Staggered reveal allowed:** short composite-only transitions (`<= 300ms`), never blocking interaction. |

Every animated state change must leave behind a **static cue** (color, border, icon, or label) so status never depends on motion alone.

---

## Step 2: Easing Curves, Durations, and Springs

Never use `ease-in` on UI transitions (it delays the initial frame when the user is watching most closely).

```css
:root {
  --ease-out:     cubic-bezier(0.23, 1, 0.32, 1);    /* entering, exiting, press feedback */
  --ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1); /* on-screen repositioning / morphing */
  --ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);    /* mobile sheets & drawers */

  --dur-press:    150ms;
  --dur-tooltip:  125ms;
  --dur-popover:  160ms;
  --dur-modal:    180ms;
  --dur-drawer:   260ms;
}
```

### Spring Parameters (Gesture & Physics Interactions)

If using spring physics for draggable sheets or momentum gestures:
- **Default UI Spring (Critically Damped):** `damping: 1.0`, `response: 0.3–0.4`.
- **Drag Safety Rules:** Call `setPointerCapture(e.pointerId)` on drag start, set `touch-action: none` strictly on the draggable handle/surface, and mutate `element.style.transform` directly (never by updating an inherited CSS custom property on a parent container).

---

## Step 3: Component Interaction Contracts

### 1. Core Buttons and Pressable Controls (7 Canonical Variants)

`v1.1.2` standardizes **7 core semantic button variants** on `.stone-btn`:

- `primary` — Cobalt CTA (one primary action per view; Light hover deepens `7.37:1`, Dark hover illuminates to `5.43:1` with hover rim).
- `ink` — High-contrast monochrome primary CTA (`>= 15:1`).
- `secondary` — Filled stone secondary control.
- `surface` — Crisp `--color-bg-surface` button framed with `--color-border-control` (`>= 3.22:1` Light / `>= 3.32:1` Dark).
- `ghost` — Low-noise toolbar / header trigger.
- `danger` — Solid crimson destructive action (`>= 5.30:1` Light / `>= 5.45:1` Dark hover).
- `danger-subtle` — Tinted low-noise destructive action (`>= 6.81:1`).

Optional legacy button variants (`accent-subtle`, `success`, `success-subtle`, `warning`, `warning-subtle`) are preserved separately in optional `css/stone-compat-v1_1.css` for zero-breakage migrations.

- **Toggle Accent Opt-In:** Standard buttons with `aria-pressed="true"` render neutral active depression; bright Cobalt active tint applies only when explicitly flagged via `[data-toggle-emphasis="accent"][aria-pressed="true"]`.
- **Touch Target Enforcement:** Desktop controls (`default`, `sm`, `xs`) expand cleanly to `min-block-size: 2.75rem` (`44px`) under `@media (pointer: coarse), (max-width: 30rem)` with equal selector specificity above `[data-size="xs"|"sm"]`. Invisible `::after` hit expanders apply strictly to standalone icon/small buttons, excluded from `.stone-btn-group`, `.stone-split-btn`, `.stone-mask-end`, and table cells (`td .stone-btn`).
- **Deliberate Hold-to-Confirm (`.stone-hold-btn`):** Linear progress sweeps smoothly over `clip-path`, canceling immediately on release, `pointerleave`, `Escape`, or `blur`. On `[data-variant="danger"]`, the fill uses darkened `--color-danger-solid-active` (`>= 7.4:1` over white), never translucent white glare. Emits `stone:hold-confirm` when complete.

```css
.stone-btn {
  -webkit-tap-highlight-color: transparent;
  transition:
    transform var(--dur-press) var(--ease-out),
    background-color var(--dur-press) var(--ease-out),
    border-color var(--dur-press) var(--ease-out),
    box-shadow var(--dur-press) var(--ease-out);
}

.stone-btn:not(:disabled, [aria-disabled="true"], [data-static="true"]):active {
  transform: scale(0.97);
}
```

### 2. Trigger-Anchored Overlays & Tooltips (`.stone-popover`, `.stone-tooltip`)

- **Origin-Aware Entering:** Popovers use `@starting-style` and `transition-behavior: allow-discrete` starting from `scale(0.95)` + `opacity: 0` (never `scale(0)`), and sync `aria-expanded` on `[popovertarget]`.
- **WCAG 1.4.13 Hoverable & Escape-Dismissible Tooltips:** `.stone-tooltip` stays open while hovered, dismisses cleanly on `Escape`, clamps inside the viewport across LTR and RTL, shifts `[data-instant="true"]` when stepping across adjacent controls, and auto-activates on collapsed `48px` rail items.

### 3. Modals, Drawers, and Top-Layer Toasts

- **Modals (`dialog.stone-dialog`):** Centered scale entrance (`scale(0.96)` &#8594; `1`, `180ms var(--ease-out)`) over unblurred `--color-bg-scrim`; `.stone-dialog--instant` (`Cmd+K`) opens and closes in `0ms`. Clicking outside dialog bounds with primary button (`e.button === 0`) or pressing `Escape` resolves the `StoneUI.closeTopLayer()` Promise cleanly.
- **Top-Layer Toasts (`.stone-toast-region[popover="manual"]`):** Rendered directly in Top Layer above modal dialogs with semantic ceramic tint (`0.94` alpha + `blur(12px)`) and matching `[data-tone]` border. Action/Undo toasts persist (`persistent: true`) until acted on or dismissed.

---

## Step 4: Performance, Reduced Motion, and Hover Gating

1. **GPU-Only Properties:** Animate `transform`, `opacity`, and `clip-path` only. Never declare `transition: all` or animate `width`, `height`, `margin`, `padding`, `top`, or `left`.
2. **Hover Gating:** Wrap hover color/shadow shifts inside `@media (hover: hover) and (pointer: fine)` so touch devices never latch sticky hover states.
3. **Theme Switch Guard:** `StoneUI.setTheme()` toggles `html[data-theme-switching="true"]` for two `requestAnimationFrame` ticks instead of injecting `<style>` tags (strict CSP compliance).
4. **Reduced-Motion Mandate:** `@media (prefers-reduced-motion: reduce)` collapses position/scale motion and forces instant opacity transitions (including dialog/drawer `::backdrop` fade).

---

## Step 5: Icon Craft and Optical Alignment

- **Paired Stroke Weights:** `.icon-w-regular` (`1.5px`) beside `400` text, `.icon-w-medium` (`2px`) beside `500–600` buttons/nav, `.icon-w-bold` (`2.5px`) on emphasized glyphs (`vector-effect: non-scaling-stroke`).
- **Single-Asset Sprite:** Canonical hidden `<svg id="stone-icon-sprite">` defines stroke-based symbols using `currentColor` (zero hardcoded hex fills).
- **Optical Nudges:** Leading/trailing icon buttons deduct `2px` from the icon edge padding; `.icon-play` nudges `+2px` without RTL mirroring; `.icon-directional` mirrors arrows/chevrons automatically via `[dir="rtl"] .icon-directional { scale: -1 1; }`.
