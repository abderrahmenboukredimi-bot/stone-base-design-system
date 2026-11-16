# 05 — Suite Shell, Accessibility, and UX Copy (`v1.1.2`)

To connect small utilities and large multi-view workspaces into one recognizable product suite without cramping small screens, Stone Base defines an **Adaptive Dual-Shell Chrome**, a universal **Keyboard & Switcher Contract**, a **WCAG 2.2 AA Accessibility Baseline**, and **UX Writing Standards**.

---

## Dual-Shell Adaptive Suite Chrome

Every application in the suite mounts inside either `.stone-shell--compact` or `.stone-shell--workspace` while keeping the **top-leading Suite Switcher**, **ceramics-tinted sticky header**, **global hotkeys**, and **modal accessibility** identical.

### 1. Invariant Suite Anchor and Global Launcher

- **Suite Switcher Trigger (`.stone-suite-trigger`):** Displays `[22px App Mark .stone-suite-mark] + [App Name (weight 600)] + [ChevronsUpDown]`. Clicking opens `#stone-suite-popover` (`role="menu"`) listing all connected Stone Suite apps (**Stone Base Catalog**, **Stone Converter**, **Worker Operations**, **Studio Reservations**, **Automation Runs**), highlighting the active page (`aria-current="page"`), and exposing a `Ctrl+K` shortcut item.
- **Sticky Frosted Ceramic Header (`.stone-topbar`):** `block-size: var(--topbar-height)` (`3rem` / `48px`), `background-color: var(--color-glass-topbar)` (`0.94–0.95` alpha + `backdrop-filter: var(--glass-blur)`), top inner highlight `--shadow-bevel-surface`, `isolation: isolate`, and `border-block-end: 1px solid var(--color-border-hairline)`. Set `scroll-padding-block-start: var(--topbar-height);` so anchor jumps and focus targets never slide underneath the header.
- **Global Suite Launcher (`Cmd+K` / `Ctrl+K`):** Opens centered `#stone-cmdk-dialog` (`.stone-dialog--instant`, `0ms`), guarded against editable targets (`input`, `textarea`, `select`, `[contenteditable]`).
- **Mobile Topbar Hygiene (`< 48rem`):** Compacts optional `[data-dir-toggle]` text button and inline `<kbd>` badge out of the topbar (keeping RTL toggle cleanly accessible inside `#stone-settings-popover`) so the Suite Switcher trigger and primary theme/settings controls never clip.

### 2. Shell Variant A: `.stone-shell--compact`

For single-purpose utilities (`--container-md` `688px`, e.g., *Stone Converter*) and booking/scheduling tools (`--container-lg` `880px`, e.g., *Studio Reservations*) that do not need a permanent sidebar:

- **Header + Optional Underline Tabs (`.stone-tabs-bar`):** `scrollbar-width: none;` hides horizontal tab scrollbar clutter on narrow phones while scrolling smoothly. Sync active tab to `?tab=...` via `[data-sync-url]`.
- **Mobile Parity:** Top-leading `.stone-suite-trigger` and `Cmd+K` launcher expose full suite switching cleanly on `< 48rem` phones with zero sidebar dependency.

### 3. Shell Variant B: `.stone-shell--workspace`

For multi-view consoles, worker schedulers, analytics dashboards, and automation queues using the **Sidebar Inset** framing pattern:

