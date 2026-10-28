import { err, type Result } from '../../shared/result.ts';
import type { WorkoutTemplateId } from '../domain/ids.ts';
import type { InvalidName } from '../domain/name.ts';
import { renameTemplate, type WorkoutTemplate } from '../domain/workout-template.ts';
import { TemplateNotFound } from './start-workout.ts';
import type { Templates } from './training-ports.ts';

/** Which template and its new name. */
export interface RenameTemplateCommand {
	readonly id: WorkoutTemplateId;
	readonly name: string;
}

/** Renames a template. */
export class RenameTemplate {
	constructor(private readonly templates: Templates) {}

	/** @param command - The template and new name. */
	async execute(
		command: RenameTemplateCommand
	): Promise<Result<WorkoutTemplate, InvalidName | TemplateNotFound>> {
		const template = await this.templates.findById(command.id);
		if (template === undefined) return err(new TemplateNotFound(command.id));
		const renamed = renameTemplate(template, command.name);
		if (renamed.ok) await this.templates.save([renamed.value]);
		return renamed;
	}
}
