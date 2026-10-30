import { messages } from '../../i18n/messages.en.ts';
import type { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Distance } from '../../shared/distance.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { Mass } from '../../shared/mass.ts';
import { formatClock } from '../../ui/format.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { gradesOf, tracks } from '../domain/tracking.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import type { Workout } from '../domain/workout.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';

/** The units weights and distances are shown in. */
export interface TrainingUnits {
	readonly mass: MassUnit;
	readonly distance: DistanceUnit;
}

const MS_PER_SECOND = 1000;
const HALF_KILOGRAM_STEPS = 2;
const upToTwoDecimals = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const oneDecimal = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

/**
 * A lifted weight's number: kilograms to the nearest half, pounds to the nearest whole.
 *
 * @param mass - The weight.
 * @param unit - The unit to show it in.
 */
export function liftNumber(mass: Mass, unit: MassUnit): number {
	const amount = mass.toUnit(unit);
	return unit === MassUnit.kg
		? Math.round(amount * HALF_KILOGRAM_STEPS) / HALF_KILOGRAM_STEPS
		: Math.round(amount);
}

/**
 * A distance's number to one decimal, for example "3.4".
 *
 * @param distance - The distance.
 * @param unit - The unit to show it in.
 */
export function distanceText(distance: Distance, unit: DistanceUnit): string {
	return oneDecimal.format(distance.toUnit(unit));
}

/**
 * A plain number without trailing zeros, for example "2.5" or "12".
 *
 * @param amount - The number.
 */
export function plainNumber(amount: number): string {
	return upToTwoDecimals.format(amount);
}

/**
 * The grade at a position on an exercise's scale.
 *
 * @param exercise - A graded exercise.
 * @param grade - The position, 0 for the easiest.
 */
export function gradeLabel(exercise: Exercise, grade: number): string {
	const grades = exercise.tracking.grades;
	return grades === undefined ? '' : (gradesOf(grades).at(grade) ?? '');
}

/**
 * What a count is of, in lower case, for example "laps".
 *
 * @param exercise - The exercise.
 */
export function countLabel(exercise: Exercise): string {
	return (exercise.tracking.countLabel ?? messages.exercise.defaultCountLabel).toLowerCase();
}

function liftText(set: WorkoutSet, units: TrainingUnits, compact: boolean): string | undefined {
	const { weight, reps } = set;
	if (weight !== undefined && reps !== undefined) {
		const amount = String(liftNumber(weight, units.mass));
		return compact
			? messages.workout.compactWeightTimesReps(amount, reps)
			: messages.workout.weightTimesReps(amount, reps);
	}
	if (weight !== undefined) {
		return messages.workout.withUnit(String(liftNumber(weight, units.mass)), units.mass);
	}
	if (reps === undefined) return undefined;
	return compact ? String(reps) : messages.workout.repsText(reps);
}

/**
 * A logged set in words, for example "135 × 8", "V5", or "3.4 mi, 28:12".
 *
 * @param set - The set.
 * @param exercise - Its exercise, for the grade scale and count label.
 * @param options - How to show it.
 * @param options.units - The units to show it in.
 * @param options.compact - Only the first part, short, for the set boxes.
 */
export function setText(
	set: WorkoutSet,
	exercise: Exercise,
	{ units, compact = false }: { readonly units: TrainingUnits; readonly compact?: boolean }
): string {
	const parts = [
		liftText(set, units, compact),
		set.grade === undefined ? undefined : gradeLabel(exercise, set.grade),
		set.distance === undefined
			? undefined
			: messages.workout.withUnit(distanceText(set.distance, units.distance), units.distance),
		set.seconds === undefined ? undefined : formatClock(set.seconds),
		set.count === undefined
			? undefined
			: messages.workout.withUnit(plainNumber(set.count), countLabel(exercise))
	].filter((part) => part !== undefined);
	return compact ? (parts.at(0) ?? '') : parts.join(messages.workout.partsSeparator);
}

/** Orders sets by weight, then reps; positive when `a` is the better set. */
function compareSets(a: WorkoutSet, b: WorkoutSet): number {
	const byWeight = (a.weight?.kilograms ?? 0) - (b.weight?.kilograms ?? 0);
	return byWeight === 0 ? (a.reps ?? 0) - (b.reps ?? 0) : byWeight;
}

function topSet(sets: readonly WorkoutSet[]): WorkoutSet | undefined {
	return sets.reduce<WorkoutSet | undefined>(
		(best, set) => (best === undefined || compareSets(set, best) > 0 ? set : best),
		undefined
	);
}

