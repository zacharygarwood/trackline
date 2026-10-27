---
description: Staff-engineer review of the current diff, then fix the findings
---

Review the current diff (`git diff` plus untracked files) as a staff engineer would. Check every item and fix what fails before reporting:

1. Every name comes from the ubiquitous language and says what the thing is.
2. Each module has one reason to change, dependencies point inward, and every boundary passes only the data its receiver needs, as domain models or value objects.
3. Types prevent invalid states wherever possible, instead of runtime checks.
4. Expected failures are `Result` values with specific, named error types.
5. Nothing needs a comment to be understood. If something does, rename or extract first.
6. Nothing exists that the current phase doesn't need.
7. Tests read as behavior specifications, use builders, and stay within the speed budget.
8. The code quality rules hold: no string literals outside messages/constants/SQL modules, no numeric indexing, no `!` or `as` casts, no magic numbers, no enums, TSDoc on every export, no inline lint disables.
9. The diff is something a staff engineer would approve without changes.

Then run `pnpm lint`, `pnpm arch`, and `pnpm test`. Report what you fixed and anything you left unresolved, with the reason.
