# 0007. A Settings context, and how screens reach use cases

- Status: accepted
- Date: 2026-10-27

## Context

Phase 2 adds the first preference (kg or lb) and the first screens that read and write data. The plan's bounded contexts don't include settings, and it doesn't say how screens get use cases or how "optimistic UI" applies when writes go to a local worker.

## Decision

- **Settings context:** a small `settings` context owns user preferences, starting with the mass unit, stored in `app_setting`. Units are used by Body, Training, and Nutrition, so they don't belong to any one of them. The architecture rules treat `settings` like the other contexts.
- **App context:** the app shell calls `startApp()` once and shares the resulting `Promise<App>` through a Svelte context (`getAppContext`). Screens await it, so no query runs before migrations finish. `wireApp(database, clock)` is a separate function so it can be tested against `node:sqlite`.
- **View models** (`*.svelte.ts` classes in `<context>/ui/`) hold rune state, call use cases, and turn domain errors into messages. They are tested in Node with the in-memory fakes. Pages only compose components and view models.
- **Cross-context screens:** the Settings page composes the units setting and the Body context's goal editor. A context's UI never imports another context.
- **Writes update the screen as soon as the worker answers,** which takes a few milliseconds. That is fast enough that no spinner or rollback is needed, so screens don't apply changes before the write finishes.
- **Row types** (`*.row.ts`) are type aliases rather than interfaces, so they stay assignable to the generic `SqlRow`.
- **Constructors** don't need TSDoc: they only take injected dependencies, which the class's TSDoc describes.

## Consequences

Each later context adds its use cases to `App` and its own view models. If writes ever become slow, optimistic updates can be added to the view models without changing pages.
