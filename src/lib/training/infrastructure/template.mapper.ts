import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { err, type Result } from '../../shared/result.ts';
import {
	createTemplate,
	type TemplateExercise,
	type WorkoutTemplate
} from '../domain/workout-template.ts';
import { TrainingTable } from './training.sql.ts';
import type { TemplateExerciseRow, WorkoutTemplateRow } from './training.row.ts';

/** A template's row with its exercise rows, as read from the database. */
export interface StoredTemplate {
	readonly template: SqlRow;
	readonly exercises: readonly SqlRow[];
}

/** A template as rows to write. */
export interface TemplateRows {
	readonly template: WorkoutTemplateRow;
	readonly exercises: readonly TemplateExerciseRow[];
}

const corrupt = (reason: string) => err(new CorruptRow(TrainingTable.template, reason));

function templateExercise(row: SqlRow): TemplateExercise | undefined {
	const { exercise_id, target_sets } = row;
	if (typeof exercise_id !== 'string' || typeof target_sets !== 'number') return undefined;
	const exerciseId = parseId<'Exercise'>(exercise_id);
	return exerciseId.ok ? { exerciseId: exerciseId.value, targetSets: target_sets } : undefined;
}

/** Converts between templates and their `workout_template` and `template_exercise` rows. */
export const templateMapper = {
	/**
	 * Validates stored rows and builds the template they describe.
	 *
	 * @param stored - The template row with its exercise rows in order.
	 */
	toDomain(stored: StoredTemplate): Result<WorkoutTemplate, CorruptRow> {
		const { id, name, position } = stored.template;
		if (typeof id !== 'string' || typeof name !== 'string' || typeof position !== 'number') {
			return corrupt(CorruptReason.missingColumn);
		}
		const templateId = parseId<'WorkoutTemplate'>(id);
		const exercises = stored.exercises.map(templateExercise);
		if (!templateId.ok || exercises.includes(undefined)) return corrupt(CorruptReason.invalidValue);
		const template = createTemplate({
			id: templateId.value,
			name,
			position,
			exercises: exercises.filter((exercise) => exercise !== undefined)
		});
		return template.ok ? template : corrupt(CorruptReason.brokenInvariant);
	},

	/** @param template - The template to store. */
	toRows(template: WorkoutTemplate): TemplateRows {
		return {
			template: { id: template.id, name: template.name, position: template.position },
			exercises: template.exercises.map((exercise, position) => ({
				template_id: template.id,
				position,
				exercise_id: exercise.exerciseId,
				target_sets: exercise.targetSets
			}))
		};
	}
};
