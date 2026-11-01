import { err, type Result } from '../../shared/result.ts';
import type { ExerciseId, WorkoutTemplateId } from '../domain/ids.ts';
import {
	createTemplate,
	type TemplateProblem,
	type WorkoutTemplate
} from '../domain/workout-template.ts';
import { DEFAULT_TARGET_SETS } from './create-template.ts';
import { TemplateNotFound } from './start-workout.ts';
import type { Templates } from './training-ports.ts';

/** A saved workout's new name and exercises, in order. */
export interface EditTemplateCommand {
	readonly id: WorkoutTemplateId;
	readonly name: string;
	readonly exerciseIds: readonly ExerciseId[];
}

/** Changes a saved workout's name and exercises, keeping the target sets of exercises it keeps. */
export class EditTemplate {
	constructor(private readonly templates: Templates) {}

	/** @param command - The workout, name, and exercises. */
	async execute(
		command: EditTemplateCommand
	): Promise<Result<WorkoutTemplate, TemplateProblem | TemplateNotFound>> {
		const template = await this.templates.findById(command.id);
		if (template === undefined) return err(new TemplateNotFound(command.id));
		const targetSets = (exerciseId: ExerciseId) =>
			template.exercises.find((planned) => planned.exerciseId === exerciseId)?.targetSets ??
			DEFAULT_TARGET_SETS;
		const edited = createTemplate({
			...template,
			name: command.name,
			exercises: command.exerciseIds.map((exerciseId) => ({
				exerciseId,
				targetSets: targetSets(exerciseId)
			}))
		});
		if (edited.ok) await this.templates.save([edited.value]);
		return edited;
	}
}
