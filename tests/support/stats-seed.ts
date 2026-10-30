import type { SqlDriver } from '../../src/lib/platform/db/sql-driver.ts';
import type { ExerciseId } from '../../src/lib/training/domain/ids.ts';
import { anId } from '../builders/training.builder.ts';

/** A set to seed: reps, kilograms, and whether it was completed (default yes), or other measures. */
type SeedSet =
	| readonly [reps: number, kilograms: number, completed?: boolean]
	| {
			readonly seconds?: number;
			readonly meters?: number;
			readonly grade?: number;
			readonly count?: number;
	  };

/** How a seeded workout went. */
interface SeedWorkout {
	readonly minutes?: number;
	readonly finished?: boolean;
}

const MS_PER_MINUTE = 60_000;

type WeightedSet = readonly [reps: number, kilograms: number, completed?: boolean];

const isWeighted = (set: SeedSet): set is WeightedSet => Array.isArray(set);

function setColumns(set: SeedSet): (number | null)[] {
	if (isWeighted(set)) {
		const [reps, kilograms, completed = true] = set;
		return [reps, kilograms, null, null, null, null, completed ? 1 : 0];
	}
	const { seconds, meters, grade, count } = set;
	return [null, null, seconds ?? null, meters ?? null, grade ?? null, count ?? null, 1];
}

/**
 * Writes rows straight into a migrated database, the way the other contexts
 * store them, so insights queries can be tested against realistic data.
 */
export class StatsSeed {
	private foodId: string | undefined;

	constructor(private readonly database: SqlDriver) {}

	async weighIn(date: string, kilograms: number): Promise<void> {
		await this.run('INSERT INTO weigh_in (id, date, weight_kg) VALUES (?, ?, ?)', [
			anId(),
			date,
			kilograms
		]);
	}

	async exercise(name: string): Promise<ExerciseId> {
		const id = anId<'Exercise'>();
		await this.run('INSERT INTO exercise (id, name) VALUES (?, ?)', [id, name]);
		return id;
	}

	/** A finished workout (or an active one) with sets for one or more exercises. */
	async workout(
		date: string,
		exercises: readonly (readonly [ExerciseId, readonly SeedSet[]])[],
		{ minutes = 60, finished = true }: SeedWorkout = {}
	): Promise<void> {
		const id = anId();
		await this.run(
			'INSERT INTO workout (id, date, started_at, finished_at, note, source_template_id) VALUES (?, ?, 0, ?, ?, NULL)',
			[id, date, finished ? minutes * MS_PER_MINUTE : null, '']
		);
		for (const [position, [exerciseId, sets]] of exercises.entries()) {
			await this.run(
				'INSERT INTO workout_exercise (workout_id, position, exercise_id) VALUES (?, ?, ?)',
				[id, position, exerciseId]
			);
			for (const [setPosition, set] of sets.entries()) {
				await this.run(
					`INSERT INTO workout_set (workout_id, exercise_position, position, reps, weight_kg, seconds,
						distance_m, grade, count, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[id, position, setPosition, ...setColumns(set)]
				);
			}
		}
	}

	async restDay(date: string): Promise<void> {
		await this.run('INSERT INTO rest_day (id, date) VALUES (?, ?)', [anId(), date]);
	}

	/** A food log entry with the given calories and protein. */
	async eaten(date: string, calories: number, protein: number): Promise<void> {
		await this.run(
			`INSERT INTO food_log_entry (id, date, slot, food_id, food_name, unit, amount, calories, protein_g, carbs_g, fat_g, logged_at)
				VALUES (?, ?, 'lunch', ?, 'Food', 'g', 100, ?, ?, 0, 0, 0)`,
			[anId(), date, await this.food(), calories, protein]
		);
	}

	async goals(effectiveFrom: string, calories: number, protein: number): Promise<void> {
		await this.run(
			'INSERT INTO daily_goals (effective_from, calories, protein_g, carbs_g, fat_g) VALUES (?, ?, ?, 0, 0)',
			[effectiveFrom, calories, protein]
		);
	}

	private async food(): Promise<string> {
		if (this.foodId !== undefined) return this.foodId;
		const id = anId();
		await this.run(
			`INSERT INTO food (id, name, reference_amount, reference_unit, calories, protein_g, carbs_g, fat_g)
				VALUES (?, 'Food', 100, 'g', 0, 0, 0, 0)`,
			[id]
		);
		this.foodId = id;
		return id;
	}

	private async run(sql: string, params: readonly (string | number | null)[]): Promise<void> {
		await this.database.execute({ name: 'seed', sql, params });
	}
}
