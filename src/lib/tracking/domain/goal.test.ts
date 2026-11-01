import { describe, expect, it } from 'vitest';
import {
	aField,
	aKey,
	aNumberField,
	anEntry,
	aSession
} from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { createField, type FieldDraft } from './field.ts';
import { checkGoal, InvalidGoal, periodStart, progressOf, type Goal } from './goal.ts';
import {
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period,
	TrackerKind
} from './tracking.constants.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const fields = (...drafts: FieldDraft[]) => drafts.map((draft) => expectOk(createField(draft)));
const today = date('2026-10-29');
const glasses = aKey('amount');
const calendar = { today, weekStart: WeekStart.monday };

const water: Goal = {
	type: GoalType.period,
	measure: Measure.total,
	field: glasses,
	target: 8,
	direction: Direction.atLeast,
	period: Period.day
};

describe('periodStart', () => {
	it.each([
		[Period.day, '2026-10-29'],
		[Period.week, '2026-10-26'],
		[Period.month, '2026-10-01']
	])('starts a %s on %s', (period, start) => {
		expect(periodStart(period, calendar).toString()).toBe(start);
	});
});

describe('checkGoal', () => {
	const log = fields(aNumberField(), aField({ type: FieldType.note, key: 'note' }));

	it('accepts a total of a number field', () => {
		expect(expectOk(checkGoal(water, log, TrackerKind.log))).toEqual(water);
	});

	it.each([
		[{ ...water, target: 0 }],
		[{ ...water, target: Number.POSITIVE_INFINITY }],
		[{ ...water, field: aKey('missing') }],
		[{ ...water, field: aKey('note') }],
		[{ ...water, measure: Measure.sessions, field: undefined }],
		[{ type: GoalType.target, field: aKey('note'), target: 70 }]
	] satisfies [Goal][])('rejects %o', (goal) => {
		expect(expectErr(checkGoal(goal, log, TrackerKind.log))).toBeInstanceOf(InvalidGoal);
	});

	it('limits a rating average to five stars', () => {
		const mood = fields(aField({ type: FieldType.rating, key: 'mood' }));
		const goal: Goal = { ...water, measure: Measure.average, field: aKey('mood'), target: 6 };

		expect(checkGoal(goal, mood, TrackerKind.log).ok).toBe(false);
		expect(checkGoal({ ...goal, target: 4 }, mood, TrackerKind.log).ok).toBe(true);
	});

	it('counts sessions only for trackers that have them', () => {
		const goal: Goal = { ...water, measure: Measure.sessions, field: undefined, target: 3 };

		expect(checkGoal(goal, log, TrackerKind.workout).ok).toBe(true);
		expect(checkGoal(goal, log, TrackerKind.log).ok).toBe(false);
	});
});

describe('progressOf', () => {
	const history = (...entries: ReturnType<typeof anEntry>[]) => ({ entries, sessions: [] });
	const amount = (value: number, on = '2026-10-29') =>
		anEntry({ date: on, values: [[glasses, { type: FieldType.number, amount: value }]] });

	it('totals today and fills toward the goal', () => {
		const progress = progressOf(
			water,
			history(amount(3), amount(2), amount(9, '2026-10-28')),
			calendar
		);

		expect(progress).toEqual({ value: 5, fill: 5 / 8, met: false });
	});

	it('is met at or under a limit, and full once the limit is reached', () => {
		const coffee: Goal = { ...water, direction: Direction.atMost, target: 3 };

		expect(progressOf(coffee, history(amount(2)), calendar).met).toBe(true);
		expect(progressOf(coffee, history(amount(4)), calendar)).toEqual({
			value: 4,
			fill: 1,
			met: false
		});
	});

	it('averages, counts entries, and counts days in the period', () => {
		const week = { ...water, period: Period.week };
		const entries = history(
			amount(2, '2026-10-26'),
			amount(4, '2026-10-29'),
			amount(6, '2026-10-29')
		);

		const measure = (goal: Goal) => progressOf(goal, entries, calendar).value;

		expect(measure({ ...week, measure: Measure.average })).toBe(4);
		expect(measure({ ...week, measure: Measure.entries, field: undefined })).toBe(3);
		expect(measure({ ...week, measure: Measure.days, field: undefined })).toBe(2);
	});

	it('counts finished sessions this week', () => {
		const workouts: Goal = {
			...water,
			measure: Measure.sessions,
			field: undefined,
			target: 3,
			period: Period.week
		};
		const sessions = [
			aSession({ date: '2026-10-27' }),
			aSession({ date: '2026-10-28', finished: false }),
			aSession({ date: '2026-10-20' })
		];

		expect(progressOf(workouts, { entries: [], sessions }, calendar).value).toBe(1);
	});

	describe('a target goal', () => {
		const weight = aKey('weight');
		const goal: Goal = { type: GoalType.target, field: weight, target: 78 };
		const weighIn = (kilograms: number, on: string) =>
			anEntry({ date: on, values: [[weight, { type: FieldType.number, amount: kilograms }]] });

		it('fills from the first value toward the target, by the latest value', () => {
			const progress = progressOf(
				goal,
				history(weighIn(80, '2026-10-29'), weighIn(82, '2026-10-01'), weighIn(81, '2026-10-15')),
				calendar
			);

			expect(progress).toEqual({ value: 80, fill: 0.5, met: false });
		});

		it('is met once the latest value passes the target in either direction', () => {
			const gaining: Goal = { ...goal, target: 60 };
			const entries = history(weighIn(55, '2026-10-01'), weighIn(61, '2026-10-29'));

			expect(progressOf(gaining, entries, calendar)).toEqual({
				value: 61,
				fill: 1,
				met: true
			});
		});

		it('is empty with no values', () => {
			expect(progressOf(goal, history(), calendar)).toEqual({
				value: undefined,
				fill: 0,
				met: false
			});
		});

		it('is no longer met after moving away from a target the first value was already at', () => {
			const entries = history(weighIn(78, '2026-10-01'), weighIn(80, '2026-10-29'));

			expect(progressOf(goal, entries, calendar)).toEqual({ value: 80, fill: 0, met: false });
		});

		it('is full when the only value is the target', () => {
			expect(progressOf(goal, history(weighIn(78, '2026-10-29')), calendar).met).toBe(true);
		});
	});
});
