import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { ExerciseReader, ExerciseWriter } from '../domain/exercise-repository.ts';
import type { Exercise } from '../domain/exercise.ts';
import { exerciseMapper } from './simple.mapper.ts';
import { FIND_ALL_EXERCISES, findExerciseByName, saveExercise } from './training.sql.ts';

/** The exercise library in the `exercise` table. */
export class SqliteExerciseRepository implements ExerciseReader, ExerciseWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc ExerciseReader.findAll} */
	async findAll(): Promise<readonly Exercise[]> {
		const rows = await this.database.query(FIND_ALL_EXERCISES);
		return rows.map((row) => requireValidRow(exerciseMapper.toDomain(row)));
	}

	/** {@inheritDoc ExerciseReader.findByName} */
	async findByName(name: string): Promise<Exercise | undefined> {
		const row = first(await this.database.query(findExerciseByName(name)));
		return row === undefined ? undefined : requireValidRow(exerciseMapper.toDomain(row));
	}

	/** {@inheritDoc ExerciseWriter.save} */
	async save(exercise: Exercise): Promise<void> {
		await this.database.execute(saveExercise(exerciseMapper.toRow(exercise)));
	}
}
