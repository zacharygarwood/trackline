import { beforeEach, describe, expect, it } from 'vitest';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { StatsSeed } from '../../../../tests/support/stats-seed.ts';
import type { TestDatabase } from '../../../../tests/support/test-database.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { SqliteInsightsQueries } from './sqlite-insights-queries.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const dates = (list: readonly LocalDate[]) => list.map((day) => day.toString());

describe('SqliteInsightsQueries', () => {
	let database: TestDatabase;
	let seed: StatsSeed;
	let queries: SqliteInsightsQueries;

	beforeEach(async () => {
		database = await migratedDatabase();
		seed = new StatsSeed(database);
		queries = new SqliteInsightsQueries(database);
	});

	describe('weightTrend', () => {
		beforeEach(async () => {
			await seed.weighIn('2026-10-08', 84);
			await seed.weighIn('2026-10-01', 80);
			await seed.weighIn('2026-10-04', 82);
		});

		it('averages each weigh-in with the others in the seven days ending on it', async () => {
			const trend = await queries.weightTrend(undefined);

			expect(
				trend.map((point) => [
					point.date.toString(),
					point.weight.kilograms,
					point.average.kilograms
				])
			).toEqual([
				['2026-10-01', 80, 80],
				['2026-10-04', 82, 81],
				['2026-10-08', 84, 83]
			]);
		});

		it('starts at the range but still averages in earlier weigh-ins', async () => {
			const trend = await queries.weightTrend(date('2026-10-04'));

			expect(trend.map((point) => [point.date.toString(), point.average.kilograms])).toEqual([
				['2026-10-04', 81],
				['2026-10-08', 83]
			]);
		});
	});

	describe('nutritionDays', () => {
		beforeEach(async () => {
			await seed.goals('2026-10-01', 2000, 100);
			await seed.goals('2026-10-10', 2200, 150);
			await seed.eaten('2026-09-30', 500, 20);
			await seed.eaten('2026-10-05', 800, 40);
			await seed.eaten('2026-10-05', 700, 30);
			await seed.eaten('2026-10-12', 1000, 60);
		});

		it('totals each day and compares it with the goals in effect that day', async () => {
			const days = await queries.nutritionDays(undefined);

			expect(
				days.map((day) => [
					day.date.toString(),
					day.calories,
					day.protein,
					day.calorieGoal,
					day.proteinGoal
				])
			).toEqual([
				['2026-09-30', 500, 20, undefined, undefined],
				['2026-10-05', 1500, 70, 2000, 100],
				['2026-10-12', 1000, 60, 2200, 150]
			]);
		});

		it('leaves out days before the range', async () => {
			expect(
				dates((await queries.nutritionDays(date('2026-10-05'))).map((day) => day.date))
			).toEqual(['2026-10-05', '2026-10-12']);
		});
	});

	describe('exercise progress', () => {
		it('tracks only exercises with completed weighted sets in finished workouts, most recent first', async () => {
			const bench = await seed.exercise('Bench press');
			const squat = await seed.exercise('Squat');
			const pullUp = await seed.exercise('Pull-up');
			const deadlift = await seed.exercise('Deadlift');
			const row = await seed.exercise('Row');
			await seed.workout('2026-10-01', [[bench, [[5, 100]]]]);
			await seed.workout('2026-10-10', [
				[squat, [[5, 120]]],
				[pullUp, [[8, 0]]]
			]);
			await seed.workout('2026-10-20', [
				[bench, [[5, 102.5]]],
				[row, [[8, 60, false]]]
			]);
			await seed.workout('2026-10-21', [[deadlift, [[5, 140]]]], false);

			expect(await queries.trackedExercises()).toEqual([
				{ id: bench, name: 'Bench press' },
				{ id: squat, name: 'Squat' }
			]);
		});

		it('takes the heaviest completed set and the best Epley estimate of each day', async () => {
			const bench = await seed.exercise('Bench press');
			await seed.workout('2026-10-01', [
				[
					bench,
					[
						[5, 100],
						[8, 90],
						[3, 110, false]
					]
				]
			]);
			await seed.workout('2026-10-08', [[bench, [[1, 120]]]]);
			await seed.workout('2026-10-08', [[bench, [[10, 60]]]]);

			const sessions = await queries.exerciseSessions(bench, undefined);

			expect(
				sessions.map((session) => [
					session.date.toString(),
					session.heaviest.kilograms,
					Number(session.estimatedOneRepMax.kilograms.toFixed(2))
				])
			).toEqual([
				['2026-10-01', 100, 116.67],
				['2026-10-08', 120, 120]
			]);
		});

		it('leaves out days before the range', async () => {
			const bench = await seed.exercise('Bench press');
			await seed.workout('2026-10-01', [[bench, [[5, 100]]]]);
			await seed.workout('2026-10-08', [[bench, [[5, 105]]]]);

			const sessions = await queries.exerciseSessions(bench, date('2026-10-02'));

			expect(dates(sessions.map((session) => session.date))).toEqual(['2026-10-08']);
		});
	});

	describe('activityDays', () => {
		it('lists trained, rested, and food-logged days from a date', async () => {
			const bench = await seed.exercise('Bench press');
			await seed.workout('2026-09-30', [[bench, [[5, 100]]]]);
			await seed.workout('2026-10-02', [[bench, [[5, 100]]]]);
			await seed.workout('2026-10-02', [[bench, [[5, 100]]]]);
			await seed.workout('2026-10-04', [[bench, [[5, 100]]]], false);
			await seed.restDay('2026-10-03');
			await seed.eaten('2026-10-02', 500, 20);
			await seed.eaten('2026-10-02', 500, 20);
			await seed.eaten('2026-10-05', 500, 20);

			const activity = await queries.activityDays(date('2026-10-01'));

			expect(dates(activity.trained)).toEqual(['2026-10-02']);
			expect(dates(activity.rested)).toEqual(['2026-10-03']);
			expect(dates(activity.foodLogged)).toEqual(['2026-10-02', '2026-10-05']);
		});

		it('counts the protein goal as met only against a positive goal in effect that day', async () => {
			await seed.eaten('2026-09-30', 200, 200);
			await seed.goals('2026-10-01', 2000, 100);
			await seed.eaten('2026-10-01', 1000, 60);
			await seed.eaten('2026-10-01', 1000, 40);
			await seed.eaten('2026-10-02', 1000, 99);
			await seed.goals('2026-10-03', 2000, 0);
			await seed.eaten('2026-10-03', 1000, 50);

			const activity = await queries.activityDays(date('2026-09-01'));

			expect(dates(activity.proteinGoalMet)).toEqual(['2026-10-01']);
		});
	});

	describe('trainingStreak', () => {
		const today = date('2026-10-28');

		it('is zero with nothing logged', async () => {
			expect(await queries.trainingStreak(today)).toEqual({ current: 0, longest: 0 });
		});

		it('counts rest days and workouts, and today does not break the run yet', async () => {
			const bench = await seed.exercise('Bench press');
			await seed.workout('2026-10-25', [[bench, [[5, 100]]]]);
			await seed.restDay('2026-10-26');
			await seed.workout('2026-10-27', [[bench, [[5, 100]]]]);
			await seed.workout('2026-10-27', [[bench, [[5, 100]]]]);

			expect(await queries.trainingStreak(today)).toEqual({ current: 3, longest: 3 });
		});

		it('includes today once it has a workout or rest day', async () => {
			await seed.restDay('2026-10-27');
			await seed.restDay('2026-10-28');

			expect(await queries.trainingStreak(today)).toEqual({ current: 2, longest: 2 });
		});

		it('ends the current run after a missed day but remembers the longest', async () => {
			for (const day of ['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-26']) {
				await seed.restDay(day);
			}

			expect(await queries.trainingStreak(today)).toEqual({ current: 0, longest: 4 });
		});

		it('ignores workouts still in progress', async () => {
			const bench = await seed.exercise('Bench press');
			await seed.workout('2026-10-27', [[bench, [[5, 100]]]], false);

			expect(await queries.trainingStreak(today)).toEqual({ current: 0, longest: 0 });
		});
	});

	describe('with corrupt data', () => {
		it('fails loudly instead of returning an invalid read model', async () => {
			await database.execute({
				name: 'insert corrupt row',
				sql: "INSERT INTO weigh_in (id, date, weight_kg) VALUES ('x', 'not-a-date', 80)",
				params: []
			});

			await expect(queries.weightTrend(undefined)).rejects.toThrow('Corrupt weigh_in row');
		});
	});
});
