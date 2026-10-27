---
description: Create the next numbered SQL migration
argument-hint: <description>
---

Create a migration for: $ARGUMENTS

1. Find the highest-numbered file in `src/lib/platform/db/migrations/` and create the next one, `NNNN_snake_case_description.sql`. Never edit a migration that has shipped.
2. Follow the schema conventions in `docs/claude/infrastructure-rules.md`: `STRICT` tables, TEXT ids and dates, INTEGER timestamps, REAL kilograms and grams, cascading child rows. Comment each index with the query that needs it.
3. Update the committed schema snapshot and make sure the snapshot test passes.
4. Add or update repository tests that use the new schema.