const metersAsDistance = (meters: number): Distance => {
	const distance = Distance.fromMeters(meters);
	if (!distance.ok) throw new Error('A sum of distances is never negative');
	return distance.value;
};

const total = (sets: readonly WorkoutSet[], measure: (set: WorkoutSet) => number | undefined) =>
	sets.reduce((sum, set) => sum + (measure(set) ?? 0), 0);

function liftSummary(sets: readonly WorkoutSet[], exercise: Exercise, units: TrainingUnits) {
	const top = topSet(sets);
	const weight = top?.weight === undefined ? '0' : String(liftNumber(top.weight, units.mass));
	return tracks(exercise.tracking, TrackedField.reps)
		? messages.workout.setsAt({ sets: sets.length, reps: top?.reps ?? 0, weight, unit: units.mass })
		: messages.workout.setsTop(sets.length, weight, units.mass);
}

function totalsSummary(sets: readonly WorkoutSet[], exercise: Exercise, units: TrainingUnits) {
	const has = (field: TrackedField) => tracks(exercise.tracking, field);
	const meters = total(sets, (set) => set.distance?.meters);
	const parts = [
		has(TrackedField.distance)
			? messages.workout.withUnit(
					distanceText(metersAsDistance(meters), units.distance),
					units.distance
				)
			: undefined,
		has(TrackedField.time) ? formatClock(total(sets, (set) => set.seconds)) : undefined,
		has(TrackedField.count)
			? messages.workout.withUnit(
					plainNumber(total(sets, (set) => set.count)),
					countLabel(exercise)
				)
			: undefined,
		has(TrackedField.reps) ? messages.workout.repsText(total(sets, (set) => set.reps)) : undefined
	];
	return parts.filter((part) => part !== undefined).join(messages.workout.partsSeparator);
}

/**
 * One exercise's sets in a workout, summed up: "3 × 8 at 135 lb", "Top V5, 4 logged", or "3.4 mi, 28:12".
 *
 * @param sets - The logged sets.
 * @param exercise - The exercise.
 * @param units - The units to show it in.
 */
export function exerciseSummary(
	sets: readonly WorkoutSet[],
	exercise: Exercise,
	units: TrainingUnits
): string {
	if (sets.length === 0) return '';
	if (tracks(exercise.tracking, TrackedField.weight)) return liftSummary(sets, exercise, units);
	if (tracks(exercise.tracking, TrackedField.grade)) {
		const hardest = Math.max(...sets.map((set) => set.grade ?? 0));
		return messages.workout.topGrade(gradeLabel(exercise, hardest), sets.length);
	}
	return totalsSummary(sets, exercise, units);
}

/**
 * The name a workout goes by: its template's, or else its first exercise's.
 *
 * @param workout - The workout.
 * @param templates - The saved workouts.
 * @param exerciseName - Looks up an exercise's name.
 */
export function workoutName(
	workout: Workout,
	templates: readonly WorkoutTemplate[],
	exerciseName: (id: ExerciseId) => string
): string {
	const template = templates.find((known) => known.id === workout.sourceTemplateId);
	if (template !== undefined) return template.name;
	const firstExercise = workout.exercises.at(0);
	return firstExercise === undefined
		? messages.navigation.workout
		: exerciseName(firstExercise.exerciseId);
}

/**
 * How long a workout has run, as a clock.
 *
 * @param startedAt - When it started, in epoch milliseconds.
 * @param now - The current time, in epoch milliseconds.
 */
export function elapsedClock(startedAt: number, now: number): string {
	return formatClock((now - startedAt) / MS_PER_SECOND);
}

/** Which tracked field an exercise's Stats card charts, most telling first. */
const PRIMARY_ORDER = [
	TrackedField.grade,
	TrackedField.weight,
	TrackedField.distance,
	TrackedField.time,
	TrackedField.count,
	TrackedField.reps
] as const;

/**
 * The field an exercise is charted by on Stats: grade, then weight, distance, time, count, and reps.
 *
 * @param exercise - The exercise.
 */
export function primaryField(exercise: Exercise): TrackedField {
	return PRIMARY_ORDER.find((field) => tracks(exercise.tracking, field)) ?? TrackedField.reps;
}

/**
 * An exercise's grade names, easiest first, or none.
 *
 * @param exercise - The exercise.
 */
export function gradeNames(exercise: Exercise): readonly string[] {
	return exercise.tracking.grades === undefined ? [] : gradesOf(exercise.tracking.grades);
}
