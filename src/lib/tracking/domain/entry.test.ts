import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import {
	aField,
	aKey,
	aNumberField,
	aTracker,
	aWorkoutTracker
} from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { createEntry, type EntryDraft } from './entry.ts';
import { numberOf, type FieldKey, type FieldValue } from './field.ts';
import { createSubject } from './subject.ts';
import { daysAWeek } from './goal-parts.ts';
import { EntryProblem, FieldType, TrackerKind } from './tracking.constants.ts';

const glasses = (amount: number): [FieldKey, FieldValue] => [
	aKey('amount'),
	{ type: FieldType.number, amount }
];

function aDraft(overrides: Partial<EntryDraft> = {}): EntryDraft {
	return {
		id: anId<'Entry'>(),
		date: expectOk(LocalDate.parse('2026-10-29')),
		loggedAt: 1000,
		sessionId: undefined,
		values: new Map([glasses(2)]),
		...overrides
	};
}

const water = aTracker({
	fields: [aNumberField({ required: true }), aField({ type: FieldType.note, key: 'note' })]
});
const workouts = aWorkoutTracker();
const plank = expectOk(
	createSubject(workouts, {
		id: anId<'Subject'>(),
		name: 'Plank',
		fieldKeys: [aKey('time')],
		defaults: new Map()
	})
);
const set = (key: string, value: FieldValue) =>
	aDraft({ sessionId: anId<'Session'>(), values: new Map([[aKey(key), value]]) });

describe('createEntry', () => {
	it('logs checked values to the tracker', () => {
		const note: [FieldKey, FieldValue] = [
			aKey('note'),
			{ type: FieldType.note, text: ' Hot day ' }
		];
		const entry = expectOk(createEntry(water, aDraft({ values: new Map([glasses(2), note]) })));

		expect(entry.trackerId).toBe(water.id);
		expect(entry.subjectId).toBeUndefined();
		expect(entry.values.get(aKey('note'))).toEqual({ type: FieldType.note, text: 'Hot day' });
	});

	it.each([
		[aDraft({ values: new Map() }), EntryProblem.empty],
		[
			aDraft({ values: new Map([glasses(2), [aKey('other'), { type: FieldType.check }]]) }),
			EntryProblem.unknownField
		],
		[
			aDraft({ values: new Map([[aKey('amount'), { type: FieldType.check }]]) }),
			EntryProblem.wrongType
		],
		[aDraft({ values: new Map([glasses(-1)]) }), EntryProblem.outOfRange],
		[
			aDraft({ values: new Map([[aKey('note'), { type: FieldType.note, text: 'Hi' }]]) }),
			EntryProblem.missingRequired
		],
		[aDraft({ sessionId: anId<'Session'>() }), EntryProblem.session]
	])('rejects %o', (draft, problem) => {
		expect(expectErr(createEntry(water, draft)).problem).toBe(problem);
	});

	it('names the field at fault', () => {
		const draft = aDraft({ values: new Map([glasses(-1)]) });

		expect(expectErr(createEntry(water, draft)).field).toBe('amount');
	});

	it('logs a set of an exercise to a session, using only the fields the exercise tracks', () => {
		const held = expectOk(
			createEntry(workouts, set('time', { type: FieldType.duration, seconds: 60 }), plank)
		);

		expect(held.subjectId).toBe(plank.id);
		expect(
			expectErr(createEntry(workouts, set('reps', { type: FieldType.number, amount: 8 }), plank))
				.problem
		).toBe(EntryProblem.unknownField);
	});

	it('needs an exercise and a session for a workout', () => {
		const time = { type: FieldType.duration, seconds: 60 } as const;

		expect(expectErr(createEntry(workouts, set('time', time))).problem).toBe(EntryProblem.subject);
		expect(
			expectErr(createEntry(workouts, aDraft({ values: new Map([[aKey('time'), time]]) }), plank))
				.problem
		).toBe(EntryProblem.session);
	});

	it('refuses a subject from another tracker, or for a tracker without a library', () => {
		const otherWorkouts = aTracker({ ...workouts, id: anId<'Tracker'>() });
		const time = { type: FieldType.duration, seconds: 60 } as const;

		expect(expectErr(createEntry(otherWorkouts, set('time', time), plank)).problem).toBe(
			EntryProblem.subject
		);
		expect(expectErr(createEntry(water, aDraft(), plank)).problem).toBe(EntryProblem.subject);
	});

	it('takes food with or without a food from the library', () => {
		const food = aTracker({ kind: TrackerKind.food, goal: daysAWeek(1) });

		expect(createEntry(food, aDraft()).ok).toBe(true);
	});
});

describe('numberOf', () => {
	it.each([
		[{ type: FieldType.number, amount: 2 }, 2],
		[{ type: FieldType.duration, seconds: 90 }, 90],
		[{ type: FieldType.rating, stars: 4 }, 4],
		[{ type: FieldType.check }, undefined],
		[undefined, undefined]
	] satisfies [FieldValue | undefined, number | undefined][])(
		'counts %o as %s',
		(value, expected) => {
			expect(numberOf(value)).toBe(expected);
		}
	);
});
