import { messages } from '../../i18n/messages.en.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';

const upToOneDecimal = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

/**
 * A set from last session as the set table shows it, weight then reps, for example "60 × 8".
 *
 * @param set - The set.
 * @param unit - The unit to show the weight in; zero is bodyweight.
 */
export function formatPrevious(set: WorkoutSet, unit: MassUnit): string {
	return messages.training.previous(upToOneDecimal.format(set.weight.toUnit(unit)), set.reps);
}
