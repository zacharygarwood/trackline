import { beforeEach, describe, expect, it } from 'vitest';
import { anExerciseId } from '../../../../tests/builders/training.builder.ts';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { InMemoryMassUnitPreference } from '../../../../tests/fakes/in-memory-mass-unit-preference.ts';
import { StubInsightsQueries } from '../../../../tests/fakes/stub-insights-queries.ts';
import { GetMassUnit } from '../../settings/application/get-mass-unit.ts';
import { GetWeekStart } from '../../settings/application/get-week-start.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { InMemoryWeekStartPreference } from '../../../../tests/fakes/in-memory-week-start-preference.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { GetActivity } from '../application/get-activity.ts';
import { GetExerciseProgress } from '../application/get-exercise-progress.ts';
import { GetTrends } from '../application/get-trends.ts';
import { ListTrackedExercises } from '../application/list-tracked-exercises.ts';
import { StatsRange } from '../application/stats-range.constants.ts';
import { StatsScreen } from './stats-screen.svelte.ts';

describe('StatsScreen', () => {
	const bench = { id: anExerciseId(), name: 'Bench press' };
	const squat = { id: anExerciseId(), name: 'Squat' };
	let queries: StubInsightsQueries;
	let units: InMemoryMassUnitPreference;
	let weeks: InMemoryWeekStartPreference;

	const screenFor = () => {
		const clock = new FixedClock(0, '2026-10-28');
		return new StatsScreen(
			{
				getActivity: new GetActivity(queries, clock),
				getTrends: new GetTrends({ weight: queries, nutrition: queries, clock }),
				listTrackedExercises: new ListTrackedExercises(queries),
				getExerciseProgress: new GetExerciseProgress(queries, clock),
				getMassUnit: new GetMassUnit(units),
				getWeekStart: new GetWeekStart(weeks)
			},
			clock
		);
	};

	beforeEach(() => {
		queries = new StubInsightsQueries();
		units = new InMemoryMassUnitPreference();
		weeks = new InMemoryWeekStartPreference();
	});

	it('loads activity, the last four weeks of trends, and the most recent exercise', async () => {
		queries.exercises = [bench, squat];
		queries.streak = { current: 3, longest: 9 };
		await units.write(MassUnit.lb);
		await weeks.write(WeekStart.sunday);
		const screen = screenFor();

		await screen.load();

		expect(screen.streak).toEqual({ current: 3, longest: 9 });
		expect(screen.unit).toBe(MassUnit.lb);
		expect(screen.weekStart).toBe(WeekStart.sunday);
		expect(screen.exercise).toEqual(bench);
		expect(queries.calls).toEqual(
			expect.arrayContaining([
				'weightTrend 2026-10-01',
				'nutritionDays 2026-10-01',
				`exerciseSessions ${bench.id} 2026-10-01`
			])
		);
	});

	it('reloads the charts for a new range', async () => {
		queries.exercises = [bench];
		const screen = screenFor();
		await screen.load();
		queries.calls.length = 0;

		await screen.changeRange(StatsRange.all);

		expect(screen.range).toBe(StatsRange.all);
		expect(queries.calls).toEqual([
			'weightTrend all',
			'nutritionDays all',
			`exerciseSessions ${bench.id} all`
		]);
	});

	it('shows another exercise when chosen', async () => {
		queries.exercises = [bench, squat];
		const screen = screenFor();
		await screen.load();
		queries.calls.length = 0;

		await screen.chooseExercise(squat.id);

		expect(screen.exercise).toEqual(squat);
		expect(queries.calls).toEqual([`exerciseSessions ${squat.id} 2026-10-01`]);
	});

	it('ignores an exercise that is not in the list', async () => {
		queries.exercises = [bench];
		const screen = screenFor();
		await screen.load();

		await screen.chooseExercise('unknown');

		expect(screen.exercise).toEqual(bench);
	});

	it('reads no sessions when no exercise has history', async () => {
		const screen = screenFor();

		await screen.load();

		expect(screen.exercise).toBeUndefined();
		expect(queries.calls.some((call) => call.startsWith('exerciseSessions'))).toBe(false);
	});
});
