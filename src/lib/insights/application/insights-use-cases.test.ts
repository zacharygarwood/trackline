import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { StubInsightsQueries } from '../../../../tests/fakes/stub-insights-queries.ts';
import { anExerciseId } from '../../../../tests/builders/training.builder.ts';
import { GetActivity } from './get-activity.ts';
import { GetExerciseProgress } from './get-exercise-progress.ts';
import { GetTrends } from './get-trends.ts';
import { ListTrackedExercises } from './list-tracked-exercises.ts';
import { StatsRange } from './stats-range.constants.ts';
import { rangeStart } from './stats-range.ts';

const clock = new FixedClock(0, '2026-10-28');

describe('rangeStart', () => {
	it.each([
		[StatsRange.fourWeeks, '2026-10-01'],
		[StatsRange.threeMonths, '2026-07-30'],
		[StatsRange.oneYear, '2025-10-29']
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
			range: StatsRange.fourWeeks
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

describe('GetExerciseProgress', () => {
	it('reads one exercise from the start of the range', async () => {
		const queries = new StubInsightsQueries();
		const exercise = anExerciseId();

		const sessions = await new GetExerciseProgress(queries, clock).execute({
			exercise,
			range: StatsRange.oneYear
		});

		expect(sessions).toBe(queries.sessions);
		expect(queries.calls).toEqual([`exerciseSessions ${exercise} 2025-10-29`]);
	});
});

describe('ListTrackedExercises', () => {
	it('lists exercises with history', async () => {
		const queries = new StubInsightsQueries();

		expect(await new ListTrackedExercises(queries).execute()).toBe(queries.exercises);
	});
});

describe('GetActivity', () => {
	it('reads 52 weeks of activity and the streak as of today', async () => {
		const queries = new StubInsightsQueries();

		const activity = await new GetActivity(queries, clock).execute();

		expect(activity).toEqual({ days: queries.activity, streak: queries.streak });
		expect(queries.calls).toEqual(['activityDays 2025-10-30', 'trainingStreak 2026-10-28']);
	});
});
