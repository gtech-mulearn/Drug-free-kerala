# Design system

This guide is for anyone changing the UI. To see every token and component live in both themes, run `npm run dev` and open [`/design-system`](http://localhost:3000/design-system).

The visual direction and the reasoning behind it are in [`docs/superpowers/specs/2026-09-24-ui-revamp-design.md`](superpowers/specs/2026-09-24-ui-revamp-design.md).

## The rules

1. **Use semantic colours only.** Write `bg-primary`, `text-muted-foreground` or `border-input`. Never `bg-[#71d884]`, `bg-green-500`, `text-white` or `dark:`. Tailwind's default palette has been removed, so those classes generate nothing, and the guard test fails the build if any of them appear.
2. **Theme dark surfaces with a scope, not with overrides.** Wrap a forest area in `<Section tone="inverse">`, or add the `theme-inverse` class. Everything inside re-themes itself: buttons, text, borders and focus rings.
3. **Keep heading level and size independent.** Choose `as` (h1–h4) to get the document outline right, and `size` to get the look.
4. **Build from primitives.** Before writing a new wrapper `div`, check `src/components/ui/` for a primitive that already does the job.
5. **Every colour pair passes WCAG AA.** Text needs 4.5:1 and UI boundaries need 3:1, in both themes. The contrast test enforces this, so an inaccessible token can't ship.
6. **Animate by marking, not by wrapping.** Put a `data-*` motion attribute on server-rendered markup (see [Motion](#motion)). Don't add client components just to animate.

## Architecture

```
src/styles/tokens.css   Layer 1 · palette     --palette-mint-400: #71d884       (never used directly)
                        Layer 2 · semantic    --primary: var(--palette-forest-900)
                        Layer 3 · themes      :root (light) · .theme-inverse (forest surfaces)
src/styles/theme.css    Tailwind @theme inline → utilities (bg-primary, text-display, rounded-panel, …)
src/styles/motion.css   Entrance start states, the failsafe, the hero intro keyframes
src/components/ui/      Primitives (cva variants) built only from those utilities
src/components/brand/   The logo as SVG: DoveMark, Logo, Wordmark (dove-path.ts holds the traced path)
src/components/motion/  Lenis + GSAP runtime and the few motion components (Marquee, LogoLoop, CurvedRibbon)
src/config/brand.ts     Colour literals for contexts that can't read CSS (OG image, meta theme-color)
```

`@theme inline` makes each utility reference its CSS variable directly (`background-color: var(--primary)`). That is what lets `.theme-inverse` re-theme a subtree at runtime.

## Colour tokens

The palette comes from the logo: mint `#71d884` fading to teal `#23a093`, on a deep forest base.

| Token | Light | Inverse | Use for |
|---|---|---|---|
| `background` / `foreground` | paper `#f4f5f2` / ink `#0e1512` | forest `#0a2622` / paper | Page and section backgrounds, and default text |
| `card` / `card-foreground` | white / ink | `#0f352f` / paper | Cards, inputs, tiles |
| `popover` / `popover-foreground` | white / ink | `#061a17` / paper | Dialogs, menus, toasts |
| `muted` / `muted-foreground` | `#eceee9` / `#4c5a55` | `#0f352f` / `#a3b8b1` | Subtle fills, secondary text, placeholders |
| `accent` / `accent-foreground` | `#d3f0d8` / ink | `#0f352f` / paper | Tinted fills, info alerts |
| `surface-wash` / `-foreground` | mint wash `#e8f7ea` / ink | `#061a17` / paper | Light bands (About panel, pledge band) |
| `primary` / `primary-foreground` | forest / paper | mint / forest | Calls to action |
| `secondary` / `secondary-foreground` | white / ink | `#0f352f` / paper | Secondary buttons |
| `highlight` | teal `#17766c` | mint | Emphasis text: numbers, highlighted words |
| `brand` / `brand-foreground` | mint / forest | same | Mint fills: tiles, the ribbon, timeline dots |
| `mark-start` · `mark-end` | mint · teal `#23a093` | same | The logo gradient only (decorative) |
| `destructive` / `-foreground` | `#b42318` / white | `#f97066` / black | Errors |
| `border` · `input` · `ring` | `#d5dbd7` · `#7d8a85` · teal | `#1f4a42` · `#6f8f86` · mint | Dividers · form-control outlines (3:1) · focus rings (3:1) |
| `overlay` | black | black | Scrims under dialogs and over photos (use it with opacity: `bg-overlay/60`) |

**Why is `highlight` teal-700 on light surfaces?** The logo's teal `#23a093` reaches only 2.9:1 on paper, so it stays decorative (`mark-end`). Teal-700 gives 5.0:1. On forest, `highlight` becomes mint (9.0:1).

## Typography, spacing, shape and motion tokens

| Kind | Tokens |
|---|---|
| Type scale (fluid) | `text-hero` · `text-display` · `text-headline` · `text-title` · `text-statement` · `text-counter` · `text-poster`, plus Tailwind's `text-xs` … `text-6xl` for body and numerals. Use them through `<Heading size>` and `<Text size>`. |
| Fonts | `font-sans`: Inter Tight (everything). `font-poster`: Bebas Neue, the logo's lettering, for numerals and the wordmark only. Both are self-hosted by `next/font`. The certificate canvas loads Poppins on its own (`src/features/certificate/lib/font.ts`). |
| Tracking | `tracking-display` (−0.035em) for large headings |
| Layout | `max-w-content` (80rem) · `px-gutter` (fluid page margin) · `py-section` (fluid section rhythm) · `h-header` / `pt-header` (5rem) |
| Radius | `rounded-full` for actions · `rounded-panel` (1.75rem) for photos and panels · `rounded-card` (1.25rem) · `rounded-tile` (0.5rem) for grid tiles · `rounded-sm` … `rounded-xl` |
| Texture | `bg-grain` (film grain, via `<Grain>` at `--grain-opacity`) · `bg-aurora` (mint/teal light on forest) |
| Elevation | `shadow-card` (resting) · `shadow-raised` (hover, dialogs) |
| Easing | `ease-out-expo` (matches GSAP's `expo.out`) · `ease-standard` · `ease-emphasized` |

## Components (`src/components/ui`)

| Component | Variants |
|---|---|
| `Button` | `variant`: primary · secondary · outline · ghost · link. `size`: sm · md · lg · xl · icon · icon-sm. `arrow` adds the round arrow badge. `asChild` for links. Defaults to `type="button"`. |
| `Heading` | `as`: h1–h4 · p · div. `size`: hero · display · headline · title · subtitle · counter · poster. `caps` for bold uppercase section titles. `align`. |
| `Text` | `size`: statement · lead · body · sm · xs. `tone`: muted · primary · destructive (inherits colour when unset). `weight`, `align`, `as`. |
| `Eyebrow` | Pill label above a heading |
| `Tag` | `tone`: outline · solid · brand |
| `Tile` | `tone`: light · brand · forest · photo (big content on top, small copy at the bottom) |
| `Grain` | Film-grain overlay; behind content by default, `className="z-0"` to lay it over a photo |
| `Container` | `size`: content · narrow · full |
| `Section` | `tone`: default · surface · wash · inverse. `spacing`: default · compact · none. |
| `SectionHeader` | `title`, `description`, `align`, `titleId` (for `aria-labelledby`) |
| `Card` | `tone`: default · accent · inverse. `padding`: none · md · lg. `interactive`. |
| `IconBadge` | `tone`: card · subtle · accent · destructive. `size`: sm · md · lg. Decorative (`aria-hidden`). |
| `FormField`, `Input`, `Checkbox`, `Label`, `FieldError`, `FormAlert`, `Spinner` | `FormField` wires the label, description and error to its control. |
| `Dialog`, `Sheet`, `Toaster` | Radix-based and themed only through tokens. `Sheet` has a `full` side for the full-screen menu. |

Brand marks live in `src/components/brand`: `Logo` (the full lockup, `decorative` when a parent already names it), `DoveMark` (`cage`, `tone`: gradient · solid) and `Wordmark` (the one-line footer sign-off).

## Motion

Smooth scrolling (Lenis) and every scroll effect (GSAP) are started by one client component, `MotionRuntime`, mounted in the root layout. Sections stay Server Components and only **mark** elements:

| Attribute | Effect |
|---|---|
| `data-reveal` | Fades and rises 24 px on entry; siblings entering together stagger 0.08 s |
| `data-split` | Lines rise out of masks (SplitText); for headings and statements |
| `data-clip` | A media frame opens upward; its `[data-clip-media]` child settles from 115 % |
| `data-count` | A number counts up from 0 on first view (`useCountUp`) |
| `data-parallax="6"` | Scrubbed drift of ±6 % while the parent crosses the screen |
| `data-warm` · `data-warm-layer` | A duotone layer fades out while the element is near the centre of the screen |
| `data-spy="x"` · `data-spy-target="x"` | The index entry gets `data-active` while its target is centred |
| `data-rise` | Scrubbed rise out of the parent's mask (the footer wordmark) |

**Rules:**
- Animate only transform, opacity and clip-path. The ribbon's `startOffset` is the one documented exception.
- Use `expo.out` (CSS `ease-out-expo`) for entrances, with durations of 0.8–1.2 s and staggers of no more than 0.08 s.
- Give each section one signature move.
- Never use bounce, rotation, blur-in, typewriter text or cursor followers.

**Content is never left hidden** (`src/styles/motion.css`):
- Start states apply only under `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`. Without JavaScript, everything is visible.
- `MotionRuntime` sets `<html data-motion="ready">`. It sets `"static"` instead under reduced motion, after an error, or if it starts after 2.5 s. In all three cases everything is at rest.
- Until `data-motion` is set, a CSS failsafe reveals everything after 2.5 s (`FAILSAFE_MS`).
- Keyboard focus that lands inside unrevealed content reveals it instantly.
- Marquees can be paused (WCAG 2.2.2), and their duplicate items are `inert`.

## What the tests enforce (`src/test/design-system/`)

| Test | Fails when |
|---|---|
| `contrast.test.ts` | A text/surface pair falls below 4.5:1, or a ring or input falls below 3:1, in either theme. Also fails if a semantic token is missing from a theme or has no Tailwind utility. |
| `guard.test.ts` | Any file in `src/` uses an arbitrary colour (`bg-[#…]`), a palette class (`bg-gray-100`, `text-white`), `dark:`, an arbitrary font size or family, a raw `<img>`, or a colour literal outside `src/config/brand.ts`. The rules are also tested against real violations taken from the old codebase. |
| `brand.test.ts` | `src/config/brand.ts` drifts from `tokens.css` |
| `src/lib/utils.test.ts` | `cn()` stops understanding the custom scales (for example, it drops `text-display` when merged with `text-foreground`) |

## Changing the system

- **Adjust a colour:** edit the palette or semantic value in `tokens.css`, then run `npm test`. The contrast test tells you whether the change still passes.
- **Add a semantic token:** add it to both theme blocks in `tokens.css`, map it in `theme.css` (`--color-x: var(--x);`), add its pairs to `contrast.test.ts`, and document it in the table above. The completeness test fails until the first two steps are done. `tokens.css` holds colours only; other theme values go in `theme.css`.
- **Add a component variant:** extend the component's `cva` definition, use only token utilities, and add it to `/design-system`.
- **Add a scale token** (size, radius, shadow, spacing, font, tracking, easing): add it to `theme.css` *and* to the `extendTailwindMerge` config in `src/lib/utils.ts`. Otherwise `cn()` may silently drop it.
- **Add a motion effect:** add an initializer to `src/components/motion/effects.ts`, call it from `MotionRuntime`, and document its attribute above. If it hides content before it runs, give it a start state and a failsafe entry in `motion.css`.
