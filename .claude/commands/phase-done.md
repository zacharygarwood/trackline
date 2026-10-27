---
description: Verify the current phase is complete and write its summary
---

Close out the current build phase:

1. Run `pnpm check` and `pnpm test:e2e`. Fix any failures.
2. Run /review on everything changed in this phase.
3. Go through the phase's checklist in the build plan item by item and verify each one with evidence (a passing test, a command's output, a file). Mark anything incomplete.
4. If a convention changed, update the relevant CLAUDE.md files and ADRs.
5. Write the phase summary: what was built, the ADRs added, any deviations from the plan and why, what could not be verified locally, and open questions. Then stop for review before starting the next phase.
