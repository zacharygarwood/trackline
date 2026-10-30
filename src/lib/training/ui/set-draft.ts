import { Distance } from '../../shared/distance.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { Exercise } from '../domain/exercise.ts';
import { DEFAULT_REPS } from '../domain/set-suggestion.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { tracks } from '../domain/tracking.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';
import { distanceText, liftNumber, plainNumber, type TrainingUnits } from './workout-format.ts';

/** The stepper values for an exercise's next set, as typed. */
export interface SetDraft {
	readonly weight: string;
	readonly reps: string;
	readonly distance: string;
	readonly count: string;
	/** Position on the exercise's grade scale. */
	readonly grade: number;
}

/** A draft field that has − and + steppers. */
export type SteppedField = 'weight' | 'reps' | 'distance' | 'count';

const KG_STEP = 2.5;
const LB_STEP = 5;
const DISTANCE_STEP = 0.1;
const DISTANCE_DECIMALS = 1;
const HUNDREDTHS = 100;
const ZERO_DISTANCE = '0.0';

/**
 * The draft a set starts from: the values of a suggested set, in the user's units.
 *
 * @param suggestion - The previous set this workout or last session, or a default.
 * @param units - The units to show it in.
 */
export function draftFrom(suggestion: WorkoutSet, units: TrainingUnits): SetDraft {
	return {
		weight: String(suggestion.weight === undefined ? 0 : liftNumber(suggestion.weight, units.mass)),
		reps: String(suggestion.reps ?? DEFAULT_REPS),
		distance:
			suggestion.distance === undefined
				? ZERO_DISTANCE
				: distanceText(suggestion.distance, units.distance),
		count: plainNumber(suggestion.count ?? 0),
		grade: suggestion.grade ?? 0
	};
}

/**
 * How much one tap of a stepper changes a field.
 *
 * @param field - The field.
 * @param unit - The weight unit.
 */
export function stepOf(field: SteppedField, unit: MassUnit): number {
	if (field === 'weight') return unit === MassUnit.kg ? KG_STEP : LB_STEP;
	return field === 'distance' ? DISTANCE_STEP : 1;
}

/**
 * Moves a field one step up or down, never below its minimum (one rep, otherwise zero).
 *
 * @param draft - The current values.
 * @param change - What to step.
 * @param change.field - The field.
 * @param change.direction - 1 for up, -1 for down.
 * @param change.unit - The weight unit, for the weight step.
 */
export function stepDraft(
	draft: SetDraft,
	change: { readonly field: SteppedField; readonly direction: number; readonly unit: MassUnit }
): SetDraft {
	const { field, direction, unit } = change;
	const minimum = field === 'reps' ? 1 : 0;
	const next = Math.max(
		minimum,
		(parseDecimal(draft[field]) ?? 0) + direction * stepOf(field, unit)
	);
	const text =
		field === 'distance'
			? next.toFixed(DISTANCE_DECIMALS)
			: plainNumber(Math.round(next * HUNDREDTHS) / HUNDREDTHS);
	return { ...draft, [field]: text };
}

const amount = (text: string) => Math.max(0, parseDecimal(text) ?? 0);

/**
 * What logging a draft records: only the fields the exercise tracks, plus the timed seconds.
 *
 * @param draft - The typed values.
 * @param context - What the set is of.
 * @param context.exercise - The exercise.
 * @param context.units - The units the draft is in.
 * @param context.seconds - The seconds timed, if the exercise tracks time.
 */
export function measuresFrom(
	draft: SetDraft,
	context: { readonly exercise: Exercise; readonly units: TrainingUnits; readonly seconds?: number }
): Omit<WorkoutSet, 'completed'> {
	const has = (field: TrackedField) => tracks(context.exercise.tracking, field);
	return {
		...physicalMeasures(draft, context.units, has),
		reps: has(TrackedField.reps) ? Math.max(1, Math.round(amount(draft.reps))) : undefined,
		grade: has(TrackedField.grade) ? draft.grade : undefined,
		seconds: has(TrackedField.time) ? context.seconds : undefined,
		count: has(TrackedField.count) ? amount(draft.count) : undefined
	};
}

function physicalMeasures(
	draft: SetDraft,
	units: TrainingUnits,
	has: (field: TrackedField) => boolean
): Pick<WorkoutSet, 'weight' | 'distance'> {
	const weight = Mass.of(amount(draft.weight), units.mass);
	const distance = Distance.of(amount(draft.distance), units.distance);
	return {
		weight: has(TrackedField.weight) && weight.ok ? weight.value : undefined,
		distance: has(TrackedField.distance) && distance.ok ? distance.value : undefined
	};
}
