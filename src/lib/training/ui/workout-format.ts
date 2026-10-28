import { messages } from '../../i18n/messages.en.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { formatMass } from '../../ui/format.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';

/**
 * One set in words, for example "8 × 60.0 kg" or "12 × bodyweight".
 *
 * @param set - The set.
 * @param unit - The unit to show weights in.
 */
export function describeSet(set: WorkoutSet, unit: MassUnit): string {
	const weight =
		set.weight.kilograms === 0 ? messages.training.bodyweight : formatMass(set.weight, unit);
	return messages.training.setSummary(set.reps, weight);
}

/**
 * The last-session hint shown under an exercise.
 *
 * @param sets - The sets from last session; empty for a new exercise.
 * @param unit - The unit to show weights in.
 */
export function lastTimeHint(sets: readonly WorkoutSet[], unit: MassUnit): string {
	if (sets.length === 0) return messages.training.firstTime;
	return messages.training.lastTime(sets.map((set) => describeSet(set, unit)).join(', '));
}
