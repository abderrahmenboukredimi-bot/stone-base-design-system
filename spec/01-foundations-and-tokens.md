# 01 — Foundations and Color Tokens (`v1.1.2`)

Stone Base uses a **two-tier token architecture** (`v1.1.2`) written in perceptual `oklch()` (all palette and chart values verified 100% inside the sRGB gamut). Components reference **Semantic Roles (Tier 2)** exclusively. **Primitives (Tier 1)** define the underlying Warm Chalk / Neutral Obsidian stone, Electric Cobalt accent, and status steps and live strictly inside [css/stone-tokens.css](../css/stone-tokens.css).

---

## Color Strategy

1. **Warm Chalk Light & Neutral Obsidian Dark (`hue 72°`, chroma `0.0005–0.006`):** Carries 85–90% of every screen. Light mode restores distinct visual lift from `Canvas` (`0.964` `#f4f3f1`) &#8594; `Surface` (`0.986` `#fbfaf9`) &#8594; `Raised` (`0.998` `#fffefe`) while `Well` steps down (`0.934` `#ebe9e6`). Dark mode elevates across calibrated Obsidian planes `Well` (`0.128` `#070706`) &#8594; `Canvas` (`0.162` `#0e0e0d`) &#8594; `Surface` (`0.198` `#161514`) &#8594; `Raised` (`0.236` `#1f1e1d`).
2. **Electric Cobalt Accent (`hue 252°–260°`) with `>= 5.2:1` Dark Hover Headroom:** Restored smooth monotone steps across `accent-6..11` in both themes, with Dark solid CTA hover calibrated to `5.43:1` (`accent-10` `#1163df`) over `#ffffff` plus a dedicated darker active step (`--color-accent-solid-active` `#0a4eb4`, `7.62:1`).
3. **Three Isolated Status Ramps (`danger` `26°` Crimson, `warning` `74°–78°` Honey Amber, `success` `158°` Emerald):** Full 9-role semantics keeping `#ffffff` label polarity unified on `primary`, `danger`, and `success` solid CTAs across Light and `.dark` (`danger` hover `5.45:1` Dark; `success` hover `5.25:1` Dark).
4. **Selective Ceramic Transparency (`0.94–0.95` Alpha) & Accessible Boundaries:** `.stone-topbar`, `.stone-floating-bar`, and `.stone-toast` apply calibrated frosted ceramic glass with `@media (prefers-reduced-transparency: reduce)` and `@media (prefers-contrast: more)` solid overrides. Interactive inputs, checkboxes, switches, slots, and surface buttons enforce `--color-border-control` (`3.22:1` Light / `3.32:1` Dark) or `--color-border-default` (`>= 4.5:1`).
5. **6-Series Analytics Palette (`--color-chart-1..6`):** Interstitial hues (`Cerulean`, `Teal`, `Plum`, `Berry`, `Ochre`, `Moss`) verified `100%` in sRGB and `>= 3.0:1` across Light and Dark surfaces without colliding with semantic alert colors.

---

## Tier 1: Primitive Color Scales (Verified sRGB In-Gamut)

### Neutral Stone Ramp — Warm Chalk Light & Obsidian Dark (`hue 72°`)

