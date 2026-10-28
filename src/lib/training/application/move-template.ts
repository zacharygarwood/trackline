import type { WorkoutTemplateId } from '../domain/ids.ts';
import { moveTemplate, type MoveDirection } from '../domain/workout-template.ts';
import type { Templates } from './training-ports.ts';

/** Which template to move, and which way. */
export interface MoveTemplateCommand {
	readonly id: WorkoutTemplateId;
	readonly direction: MoveDirection;
}

/** Moves a template up or down the list. */
export class MoveTemplate {
	constructor(private readonly templates: Templates) {}

	/** @param command - The template and direction. */
	async execute(command: MoveTemplateCommand): Promise<void> {
		const templates = await this.templates.findAll();
		await this.templates.save(moveTemplate(templates, command.id, command.direction));
	}
}
