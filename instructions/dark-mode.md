# Dark Mode Instructions

## Goals
- Use system preference by default with a user override.
- Keep the palette soft charcoal in dark mode.
- Maintain readable contrast while preserving the app's minimal style.

## Theme Behavior
- Default: system preference.
- Override: user toggle persists to localStorage.
- Storage key: `theme`.
- Values: `light`, `dark`, `system` (system only if/when added in UI).

## Current Implementation
- Toggle component: `src/components/theme-toggle.tsx`.
- Header integration: `src/components/site-header.tsx`.
- Hydration safety: `<html suppressHydrationWarning>` in `src/app/layout.tsx`.
- Dark tokens: `src/app/globals.css` `.dark` block.

## Palette Guidance
- Light mode primary: `#082f49` (Tailwind `sky-950`).
- Dark mode primary: `#38bdf8` (Tailwind `sky-400`).
- Dark background: `#0f1115`, card: `#151922`.
- Borders/inputs: `#27303f`.
- Muted text: `#9ca3af`.

## Component Styling Rules
- Use token classes: `bg-background`, `bg-card`, `text-foreground`, `border-border`.
- Avoid hard-coded `bg-white`, `text-black`, or gradient-only light backgrounds.
- For hero/section gradients, add dark variants (e.g., `dark:from-slate-950`).

## Pages Needing Dark Variants
- Home (`src/app/page.tsx`): hero, champions cards, stats section, CTA.
- About (`src/app/about/page.tsx`): mission card + stat cards.
- Footer (`src/components/site-footer.tsx`): light gradient with dark fallback.

## Future Enhancements
- Add a `System` option to the toggle (3-state).
- Audit popovers/sheets for contrast under dark mode.
- Add automated visual checks (optional).