- **Sidebar Rail (`.stone-sidebar`):** Desktop expanded width `16rem` (`256px`), collapsed icon rail `3rem` (`48px`), toggled via `Cmd+B` / `Ctrl+B` (guarded on editable inputs) or `[data-sidebar-toggle]`. Collapsed links show tooltips automatically via `StoneUI`.
- **Mobile Navigation Drawer (`< 48rem`):** `#stone-mobile-drawer` (`18rem` / `288px` `<dialog>` drawer) syncs sidebar links **and** the full 5-app Suite Switcher list so mobile users can navigate sections and companion suite apps from one drawer.
- **Curved Inset Sheet (`.stone-sidebar-inset`):** Surrounded by `8px` (`--space-2`) desktop frame inside `--color-sidebar-bg`, rounded with `--radius-xl` (`16px` + optional squircle). Never apply `overflow: hidden` or `opacity < 1` on `.stone-sidebar-inset`, as doing so breaks `backdrop-filter` and sticky positioning on `.stone-topbar` and `.stone-inspector`.
- **3-Pane Contextual Inspector (`.stone-inspector`):** On `>= 64rem` desktops, docks a sticky `20rem` (`320px`) detail pane below `--topbar-height` (`inset-block-start: var(--topbar-height)`). Below `64rem`, interactive rows open matching modal dialog detail drawers for `100%` feature parity.
- **Floating Contextual Dock (`.stone-floating-bar`):** Logically centered (`inset-inline: 0; margin-inline: auto; inline-size: fit-content;` — RTL parity verified) inside ceramic glass (`--color-glass-dock`). Only counts **visible** rows (`tbody tr:not([hidden])`), formats counts via `Intl.PluralRules`, dynamically reserves bottom scroll clearance (`body:has(.stone-floating-bar:not([hidden], .stone-floating-bar--static)) .stone-main`), and hides automatically (`[hidden]`) whenever any modal `<dialog[open]>` is active.

---

## Accessibility Baseline (WCAG 2.2 Level AA)

1. **Native Elements First:** Use `<button>` for actions, `<a href>` for navigation, `<label for>` for controls, and native `<dialog>.showModal()` for modals. Avoid clickable `<div>`/`<span>` elements.
2. **Focus Visibility & Order:** `:focus-visible` renders `outline: 2px solid var(--color-border-focus); outline-offset: 2px;` (`5.36:1` Light & Dark). Never use `tabindex > 0`.
3. **Skip Link & Landmarks:** Expose `<a href="#main-content" class="skip-link">Skip to ...</a>`, single `<main id="main-content" tabindex="-1">`, and ordered headings (`h1` &#8594; `h2` &#8594; `h3`).
4. **Target Sizes & Hit Floor:** Enforce `>= 44x44px` on mobile/touch interactive targets (buttons, segmented pills, calendar cells, slot items, menu items) via `@media (pointer: coarse), (max-width: 30rem)`.
5. **Control Borders (`SC 1.4.11`):** `--color-border-control` enforces `>= 3.22:1` Light / `>= 3.32:1` Dark on checkboxes, radios, switches, progress tracks, buttons, and slots. Custom checkboxes support `:checked`, `:indeterminate`, `:disabled`, and `@media (forced-colors: active)`.
6. **CSP-Safe Event Lifecycle:** Avoid inline `<script>` or `onclick=` handlers (`<script src="...stone-boot.js">` + `stone-ui.js`). `StoneUI.mount(root, opts)` / `destroy()` clean up cleanly with zero leaks, and emit semantic `CustomEvent`s (`stone:inspect`, `stone:selection-change`, `stone:select`, `stone:dialog-action`, `stone:hold-confirm`).
7. **Dynamic Announcements:** Maintain `#stone-live-polite` (`aria-live="polite"`) and `#stone-live-assertive` (`aria-live="assertive"`). Form errors link via `aria-invalid="true"` + `aria-describedby` and clear immediately upon valid input or form reset.

---

## UX Writing and Microcopy Rules

- **One Vocabulary & Sentence Case:** Maintain uniform labels across menus, buttons, and toasts in natural sentence case (`Save changes`, `Assign shift`, `Confirm booking`).
- **Verb-First Buttons & Specific Links:** Action buttons start with verbs (`Publish dispatch`, `Resolve`, `Replay run`); never bare `OK` / `Click here` / vague marketing superlatives.
- **Settings Describe ON State:** Label toggles for what turns on (`Send read receipts`, `Auto-assign next available shift`).
- **Errors Explain How to Fix:** Inline errors name the exact fix (`Enter a project name with at least 3 characters.`).
- **Undo & Guarded Destruction:** Non-destructive actions act immediately with undo toasts; irreversible destructive actions require modal confirmation or `.stone-hold-btn`.
- **Formatting & Bidi:** Format numbers with `Intl.*` (`tabular-nums`), use proper Unicode arrows (`&#8594;`, `&#8596;`) and ellipses (`…`) in UI copy, and wrap mixed-direction IDs/times/JSON snippets in `<bdi>`.
