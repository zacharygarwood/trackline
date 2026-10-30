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

	describe('workoutDays', () => {
		it('adds up the minutes of each day of finished workouts, from a date', async () => {
			const squat = await seed.exercise('Squat');
			await seed.workout('2026-09-30', [[squat, [[5, 100]]]], { minutes: 40 });
			await seed.workout('2026-10-02', [[squat, [[5, 100]]]], { minutes: 45 });
			await seed.workout('2026-10-02', [[squat, [[5, 100]]]], { minutes: 15 });
			await seed.workout('2026-10-03', [[squat, [[5, 100]]]], { minutes: 30, finished: false });

			const days = await queries.workoutDays(date('2026-10-01'));

			expect(days.map((day) => [day.date.toString(), day.minutes])).toEqual([['2026-10-02', 60]]);
		});
	});

	describe('exerciseDays', () => {
		it('totals completed sets per exercise per day, from a date', async () => {
			const bench = await seed.exercise('Bench press');
			const run = await seed.exercise('Run');
			await seed.workout('2026-09-30', [[bench, [[5, 90]]]]);
			await seed.workout('2026-10-05', [
				[
					bench,
					[
						[5, 100],
						[8, 95],
						[3, 120, false]
					]
				],
				[
					run,
					[
						{ seconds: 1200, meters: 3000 },
						{ seconds: 600, meters: 1500 }
					]
				]
			]);

			const days = await queries.exerciseDays(date('2026-10-01'));

			expect(days).toHaveLength(2);
			expect(days.find((day) => day.exerciseId === bench)).toMatchObject({
				mostReps: 8,
				hardestGrade: undefined,
				meters: 0
			});
			expect(days.find((day) => day.exerciseId === bench)?.heaviest?.kilograms).toBe(100);
			expect(days.find((day) => day.exerciseId === run)).toMatchObject({
				heaviest: undefined,
				meters: 4500,
				seconds: 1800,
				count: 0
			});
		});

		it('keeps the hardest grade and the total count', async () => {
			const boulder = await seed.exercise('Bouldering');
			await seed.workout('2026-10-05', [[boulder, [{ grade: 3 }, { grade: 5 }, { count: 4 }]]]);

			const [day] = await queries.exerciseDays(undefined);

			expect(day).toMatchObject({ hardestGrade: 5, count: 4 });
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
