# Domain rules

- Pure TypeScript only. No imports from Svelte, SvelteKit, SQLite, browser APIs, or another context. The shared kernel (`src/lib/shared/`) is the only outside import.
- Names come from the ubiquitous language: WeighIn, WorkoutSet, MealSlot, Portion. Never Item, Data, Info, or Manager.
- Models are immutable: readonly types or classes built by factory functions.
- Factories validate every invariant and return `Result<Model, SpecificError>`. A model that exists is valid.
- Expected failures are `Result` values with named error types. Throw only for programmer errors.
- Make illegal states unrepresentable: discriminated unions (`ActiveWorkout | FinishedWorkout`), not optional fields that only make sense together.
- Closed sets are `as const` objects with a derived union type, never `enum`. Handle unions exhaustively (`assertNever`).
- Limits are named constants (`MAX_REPS`, `MOVING_AVERAGE_DAYS`).
- Repository interfaces live here, split by role (`WeighInReader`, `WeighInWriter`), with only the methods current use cases call.
- Time and IDs come from injected `Clock` and `IdGenerator` ports, never from `Date` or `crypto`.
- Write the tests first. Every invariant has a test for the accepted and the rejected case.
