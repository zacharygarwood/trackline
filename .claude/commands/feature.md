---
description: Build a feature inside-out, test first, through every layer
argument-hint: <feature name>
---

Build the feature "$ARGUMENTS" inside-out. Check the build plan for its scope and stay inside the current phase. At each step, write the tests first and see them fail before writing the code.

1. Domain: tests, then value objects, aggregates, invariants in factories returning `Result`, and domain services. Repository role interfaces with only the methods the use cases need.
2. Application: one use case per file with a narrow command type. Tests use in-memory fakes from `tests/fakes/` and an injected Clock and IdGenerator.
3. Persistence: `*Row` type, `*Mapper` with round-trip tests, `Sqlite*Repository` with SQL in `*.sql.ts`, and a contract test suite shared with the fake.
4. Migration, if the schema changes: use /migration.
5. Wire it in `src/lib/app/container.ts`.
6. View model, then UI components using design tokens and `messages`.
7. An end-to-end journey only if the plan lists this flow as critical.

Then run /review and fix what it finds.
