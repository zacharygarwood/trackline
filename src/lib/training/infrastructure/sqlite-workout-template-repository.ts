import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { WorkoutTemplateId } from '../domain/ids.ts';
import type {
	WorkoutTemplateReader,
	WorkoutTemplateWriter
} from '../domain/workout-template-repository.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import { templateMapper } from './template.mapper.ts';
import {
	clearTemplateExercises,
	deleteTemplate,
	FIND_ALL_TEMPLATES,
	findTemplateById,
	findTemplateExercises,
	insertTemplateExercise,
	upsertTemplate
} from './training.sql.ts';

/** Templates in the `workout_template` and `template_exercise` tables. */
export class SqliteWorkoutTemplateRepository
	implements WorkoutTemplateReader, WorkoutTemplateWriter
{
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc WorkoutTemplateReader.findAll} */
	async findAll(): Promise<readonly WorkoutTemplate[]> {
		const rows = await this.database.query(FIND_ALL_TEMPLATES);
		return Promise.all(rows.map((row) => this.load(row)));
	}

	/** {@inheritDoc WorkoutTemplateReader.findById} */
	async findById(id: WorkoutTemplateId): Promise<WorkoutTemplate | undefined> {
		const row = first(await this.database.query(findTemplateById(id)));
		return row === undefined ? undefined : this.load(row);
	}

	/** {@inheritDoc WorkoutTemplateWriter.save} */
	async save(templates: readonly WorkoutTemplate[]): Promise<void> {
		await this.database.transaction(
			templates.flatMap((template) => {
				const rows = templateMapper.toRows(template);
				return [
					upsertTemplate(rows.template),
					clearTemplateExercises(template.id),
					...rows.exercises.map(insertTemplateExercise)
				];
			})
		);
	}

	/** {@inheritDoc WorkoutTemplateWriter.delete} */
	async delete(id: WorkoutTemplateId): Promise<void> {
		await this.database.execute(deleteTemplate(id));
	}

	private async load(row: SqlRow): Promise<WorkoutTemplate> {
		const id = typeof row.id === 'string' ? row.id : '';
		const exercises = await this.database.query(findTemplateExercises(id));
		return requireValidRow(templateMapper.toDomain({ template: row, exercises }));
	}
}