| Step | Role Mapping | Light OKLCH | Light Hex | Dark OKLCH | Dark Hex |
| --- | --- | --- | --- | --- | --- |
| `well` | Recessed well / input inset | `oklch(0.934 0.004 72)` | `#ebe9e6` | `oklch(0.128 0.002 72)` | `#070706` |
| `1` | Level-0 Page Canvas | `oklch(0.964 0.003 72)` | `#f4f3f1` | `oklch(0.162 0.002 72)` | `#0e0e0d` |
| `surface` | Level-1 Card / Sheet surface | `oklch(0.986 0.002 72)` | `#fbfaf9` | `oklch(0.198 0.003 72)` | `#161514` |
| `raised` | Level-1.5 / 2 Elevated / Overlay | `oklch(0.998 0.0005 72)` | `#fffefe` | `oklch(0.236 0.003 72)` | `#1f1e1d` |
| `skeleton` | Loading placeholder shimmer bar | `oklch(0.892 0.004 72)` | `#dddbd8` | `oklch(0.345 0.004 72)` | `#3a3937` |
| `3` | Control background (rest) | `oklch(0.918 0.003 72)` | `#e5e3e2` | `oklch(0.270 0.003 72)` | `#272625` |
| `4` | Control background (hover) | `oklch(0.888 0.004 72)` | `#dcdad7` | `oklch(0.310 0.004 72)` | `#32302e` |
| `5` | Control background (active) | `oklch(0.854 0.005 72)` | `#d1cecb` | `oklch(0.348 0.004 72)` | `#3b3a38` |
| `6` | Separator border (monotone step) | `oklch(0.824 0.005 72)` | `#c7c5c2` | `oklch(0.376 0.004 72)` | `#43413f` |
| `7` | Functional border (`>= 4.5:1`) | `oklch(0.545 0.006 72)` | `#72706c` | `oklch(0.588 0.005 72)` | `#7e7c79` |
| `8` | Hover / strong border | `oklch(0.452 0.006 72)` | `#585552` | `oklch(0.690 0.005 72)` | `#9d9b98` |
| `9` | Solid neutral ink / chalk fill | `oklch(0.188 0.004 72)` | `#141311` | `oklch(0.952 0.002 72)` | `#f0efee` |
| `10` | Solid neutral hover/active fill | `oklch(0.135 0.003 72)` | `#090807` | `oklch(0.990 0.001 72)` | `#fcfcfb` |
| `11` | Secondary text | `oklch(0.422 0.006 72)` | `#504d4a` | `oklch(0.848 0.004 72)` | `#cfcdca` |
| `12` | Primary high-contrast text | `oklch(0.175 0.004 72)` | `#12100f` | `oklch(0.942 0.002 72)` | `#edebea` |
| `disabled` | Disabled label text | `oklch(0.605 0.005 72)` | `#84817e` | `oklch(0.515 0.004 72)` | `#696765` |

### Electric Cobalt Accent (`hue 252°–260°`) & Status Primitives

| Token | Light OKLCH (Hex) | Dark OKLCH (Hex) |
| --- | --- | --- |
| `accent-2` | `oklch(0.944 0.024 258)` (`#e3edfd`) | `oklch(0.228 0.044 258)` (`#0f1d31`) |
| `accent-3` | `oklch(0.902 0.044 258)` (`#cde0fc`) | `oklch(0.275 0.064 258)` (`#122747`) |
| `accent-4` | `oklch(0.855 0.067 258)` (`#b5d1fc`) | `oklch(0.320 0.082 258)` (`#16325c`) |
| `accent-7` | `oklch(0.640 0.150 259)` (`#518be6`) | `oklch(0.530 0.155 258)` (`#2a69c3`) |
| `accent-8` | `oklch(0.525 0.195 260)` (`#1762d8`) | `oklch(0.640 0.160 256)` (`#438ceb`) |
| `accent-9` | `oklch(0.515 0.198 260)` (`#0f5ed6`) | `oklch(0.495 0.192 260)` (`#0c59cc`) |
| `accent-10` | `oklch(0.460 0.178 260)` (`#0a50b9`) | `oklch(0.532 0.204 260)` (`#1163df`) |
| `accent-11` | `oklch(0.415 0.160 260)` (`#0844a0`) | `oklch(0.845 0.075 252)` (`#a9d0fc`) |
| `accent-12` | `oklch(0.305 0.112 260)` (`#062b66`) | `oklch(0.905 0.044 252)` (`#cbe2fd`) |
| `danger-solid` | `oklch(0.555 0.211 26)` (`#d21e27`) | `oklch(0.515 0.198 26)` (`#bf1721`) |
| `danger-solid-hover` | `oklch(0.492 0.188 26)` (`#b3171f`) | `oklch(0.548 0.210 26)` (`#cf1b25`) |
| `danger-solid-active` | `oklch(0.442 0.168 26)` (`#9b131a`) | `oklch(0.472 0.181 26)` (`#aa141c`) |
| `warning-solid` | `oklch(0.815 0.159 78)` (`#fab42c`) | `oklch(0.785 0.155 74)` (`#f3a82b`) |
| `success-solid` | `oklch(0.515 0.113 158)` (`#167a4e`) | `oklch(0.488 0.107 158)` (`#147248`) |
| `success-solid-hover` | `oklch(0.455 0.100 158)` (`#116741`) | `oklch(0.518 0.114 158)` (`#167b4e`) |

