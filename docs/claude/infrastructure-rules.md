# Infrastructure rules

- Three separate types per aggregate: the domain model (in `domain/`), a `*Row` type that mirrors the table columns exactly in snake_case with no logic, and a `*Mapper`.
- `Mapper.toDomain(row)` validates and returns a `Result`; corrupt rows fail loudly. Never cast a row. `Mapper.toRow(model)` is total. Every mapper has a round-trip test.
- Repositories (`Sqlite*Repository`) implement the domain's role interfaces, depend on the `SqlDriver` port (never on the worker), save each aggregate in one transaction, and return domain models only. Rows never leave `infrastructure/`.
- SQL lives in named constants in the repository's `*.sql.ts` file.
- Schema: every table `STRICT`, `PRAGMA foreign_keys = ON`, TEXT UUIDv7 ids, TEXT `YYYY-MM-DD` dates, INTEGER epoch-ms timestamps, REAL kilograms and grams. Child rows cascade on delete of their root.
- Add an index only when a query needs it, and name that query in the migration.
- Migrations are numbered SQL files in `src/lib/platform/db/migrations/`. Never edit one that has shipped; add a new one with /migration and update the schema snapshot.
- Each repository has a contract test suite shared with its in-memory fake in `tests/fakes/`, run against `node:sqlite` with all migrations applied (`migratedDatabase()` in `tests/support/`).
