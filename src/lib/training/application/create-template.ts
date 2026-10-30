import type { IdGenerator } from '../../shared/id-generator.ts';
import type { Result } from '../../shared/result.ts';
import type { ExerciseId } from '../domain/ids.ts';
import {
	createTemplate,
	type TemplateProblem,
	type WorkoutTemplate
} from '../domain/workout-template.ts';
import type { Templates } from './training-ports.ts';

/** How many sets each exercise of a new template aims for. */
export const DEFAULT_TARGET_SETS = 3;

/** The new template's name and its exercises in order. */
export interface CreateTemplateCommand {
	readonly name: string;
	readonly exerciseIds: readonly ExerciseId[];
}

/** What creating a template needs. */
export interface CreateTemplatePorts {
	readonly templates: Templates;
	readonly ids: IdGenerator;
}

/** Builds a workout from chosen exercises and adds it at the end of the list. */
export class CreateTemplate {
	constructor(private readonly ports: CreateTemplatePorts) {}

	/** @param command - The name and the exercises. */
	async execute(command: CreateTemplateCommand): Promise<Result<WorkoutTemplate, TemplateProblem>> {
		const { templates, ids } = this.ports;
		const template = createTemplate({
			id: ids.next(),
			name: command.name,
			position: (await templates.findAll()).length,
			exercises: command.exerciseIds.map((exerciseId) => ({
				exerciseId,
				targetSets: DEFAULT_TARGET_SETS
			}))
		});
		if (template.ok) await templates.save([template.value]);
		return template;
	}
}
