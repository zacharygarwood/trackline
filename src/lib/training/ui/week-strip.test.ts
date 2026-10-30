import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import type { TrainingDay } from '../application/get-training-days.ts';
import { WeekDayState } from './week-strip.constants.ts';
import { weekStrip, workoutsIn } from './week-strip.ts';

const wednesday = expectOk(LocalDate.parse('2026-10-28'));

function day(
	back: number,
	done: Partial<Pick<TrainingDay, 'trained' | 'rested'>> = {}
): TrainingDay {
	return { date: wednesday.addDays(-back), trained: false, rested: false, ...done };
}

describe('weekStrip', () => {
	it('shows the calendar week with what happened on each past day', () => {
		const days = [day(0), day(1, { trained: true }), day(2, { rested: true }), day(3)];

		const strip = weekStrip({ today: wednesday, weekStart: WeekStart.monday, days });

		expect(strip.map((cell) => cell.date.toString())).toEqual([
			'2026-10-26',
			'2026-10-27',
			'2026-10-28',
			'2026-10-29',
			'2026-10-30',
			'2026-10-31',
			'2026-11-01'
		]);
		expect(strip.map((cell) => cell.state)).toEqual([
			WeekDayState.rested,
			WeekDayState.trained,
			WeekDayState.today,
			WeekDayState.upcoming,
			WeekDayState.upcoming,
			WeekDayState.upcoming,
			WeekDayState.upcoming
		]);
	});

	it('marks today done once there is a workout', () => {
		const strip = weekStrip({
			today: wednesday,
			weekStart: WeekStart.sunday,
			days: [day(0, { trained: true }), day(3)]
		});

		expect(strip.at(0)?.date.toString()).toBe('2026-10-25');
		expect(strip.at(0)?.state).toBe(WeekDayState.missed);
		expect(strip.at(3)?.state).toBe(WeekDayState.trained);
		expect(workoutsIn(strip)).toBe(1);
	});
});