---

## Tier 2: Semantic Chrome, Chart & Accessibility Roles

Canonical token source is [css/stone-tokens.css](../css/stone-tokens.css). Key additions in `v1.1.2`:

- **Ceramic Chrome:** `--color-glass-topbar`, `--color-glass-dock`, `--color-glass-toast`, `--glass-blur: blur(12px) saturate(135%)`, `--color-glass-rim`
- **Accessible Controls & States:** `--color-border-control` (`oklch(0 0 0 / 0.44)` Light / `oklch(1 0 0 / 0.36)` Dark), `--color-neutral-border`, `--color-text-placeholder`, `--color-bg-skeleton`, `--color-bg-disabled`, `--color-bg-overlay: var(--stone-raised)`
- **6-Series Chart Palette:** `--color-chart-1` (`#11739d` / `#38a6ca`), `--color-chart-2` (`#1e8a85` / `#42cac3`), `--color-chart-3` (`#6d46b3` / `#9d7de7`), `--color-chart-4` (`#b44591` / `#ed86c4`), `--color-chart-5` (`#aa5016` / `#ea8d52`), `--color-chart-6` (`#657f2f` / `#a7c76a`), `--color-chart-grid`, `--color-chart-axis`.

---

## Verified Contrast Matrix (Programmatic sRGB Measurements)

| Semantic Foreground / Background Pair | Light WCAG | Dark WCAG | Required Floor |
| --- | --- | --- | --- |
| `--color-text-primary` on `--color-bg-surface` | `18.22:1` | `15.34:1` | `>= 4.5:1` |
| `--color-text-secondary` on `--color-bg-well` / `--color-bg-surface` | `6.91:1` / `8.06:1` | `12.66:1` / `11.42:1` | `>= 4.5:1` |
| `--color-text-placeholder` on `--color-bg-raised` | `8.35:1` | `10.45:1` | `>= 4.5:1` |
| `--color-text-on-accent` on `--color-accent-solid` (Rest / Hover / Active) | `5.83` / `7.37` / `8.90:1` | `6.35` / `5.43` / `7.62:1` | `>= 4.5:1` (`>= 5.2:1` Dark Hover) |
| `--color-danger-on-solid` on `--color-danger-solid` (Rest / Hover / Active) | `5.30` / `6.85` / `8.41:1` | `6.24` / `5.45` / `7.44:1` | `>= 4.5:1` (`>= 5.2:1` Dark Hover) |
| `--color-success-on-solid` on `--color-success-solid` (Rest / Hover) | `5.32:1` / `6.92:1` | `5.98:1` / `5.25:1` | `>= 4.5:1` (`>= 5.2:1` Dark Hover) |
| `--color-border-control` vs `--color-bg-surface` / `--color-bg-raised` | `3.22:1` | `3.34:1` / `3.32:1` | `>= 3.0:1` (SC 1.4.11) |
| `--color-border-focus` vs `--color-bg-surface` | `5.36:1` | `5.36:1` | `>= 3.0:1` (SC 1.4.11) |
| `--color-chart-1..6` vs `--color-bg-surface` | `4.01:1` – `6.34:1` | `5.64:1` – `9.53:1` | `>= 3.0:1` (SC 1.4.11) |
| Primary / Secondary text over `0.94` Ceramic Chrome (worst-case) | `7.85:1` / `5.62:1` | `>= 9.10:1` | `>= 4.5:1` |

---

## Color Usage & Theme Switching Rules

1. **One Primary Action Per View:** Reserve `--color-accent-solid` (or `--color-ink-solid`) for the single primary action per view.
2. **CSP-Safe Theme Transition Suppression:** When toggling `.dark` on `<html>`, `StoneUI.setTheme()` temporarily sets `html[data-theme-switching="true"]` (which disables CSS transitions for two `requestAnimationFrame` ticks) rather than injecting inline `<style>` tags.
3. **Never Interpolate Gradients in sRGB:** Specify `in oklab` if an accent fade gradient is ever required.
