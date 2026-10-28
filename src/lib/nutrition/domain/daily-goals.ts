import type { LocalDate } from '../../shared/local-date.ts';
import type { Result } from '../../shared/result.ts';
import { ok } from '../../shared/result.ts';
import { createMacros, type InvalidMacros, type Macros } from './macros.ts';

/**
 * Daily targets for calories and macros, in effect from a date until the
 * next version. Old days are judged against the goals in effect then.
 */
export interface DailyGoals {
	readonly targets: Macros;
	readonly effectiveFrom: LocalDate;
}

/**
 * Creates a goals version.
 *
 * @param fields - The targets and the first day they apply.
 */
export function createDailyGoals(fields: DailyGoals): Result<DailyGoals, InvalidMacros> {
	const targets = createMacros(fields.targets);
	return targets.ok ? ok({ targets: targets.value, effectiveFrom: fields.effectiveFrom }) : targets;
}

/**
 * The goals in effect on a date: the latest version starting on or before it.
 *
 * @param versions - Every goals version, in any order.
 * @param date - The day being judged.
 */
export function goalsOn(versions: readonly DailyGoals[], date: LocalDate): DailyGoals | undefined {
	return versions
		.filter((version) => !date.isBefore(version.effectiveFrom))
		.toSorted((a, b) => b.effectiveFrom.compareTo(a.effectiveFrom))
		.at(0);
}
