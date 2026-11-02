import { describe, expect, it } from 'vitest';
import {
	aField,
	aKey,
	aNumberField,
	aTracker,
	aWorkoutTracker,
	anEntry
} from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { daysAWeek } from './goal-parts.ts';
import type { Goal } from './goal.ts';
import { seriesOf, spansBack, statOf, type Stat } from './series.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period,
	StatType
} from './tracking.constants.ts';

const calendar = {
	today: expectOk(LocalDate.parse('2026-10-29')),
	weekStart: WeekStart.monday
};
const amount = aKey('amount');
const logged = (on: string, value: number) =>
	anEntry({ date: on, values: [[amount, { type: FieldType.number, amount: value }]] });

describe('spansBack', () => {
	it('lists whole weeks before the current one, oldest first', () => {
		const spans = spansBack(Period.week, calendar, 2).map(
			(span) => `${span.start.toString()}..${span.end.toString()}`
		);

		expect(spans).toEqual(['2026-10-19..2026-10-25', '2026-10-26..2026-10-29']);
	});

	it('steps back through months of different lengths', () => {
		const starts = spansBack(Period.month, calendar, 3).map((span) => span.start.toString());

		expect(starts).toEqual(['2026-08-01', '2026-09-01', '2026-10-01']);
	});
});

describe('seriesOf', () => {
	it('totals each of the last eight days for a daily stat', () => {
		const stat: Stat = {
			type: StatType.counts,
			measure: Measure.total,
			field: amount,
			period: Period.day,
			goal: 8
		};
		const history = {
			entries: [logged('2026-10-29', 3), logged('2026-10-29', 2), logged('2026-10-27', 8)],
			sessions: []
		};

		expect(seriesOf(stat, history, calendar)).toEqual([0, 0, 0, 0, 0, 8, 0, 5]);
	});

	it('charts the latest value each week for a trend, from the first value', () => {
		const stat: Stat = { type: StatType.trend, field: amount, goal: 78 };
		const history = {
			entries: [logged('2026-10-28', 80), logged('2026-10-20', 81), logged('2026-10-21', 82)],
			sessions: []
		};

		expect(seriesOf(stat, history, calendar)).toEqual([82, 80]);
	});
});

describe('statOf', () => {
	const onceADay: Goal = { ...daysAWeek(1), period: Period.day };
	const weight = aNumberField({ key: 'amount', dimension: Dimension.mass });

	it('charts what a goal of a field counts, with the goal as a line', () => {
		const goal: Goal = {
			type: GoalType.period,
			measure: Measure.total,
			field: amount,
			target: 8,
			direction: Direction.atLeast,
			period: Period.day
		};

		expect(statOf(aTracker({ goal }))).toEqual({
			type: StatType.counts,
			measure: Measure.total,
			field: amount,
			period: Period.day,
			goal: 8
		});
		expect(
			statOf(aTracker({ fields: [weight], goal: { ...goal, type: GoalType.target } }))
		).toEqual({ type: StatType.trend, field: amount, goal: 8 });
	});

	it('charts a weight logged every day as its trend, not as days', () => {
		expect(statOf(aTracker({ fields: [weight], goal: onceADay }))).toEqual({
			type: StatType.trend,
			field: amount,
			goal: undefined
		});
	});

	it('charts a rating logged every day as its weekly average', () => {
		const mood = aField({ key: 'mood', type: FieldType.rating });

		expect(statOf(aTracker({ fields: [mood], goal: onceADay }))).toEqual({
			type: StatType.counts,
			measure: Measure.average,
			field: aKey('mood'),
			period: Period.week,
			goal: undefined
		});
	});

	it('charts a number logged on days as its total each period', () => {
		expect(statOf(aTracker({ goal: daysAWeek(5) }))).toMatchObject({
			measure: Measure.total,
			field: amount,
			period: Period.week,
			goal: undefined
		});
	});

	it('keeps counting workouts, which a field total would misread', () => {
		const tracker = aWorkoutTracker();

		expect(statOf(tracker)).toMatchObject({ measure: Measure.sessions, goal: tracker.goal.target });
	});
});
