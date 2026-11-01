import { describe, expect, it } from 'vitest';
import { describeTrackerRepositories } from '../../../../tests/contracts/tracker-repositories.contract.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Measure } from '../domain/tracker.constants.ts';
import {
	SqliteTrackerEntryRepository,
	SqliteTrackerRepository
} from './sqlite-tracker-repositories.ts';
import { SqliteTrackerSources } from './sqlite-tracker-sources.ts';
import { trackerEntryMapper } from './tracker.mapper.ts';

describeTrackerRepositories(async () => {
	const database = await migratedDatabase();
	const trackers = new SqliteTrackerRepository(database);
	return { trackers, entries: new SqliteTrackerEntryRepository(database), setup: trackers };
});

const ids = {
	oats: '01930000-0000-7000-8000-000000000001',
	run: '01930000-0000-7000-8000-000000000002',
	done: '01930000-0000-7000-8000-000000000003',
	open: '01930000-0000-7000-8000-000000000004',
	entry: '01930000-0000-7000-8000-000000000005'
};

const FIXTURE = [
	`INSERT INTO food (id, name, reference_amount, reference_unit, calories, protein_g, carbs_g, fat_g)
		VALUES ('${ids.oats}', 'Oats', 40, 'g', 150, 5, 27, 3)`,
	`INSERT INTO food_log_entry (id, date, slot, food_id, food_name, unit, amount, calories, protein_g, carbs_g, fat_g, logged_at)
		VALUES ('${ids.entry}', '2026-10-28', 'breakfast', '${ids.oats}', 'Oats', 'g', 80, 300, 10, 54, 6, 1)`,
	`INSERT INTO exercise (id, name, tracked_fields) VALUES ('${ids.run}', 'Run', 'distance,time')`,
	`INSERT INTO workout (id, date, started_at, finished_at, note) VALUES ('${ids.done}', '2026-10-28', 1, 2, '')`,
	`INSERT INTO workout (id, date, started_at, finished_at, note) VALUES ('${ids.open}', '2026-10-29', 3, NULL, '')`,
	`INSERT INTO workout_exercise (workout_id, position, exercise_id) VALUES ('${ids.done}', 0, '${ids.run}')`,
	`INSERT INTO workout_exercise (workout_id, position, exercise_id) VALUES ('${ids.open}', 0, '${ids.run}')`,
	`INSERT INTO workout_set (workout_id, exercise_position, position, seconds, distance_m, completed)
		VALUES ('${ids.done}', 0, 0, 1800, 5000, 1), ('${ids.done}', 0, 1, 600, 2000, 0), ('${ids.open}', 0, 0, 60, 100, 1)`,
	"INSERT INTO weigh_in (id, date, weight_kg) VALUES ('01930000-0000-7000-8000-000000000006', '2026-10-02', 82), ('01930000-0000-7000-8000-000000000007', '2026-10-01', 83)"
];

describe('SqliteTrackerSources', () => {
	it('reads the food log, finished workouts, and weigh-ins', async () => {
		const database = await migratedDatabase();
		for (const sql of FIXTURE) await database.execute({ name: 'fixture', sql, params: [] });
		const sources = new SqliteTrackerSources(database);
		const since = expectOk(LocalDate.parse('2026-10-26'));

		expect(await sources.macroTotal(Measure.protein, since)).toBe(10);
		expect(await sources.foodAmount(ids.oats, since)).toBe(80);
		expect(await sources.workoutCount(since)).toBe(1);
		expect(await sources.exerciseTotal(ids.run, Measure.sessions, since)).toBe(1);
		expect(await sources.exerciseTotal(ids.run, Measure.distance, since)).toBe(5000);
		expect(await sources.exerciseTotal(ids.run, Measure.time, since)).toBe(30);
		expect(await sources.exerciseTotal(ids.run, Measure.sets, since)).toBe(1);
		expect(await sources.weights()).toEqual([83, 82]);
		expect(await sources.workoutCount(expectOk(LocalDate.parse('2026-10-29')))).toBe(0);
	});

	it('fails loudly on a corrupt tracker', async () => {
		const database = await migratedDatabase();
		await database.execute({
			name: 'corrupt tracker',
			sql: "INSERT INTO tracker (id, name, position, measure, unit, goal, direction, period, combine) VALUES ('x', 'Water', 0, 'number', '', 1, 'at_least', 'day', 'total')",
			params: []
		});

		await expect(new SqliteTrackerRepository(database).findAll()).rejects.toThrow(
			'Corrupt tracker'
		);
		expect(trackerEntryMapper.toDomain({ id: 'x' }).ok).toBe(false);
	});
});
