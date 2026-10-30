import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { StubInsightsQueries } from '../../../../tests/fakes/stub-insights-queries.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import { GetExerciseHistory } from '../application/get-exercise-history.ts';
import { GetTrends } from '../application/get-trends.ts';
import { GetWorkoutDays } from '../application/get-workout-days.ts';
import { StatsRange } from '../application/stats-range.constants.ts';
import { StatsScreen } from './stats-screen.svelte.ts';

const clock = new FixedClock(0, '2026-10-29');
const date = (text: string) => expectOk(LocalDate.parse(text));

function screen() {
	const queries = new StubInsightsQueries();
	const stats = new StatsScreen(
		{
			getTrends: new GetTrends({ weight: queries, nutrition: queries, clock }),
			getWorkoutDays: new GetWorkoutDays(queries, clock),
			getExerciseHistory: new GetExerciseHistory(queries, clock)
		},
		clock
	);
	return { queries, stats };
}

describe('StatsScreen', () => {
	it('starts on three months and reloads when the range changes', async () => {
		const { queries, stats } = screen();
		await stats.load();
		await stats.choose(StatsRange.oneMonth);

		expect(stats.weeks).toBe(4);
		expect(queries.calls).toContain('exerciseDays 2026-10-02');
	});

	it('counts workout days in the range and reads their minutes', async () => {
		const { queries, stats } = screen();
		queries.workouts = [
			{ date: date('2026-01-05'), minutes: 40 },
			{ date: date('2026-10-28'), minutes: 55 }
		];
		await stats.choose(StatsRange.oneMonth);

		expect(stats.workoutDayCount).toBe(1);
		expect(stats.minutesOf(date('2026-10-28'))).toBe(55);
		expect(stats.minutesOf(date('2026-10-27'))).toBe(0);
	});

	it('charts weight in the unit and calories against the goal', async () => {
		const { queries, stats } = screen();
		const kg = (amount: number) => expectOk(Mass.fromKg(amount));
		queries.weight = [
			{ date: date('2026-10-20'), weight: kg(80), average: kg(80) },
			{ date: date('2026-10-28'), weight: kg(79), average: kg(79.5) }
		];
		queries.nutrition = [
			{
				date: date('2026-10-28'),
				calories: 2000,
				protein: 100,
				calorieGoal: 2200,
				proteinGoal: 150
			}
		];
		await stats.choose(StatsRange.oneMonth);

		expect(stats.weights(MassUnit.kg)).toEqual([80, 79]);
		expect(stats.calorieBars).toEqual([0, 0, 0, 2000]);
		expect([stats.calorieAverage, stats.calorieGoal, stats.calorieScale]).toEqual([
			2000, 2200, 2640
		]);
	});
});
