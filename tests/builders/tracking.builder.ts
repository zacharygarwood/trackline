import { LocalDate } from '../../src/lib/shared/local-date.ts';
import type { Entry } from '../../src/lib/tracking/domain/entry.ts';
import {
	fieldKey,
	type FieldValue,
	type ChoiceField,
	type FieldDraft,
	type FieldKey,
	type NumberField,
	type SimpleField
} from '../../src/lib/tracking/domain/field.ts';
import type { TrackerId } from '../../src/lib/tracking/domain/ids.ts';
import type { Session } from '../../src/lib/tracking/domain/session.ts';
import {
	createTracker,
	type Tracker,
	type TrackerDraft
} from '../../src/lib/tracking/domain/tracker.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period,
	SessionState,
	TrackerIcon,
	TrackerKind
} from '../../src/lib/tracking/domain/tracking.constants.ts';
import { expectOk } from '../support/result.ts';
import { anId } from './id.builder.ts';

/** A field key for tests, such as `aKey('reps')`. */
export const aKey = (text: string): FieldKey => fieldKey(text);

/** Fields shared by every kind of test field. */
interface BaseOverrides {
	readonly key?: string;
	readonly label?: string;
	readonly required?: boolean;
}

function base(overrides: BaseOverrides, key: string, label: string) {
	return {
		key: overrides.key ?? key,
		label: overrides.label ?? label,
		required: overrides.required ?? false
	};
}

/**
 * A field of a type that needs nothing beyond its type, a duration by default.
 *
 * @param overrides - Fields to replace.
 */
export function aField(
	overrides: BaseOverrides & { readonly type?: SimpleField['type'] } = {}
): FieldDraft {
	return { type: overrides.type ?? FieldType.duration, ...base(overrides, 'time', 'Time') };
}

/**
 * A number field, a plain count of glasses by default.
 *
 * @param overrides - Fields to replace.
 */
export function aNumberField(
	overrides: BaseOverrides & { readonly dimension?: Dimension; readonly unit?: string } = {}
): Omit<NumberField, 'key'> & { readonly key: string } {
	return {
		type: FieldType.number,
		dimension: overrides.dimension ?? Dimension.plain,
		unit: overrides.unit ?? 'glasses',
		...base(overrides, 'amount', 'Amount')
	};
}

/**
 * A choice field of moods by default.
 *
 * @param overrides - Fields to replace.
 */
export function aChoiceField(
	overrides: BaseOverrides & { readonly options?: readonly string[] } = {}
): Omit<ChoiceField, 'key'> & { readonly key: string } {
	return {
		type: FieldType.choice,
		options: overrides.options ?? ['Calm', 'Busy', 'Tired'],
		...base(overrides, 'feeling', 'Feeling')
	};
}

const trackerId = anId<'Tracker'>();

/** The tracker id test entries and sessions belong to unless told otherwise. */
export const aTrackerId = (): TrackerId => trackerId;

/**
 * A logged entry for tests, built without checks.
 *
 * @param overrides - The day as `YYYY-MM-DD`, values as key and value pairs, and any other fields to replace.
 */
export function anEntry(
	overrides: Partial<Omit<Entry, 'date' | 'values'>> & {
		readonly date?: string;
		readonly values?: readonly (readonly [FieldKey, FieldValue])[];
	} = {}
): Entry {
	const { date, values, ...rest } = overrides;
	return {
		id: anId<'Entry'>(),
		trackerId,
		date: expectOk(LocalDate.parse(date ?? '2026-10-29')),
		loggedAt: 0,
		subjectId: undefined,
		sessionId: undefined,
		values: new Map(values ?? [[aKey('amount'), { type: FieldType.number, amount: 1 }]]),
		...rest
	};
}

/**
 * A session for tests, finished unless told otherwise.
 *
 * @param overrides - The day and whether it is finished.
 * @param overrides.date - The day as `YYYY-MM-DD`.
 * @param overrides.finished - False for a session still under way.
 */
export function aSession(
	overrides: { readonly date?: string; readonly finished?: boolean } = {}
): Session {
	const started = {
		state: SessionState.active,
		id: anId<'Session'>(),
		trackerId,
		date: expectOk(LocalDate.parse(overrides.date ?? '2026-10-29')),
		startedAt: 0
	} as const;
	return overrides.finished === false
		? started
		: { ...started, state: SessionState.finished, finishedAt: 0 };
}

/**
 * A water tracker draft for tests: one required count of glasses, 8 a day.
 *
 * @param overrides - Fields to replace.
 */
export function aTrackerDraft(overrides: Partial<TrackerDraft> = {}): TrackerDraft {
	return {
		id: trackerId,
		name: 'Water',
		icon: TrackerIcon.water,
		kind: TrackerKind.log,
		position: 0,
		fields: [aNumberField({ required: true })],
		goal: {
			type: GoalType.period,
			measure: Measure.total,
			field: aKey('amount'),
			target: 8,
			direction: Direction.atLeast,
			period: Period.day
		},
		...overrides
	};
}

/**
 * A checked tracker for tests, from {@link aTrackerDraft}.
 *
 * @param overrides - Fields to replace.
 */
export function aTracker(overrides: Partial<TrackerDraft> = {}): Tracker {
	return expectOk(createTracker(aTrackerDraft(overrides)));
}

/**
 * A workout tracker for tests: sets of reps and weight, or a time, grouped into sessions.
 */
export function aWorkoutTracker(): Tracker {
	return aTracker({
		name: 'Workouts',
		icon: TrackerIcon.dumbbell,
		kind: TrackerKind.workout,
		fields: [
			aNumberField({ key: 'reps', label: 'Reps', unit: 'reps' }),
			aNumberField({ key: 'weight', label: 'Weight', dimension: Dimension.mass }),
			aField({ key: 'time', label: 'Time' })
		],
		goal: {
			type: GoalType.period,
			measure: Measure.sessions,
			target: 3,
			direction: Direction.atLeast,
			period: Period.week
		}
	});
}
