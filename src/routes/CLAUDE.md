# UI rules

- Components are thin: markup and local UI state only. Logic lives in view models (`src/lib/<context>/ui/`) or use cases.
- View models call use cases from the composition root (`src/lib/app/`). Routes and UI never import infrastructure or `src/lib/platform/{db,photos,backup}`.
- Parse input at the edge: turn form values into value objects (LocalDate, Mass, Portion) before calling a use case. Show the domain's validation errors; never write invalid data.
- Props are the minimum a component draws (a `Mass` and a `LocalDate`, not an aggregate), typed with a documented `Props` type.
- Runes only (`$state`, `$derived`, `$props`). Every `{#each}` has a key. Never `{@html}` with user content.
- No text literals in markup or scripts: use `messages` from `#lib/i18n/messages.en.ts`.
- Styling uses design tokens from `src/lib/design/tokens.css` only. No inline `style` attributes (the CSP blocks them).
- Native feel: one obvious primary action per screen, bottom sheets for quick entry, `inputmode="decimal"`/`"numeric"` on number fields, 44 x 44 px tap targets, safe-area insets, optimistic updates, no spinners for local work, respect `prefers-reduced-motion`.
- Accessibility: WCAG 2.2 AA contrast, visible focus, labeled controls, text summaries for charts.
