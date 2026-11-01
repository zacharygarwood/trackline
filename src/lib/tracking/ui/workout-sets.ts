import { last } from '../../shared/collections.ts';
import type { Entry } from '../domain/entry.ts';
import type { Field, FieldKey, FieldValue } from '../domain/field.ts';
import type { SessionId, SubjectId } from '../domain/ids.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { Dimension, FieldType } from '../domain/tracking.constants.ts';

const FIRST_REPS = 10;
const FIRST_SECONDS = 60;
const FIRST_METRES = 1000;

/** One exercise in a workout and its sets, oldest first. */
export interface ExerciseSets {
	readonly subjectId: SubjectId;
	readonly sets: readonly Entry[];
}

/**
 * A workout's sets grouped by exercise, in the order the exercises were started.
 *
 * @param entries - The workout's sets, in any order.
 */
export function groupSets(entries: readonly Entry[]): readonly ExerciseSets[] {
	const ordered = entries.toSorted((one, other) => one.loggedAt - other.loggedAt);
	const groups: { subjectId: SubjectId; sets: Entry[] }[] = [];
	for (const entry of ordered) {
		const { subjectId } = entry;
		if (subjectId === undefined) continue;
		const group = groups.find((candidate) => candidate.subjectId === subjectId);
		if (group === undefined) groups.push({ subjectId, sets: [entry] });
		else group.sets.push(entry);
	}
	return groups;
}

/**
 * An exercise's sets from the last other workout it was in, oldest first.
 *
 * @param entries - Every set of the tracker, in any order.
 * @param subjectId - The exercise.
 * @param current - The workout under way, whose sets don't count.
 */
export function lastTimeSets(
	entries: readonly Entry[],
	subjectId: SubjectId,
	current: SessionId | undefined
): readonly Entry[] {
	const earlier = entries
		.filter((entry) => entry.subjectId === subjectId && entry.sessionId !== current)
		.toSorted((one, other) => one.loggedAt - other.loggedAt);
	const lastSession = last(earlier)?.sessionId;
	return lastSession === undefined
		? []
		: earlier.filter((entry) => entry.sessionId === lastSession);
}

function firstValue(field: Field): FieldValue | undefined {
	if (field.type === FieldType.duration)
		return { type: FieldType.duration, seconds: FIRST_SECONDS };
	if (field.type !== FieldType.number) return undefined;
	if (field.dimension === Dimension.mass) return { type: FieldType.number, amount: 0 };
	const amount = field.dimension === Dimension.distance ? FIRST_METRES : FIRST_REPS;
	return { type: FieldType.number, amount };
}

/** The sets a new set follows: this workout's so far, and last time's. */
export interface SetsBefore {
	readonly current: readonly Entry[];
	readonly lastTime: readonly Entry[];
}

/**
 * What a new set of an exercise starts as: the set before it in this workout,
 * else its first set last time, else 10 reps, an empty bar, a minute, or a kilometre.
 *
 * @param tracker - The workout tracker.
 * @param exercise - The exercise.
 * @param before - The sets it would follow: this workout's, else last time's.
 */
export function nextSetValues(
	tracker: Tracker,
	exercise: Subject,
	before: SetsBefore
): ReadonlyMap<FieldKey, FieldValue> {
	const previous =
		last(before.current) ?? before.lastTime.at(before.current.length) ?? last(before.lastTime);
	if (previous !== undefined) return previous.values;
	const used = tracker.fields.filter(
		(field) => exercise.fieldKeys.length === 0 || exercise.fieldKeys.includes(field.key)
	);
	return new Map(
		used.flatMap((field) => {
			const value = exercise.defaults.get(field.key) ?? firstValue(field);
			return value === undefined ? [] : [[field.key, value] as const];
		})
	);
}
