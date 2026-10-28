import type { WorkoutTemplateReader } from '../domain/workout-template-repository.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';

/** Lists templates for the Train tab. */
export class ListTemplates {
	constructor(private readonly templates: WorkoutTemplateReader) {}

	/** @returns Every template, in list order. */
	execute(): Promise<readonly WorkoutTemplate[]> {
		return this.templates.findAll();
	}
}
