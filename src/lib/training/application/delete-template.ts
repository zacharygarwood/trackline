import type { WorkoutTemplateId } from '../domain/ids.ts';
import type { Templates } from './training-ports.ts';

/** Which template to delete. */
export interface DeleteTemplateCommand {
	readonly id: WorkoutTemplateId;
}

/** Deletes a template; the remaining templates keep their order. */
export class DeleteTemplate {
	constructor(private readonly templates: Templates) {}

	/** @param command - The template. */
	async execute(command: DeleteTemplateCommand): Promise<void> {
		await this.templates.delete(command.id);
		const remaining = await this.templates.findAll();
		await this.templates.save(remaining.map((template, position) => ({ ...template, position })));
	}
}
