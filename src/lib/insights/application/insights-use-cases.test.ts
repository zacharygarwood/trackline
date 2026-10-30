import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { StubInsightsQueries } from '../../../../tests/fakes/stub-insights-queries.ts';
import { GetExerciseHistory } from './get-exercise-history.ts';
import { GetTrends } from './get-trends.ts';
import { GetWorkoutDays } from './get-workout-days.ts';
import { StatsRange } from './stats-range.constants.ts';
import { rangeStart } from './stats-range.ts';

const clock = new FixedClock(0, '2026-10-28');

describe('rangeStart', () => {
	it.each([
		[StatsRange.oneMonth, '2026-10-01'],
		[StatsRange.threeMonths, '2026-07-30'],
		[StatsRange.sixMonths, '2026-04-30'],
		[StatsRange.oneYear, '2025-10-30']
	])('counts %s back from today, including today', (range, start) => {
		expect(rangeStart(range, clock.today())?.toString()).toBe(start);
	});

	it('has no start for all time', () => {
		expect(rangeStart(StatsRange.all, clock.today())).toBeUndefined();
	});
});

describe('GetTrends', () => {
	it('reads weight and nutrition from the start of the range', async () => {
		const queries = new StubInsightsQueries();

		await new GetTrends({ weight: queries, nutrition: queries, clock }).execute({
			range: StatsRange.oneMonth
		});

		expect(queries.calls).toEqual(['weightTrend 2026-10-01', 'nutritionDays 2026-10-01']);
	});

	it('returns both read models', async () => {
		const queries = new StubInsightsQueries();

		const trends = await new GetTrends({ weight: queries, nutrition: queries, clock }).execute({
			range: StatsRange.all
		});

		expect(trends).toEqual({ weight: queries.weight, nutrition: queries.nutrition });
		expect(queries.calls).toEqual(['weightTrend all', 'nutritionDays all']);
	});
});

describe('GetExerciseHistory', () => {
	it('reads every exercise from the start of the range', async () => {
		const queries = new StubInsightsQueries();

		const days = await new GetExerciseHistory(queries, clock).execute({
			range: StatsRange.oneYear
		});

		expect(days).toBe(queries.exercises);
		expect(queries.calls).toEqual(['exerciseDays 2025-10-30']);
	});
});

describe('GetWorkoutDays', () => {
	it('reads 104 weeks of workout days', async () => {
		const queries = new StubInsightsQueries();

		expect(await new GetWorkoutDays(queries, clock).execute()).toBe(queries.workouts);
		expect(queries.calls).toEqual(['workoutDays 2024-10-31']);
	});
});
