import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../tests/support/result.ts';
import { LocalDate } from '../shared/local-date.ts';
import { WeekStart } from '../shared/week-start.constants.ts';
import { heatLevel, layoutWorkoutHeatmap } from './workout-heatmap.ts';

const thursday = expectOk(LocalDate.parse('2026-10-29'));

describe('heatLevel', () => {
	it.each([
		[0, 0],
		[29, 1],
		[30, 2],
		[50, 3],
		[70, 4],
		[120, 4]
	])('shades %d minutes at level %d', (minutes, level) => {
		expect(heatLevel(minutes)).toBe(level);
	});
});

describe('layoutWorkoutHeatmap', () => {
	const layout = layoutWorkoutHeatmap({
		today: thursday,
		weeks: 3,
		rangeWeeks: 2,
		weekStart: WeekStart.sunday,
		minutesOf: (date) => (date.equals(thursday) ? 45 : 0)
	});

	it('fills whole weeks, marks today and the days still ahead, and dims weeks before the range', () => {
		expect(layout.cells).toHaveLength(21);
		expect(layout.cells.at(0)?.date.toString()).toBe('2026-10-11');
		const today = layout.cells.find((cell) => cell.today);
		expect(today).toMatchObject({ column: 2, row: 4, level: 2, inRange: true, future: false });
		expect(layout.cells.filter((cell) => cell.future)).toHaveLength(2);
		expect(layout.cells.at(0)?.inRange).toBe(false);
		expect(layout.cells.at(7)?.inRange).toBe(true);
	});

	it('labels the first column and new months at least three columns apart', () => {
		expect(layout.months.map((month) => [month.column, month.date.toString()])).toEqual([
			[0, '2026-10-11']
		]);

		const long = layoutWorkoutHeatmap({
			today: thursday,
			weeks: 10,
			rangeWeeks: 10,
			weekStart: WeekStart.sunday,
			minutesOf: () => 0
		});
		expect(long.months.map((month) => month.date.toString())).toEqual(['2026-09-01', '2026-10-01']);
	});
});
