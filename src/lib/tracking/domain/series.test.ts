import { describe, expect, it } from 'vitest';
import { aKey, anEntry } from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import type { Goal } from './goal.ts';
import { seriesOf, spansBack } from './series.ts';
import { Direction, FieldType, GoalType, Measure, Period } from './tracking.constants.ts';

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
	it('totals each of the last eight days for a daily goal', () => {
		const goal: Goal = {
			type: GoalType.period,
			measure: Measure.total,
			field: amount,
			target: 8,
			direction: Direction.atLeast,
			period: Period.day
		};
		const history = {
			entries: [logged('2026-10-29', 3), logged('2026-10-29', 2), logged('2026-10-27', 8)],
			sessions: []
		};

		expect(seriesOf(goal, history, calendar)).toEqual([0, 0, 0, 0, 0, 8, 0, 5]);
	});

	it('charts the latest value each week for a target goal, from the first value', () => {
		const goal: Goal = { type: GoalType.target, field: amount, target: 78 };
		const history = {
			entries: [logged('2026-10-28', 80), logged('2026-10-20', 81), logged('2026-10-21', 82)],
			sessions: []
		};

		expect(seriesOf(goal, history, calendar)).toEqual([82, 80]);
	});
});
