import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { ExerciseReader, ExerciseWriter } from '../domain/exercise-repository.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { exerciseMapper } from './exercise.mapper.ts';
import {
	FIND_ALL_EXERCISES,
	FIND_EXERCISES_BY_RECENT_USE,
	archiveExercise,
	findExerciseByName,
	isExerciseArchived,
	saveExercise
} from './training.sql.ts';

/** The exercise library in the `exercise` table. */
export class SqliteExerciseRepository implements ExerciseReader, ExerciseWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc ExerciseReader.findAll} */
	async findAll(): Promise<readonly Exercise[]> {
		const rows = await this.database.query(FIND_ALL_EXERCISES);
		return rows.map((row) => requireValidRow(exerciseMapper.toDomain(row)));
	}

	/** {@inheritDoc ExerciseReader.findAllByRecentUse} */
	async findAllByRecentUse(): Promise<readonly Exercise[]> {
		const rows = await this.database.query(FIND_EXERCISES_BY_RECENT_USE);
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

	/** {@inheritDoc ExerciseWriter.archive} */
	async archive(id: ExerciseId): Promise<void> {
		await this.database.execute(archiveExercise(id, true));
	}

	/** {@inheritDoc ExerciseWriter.restore} */
	async restore(id: ExerciseId): Promise<boolean> {
		const archived = (await this.database.query(isExerciseArchived(id))).length > 0;
		if (archived) await this.database.execute(archiveExercise(id, false));
		return archived;
	}
}
