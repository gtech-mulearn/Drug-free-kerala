# Design system

This guide is for anyone changing the UI. To see every token and component live in both themes, run `npm run dev` and open [`/design-system`](http://localhost:3000/design-system).

## The rules

1. **Use semantic colours only.** Write `bg-primary`, `text-muted-foreground` or `border-input`. Never `bg-[#5cb769]`, `bg-green-500`, `text-white` or `dark:`. Tailwind's default palette has been removed, so those classes generate nothing, and the guard test fails the build if any of them appear.
2. **Theme dark surfaces with a scope, not with overrides.** Wrap a dark area in `<Section tone="inverse">`, or add the `theme-inverse` class. Everything inside re-themes itself: buttons, text, borders and focus rings.
3. **Keep heading level and size independent.** Choose `as` (h1–h4) to get the document outline right, and `size` to get the look.
4. **Build from primitives.** Before writing a new wrapper `div`, check `src/components/ui/` for a primitive that already does the job.
5. **Every colour pair passes WCAG AA.** Text needs 4.5:1 and UI boundaries need 3:1, in both themes. The contrast test enforces this, so an inaccessible token can't ship.

## Architecture

```
src/styles/tokens.css   Layer 1 · palette     --palette-green-400: #5cb769      (never used directly)
                        Layer 2 · semantic    --primary: var(--palette-green-700)
                        Layer 3 · themes      :root (light) · .theme-inverse (dark surfaces)
src/styles/theme.css    Tailwind @theme inline → utilities (bg-primary, text-display, rounded-card, …)
src/components/ui/      Primitives (cva variants) built only from those utilities
src/config/brand.ts     Colour literals for contexts that can't read CSS (OG image, canvas, meta)
```

`@theme inline` makes each utility reference its CSS variable directly (`background-color: var(--primary)`). That is what lets `.theme-inverse` re-theme a subtree at runtime.

## Colour tokens

| Token | Light | Inverse | Use for |
|---|---|---|---|
| `background` / `foreground` | `#efeeec` / `#1e1e1e` | `#000000` / `#f2f2f2` | Page and section backgrounds, and default text |
| `card` / `card-foreground` | white / ink | `#0a0a0a` / off-white | Cards, inputs, raised content |
| `popover` / `popover-foreground` | white / ink | `#0a0a0a` / off-white | Dialogs, menus, toasts |
| `muted` / `muted-foreground` | `#e4e3e0` / `#525b65` | `#2a2a2a` / `#a3a3a3` | Subtle fills, secondary text, placeholders |
| `accent` / `accent-foreground` | `#dbf3df` / ink | `#2a2a2a` / off-white | Tinted cards (pillars), hover fills |
| `surface-brand` / `-foreground` | `#edf8ef` / ink | `#0f2914` / off-white | Brand-tinted section bands |
| `primary` / `primary-foreground` | `#2b7036` / white | `#5cb769` / `#0f2914` | Calls to action, links, emphasised text |
| `secondary` / `secondary-foreground` | white / ink | `#2a2a2a` / off-white | Secondary buttons |
| `brand` / `brand-foreground` | `#5cb769` / `#0f2914` | same | Decorative fills (blobs, underlines, checkmarks) |
| `destructive` / `-foreground` | `#b42318` / white | `#f97066` / black | Errors |
| `border` · `input` · `ring` | `#d9d9d9` · `#8a8a8a` · `#2b7036` | `#2a2a2a` · `#8a8a8a` · `#5cb769` | Dividers · form-control outlines (3:1) · focus rings (3:1) |
| `overlay` | black | black | Scrims under dialogs and over photos (use it with opacity: `bg-overlay/60`) |

**Why is the light `primary` darker than the logo green?** White text on `#5cb769` is 2.5:1, which fails AA. `#2b7036` gives 6.0:1. The bright green is kept as `brand`, for decoration and for `primary` on dark surfaces, where it reaches 8.4:1.

## Typography, spacing, shape and motion

| Kind | Tokens |
|---|---|
| Type scale (fluid) | `text-counter` · `text-display` · `text-headline` · `text-title`, plus Tailwind's `text-xs` … `text-2xl` for body text. Use them through `<Heading size>` and `<Text size>`. |
| Font | Poppins via `next/font` (`font-sans`); weights 300–700 |
| Layout | `max-w-content` (80rem) · `px-gutter` (fluid page margin) · `py-section` (fluid section rhythm) · `h-header` / `pt-header` (5rem) |
| Radius | `rounded-sm` … `rounded-xl` (from `--radius`) · `rounded-card` (1.875rem) · `rounded-t-section` (the footer's top curve) |
| Elevation | `shadow-card` (resting) · `shadow-raised` (hover, dialogs) |
| Motion | `ease-standard` · `ease-emphasized` · `reveal` (CSS scroll-driven entrance). Every animation is disabled under `prefers-reduced-motion`. |

## Components (`src/components/ui`)

| Component | Variants |
|---|---|
| `Button` | `variant`: primary · secondary · outline · ghost · link. `size`: sm · md · lg · xl · icon · icon-sm. `asChild` for links. Defaults to `type="button"`. |
| `Heading` | `as`: h1–h4 · p · div. `size`: counter · display · headline · title · subtitle. `align`. |
| `Text` | `size`: lead · body · sm · xs. `tone`: muted · primary · destructive (inherits colour when unset). `weight`, `align`, `as`. |
| `Container` | `size`: content · narrow · full |
| `Section` | `tone`: default · surface · brand · inverse. `spacing`: default · compact · none. |
| `SectionHeader` | `title`, `description`, `align`, `titleId` (for `aria-labelledby`) |
| `Card` | `tone`: default · accent · inverse. `padding`: none · md · lg. `interactive`. |
| `IconBadge` | `tone`: card · subtle · accent · destructive. `size`: sm · md · lg. Decorative (`aria-hidden`). |
| `FormField`, `Input`, `Checkbox`, `Label`, `FieldError`, `FormAlert`, `Spinner` | `FormField` wires the label, description and error to its control. |
| `Dialog`, `Sheet`, `Toaster` | Radix-based and themed only through tokens |

## What the tests enforce (`src/test/design-system/`)

| Test | Fails when |
|---|---|
| `contrast.test.ts` | A text/surface pair falls below 4.5:1, or a ring or input falls below 3:1, in either theme. Also fails if a semantic token is missing from a theme or has no Tailwind utility. |
| `guard.test.ts` | Any file in `src/` uses an arbitrary colour (`bg-[#…]`), a palette class (`bg-gray-100`, `text-white`), `dark:`, an arbitrary font size or family, a raw `<img>`, or a colour literal outside `src/config/brand.ts`. The rules are also tested against real violations taken from the old codebase. |
| `brand.test.ts` | `src/config/brand.ts` drifts from `tokens.css` |
| `src/lib/utils.test.ts` | `cn()` stops understanding the custom scales (for example, it drops `text-display` when merged with `text-foreground`) |

## Changing the system

- **Adjust a colour:** edit the palette or semantic value in `tokens.css`, then run `npm test`. The contrast test tells you whether the change still passes.
- **Add a semantic token:** add it to both theme blocks in `tokens.css`, map it in `theme.css` (`--color-x: var(--x);`), add its pairs to `contrast.test.ts`, and document it in the table above. The completeness test fails until the first two steps are done.
- **Add a component variant:** extend the component's `cva` definition, use only token utilities, and add it to `/design-system`.
- **Add a scale token** (size, radius, shadow, spacing): add it to `theme.css` *and* to the `extendTailwindMerge` config in `src/lib/utils.ts`. Otherwise `cn()` may silently drop it.
