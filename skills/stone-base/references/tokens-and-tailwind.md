# Reference: Stone Base `v1.1.2` Tokens & Tailwind v4 Bridge

## 1. Layer Stack (`css/stone-tokens.css`)

```css
@layer reset, tokens, base, primitives, components, shells, patterns;
```

Consuming projects wrapping Tailwind v4 should import `stone-tokens.css` before Tailwind utilities and map only Tier-2 roles:

```css
@import "./stone-tokens.css";
@import "tailwindcss";

@theme inline {
  --color-canvas: var(--color-bg-canvas);
  --color-well: var(--color-bg-well);
  --color-surface: var(--color-bg-surface);
  --color-raised: var(--color-bg-raised);
  --color-overlay: var(--color-bg-overlay);
  --color-control: var(--color-bg-control);
  --color-control-hover: var(--color-bg-control-hover);
  --color-disabled-bg: var(--color-bg-disabled);
  --color-skeleton: var(--color-bg-skeleton);

  --color-ink: var(--color-text-primary);
  --color-ink-muted: var(--color-text-secondary);
  --color-ink-placeholder: var(--color-text-placeholder);

  --color-line-hairline: var(--color-border-hairline);
  --color-line-control: var(--color-border-control);
  --color-line-strong: var(--color-border-strong);
  --color-ring-focus: var(--color-border-focus);

  --color-accent: var(--color-accent-solid);
  --color-accent-hover: var(--color-accent-solid-hover);
  --color-accent-subtle: var(--color-accent-subtle);
  --color-accent-ink: var(--color-accent-text-strong);

  --color-danger: var(--color-danger-solid);
  --color-warning: var(--color-warning-solid);
  --color-success: var(--color-success-solid);

  --color-chart-1: var(--color-chart-1);
  --color-chart-2: var(--color-chart-2);
  --color-chart-3: var(--color-chart-3);
  --color-chart-4: var(--color-chart-4);
  --color-chart-5: var(--color-chart-5);
  --color-chart-6: var(--color-chart-6);

  --radius-xs: var(--radius-xs);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}
```

## 2. Concentric Radius Pattern

Boxes (`.stone-surface`, `.stone-raised`, `.stone-overlay`, `.stone-modal`) paired with `.pad-xs`..`.pad-lg` automatically compute `--outer-radius` and `--outer-pad` for nested `.stone-well` children (`r_inner = max(4px, var(--outer-radius) - var(--outer-pad) - 1px)`). Never use arbitrary negative calc values or mix `0px` with `16px`.

## 3. Core Button Variants (7 Canonical vs Legacy Compat)

- **Core (`css/stone-components.css`):** `primary`, `ink`, `secondary`, `surface`, `ghost`, `danger`, `danger-subtle`.
- **Legacy (`css/stone-compat-v1_1.css`):** `accent-subtle`, `success`, `success-subtle`, `warning`, `warning-subtle`, plus `--color-*-bg` and `--color-bg-overlay-glass` aliases.
