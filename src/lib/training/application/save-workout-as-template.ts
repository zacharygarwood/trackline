import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, type Result } from '../../shared/result.ts';
import type { WorkoutId } from '../domain/ids.ts';
import type { WorkoutReader } from '../domain/workout-repository.ts';
import {
	templateFromWorkout,
	type TemplateProblem,
	type WorkoutTemplate
} from '../domain/workout-template.ts';
import { WorkoutStatus } from '../domain/workout-status.constants.ts';
import type { Templates } from './training-ports.ts';

/** Which finished workout to repeat, and the template's name. */
export interface SaveAsTemplateCommand {
	readonly workoutId: WorkoutId;
	readonly name: string;
}

/** Raised when the workout to save is missing or still in progress. */
export class FinishedWorkoutNotFound {
	/** @param workoutId - The workout that was looked up. */
	constructor(readonly workoutId: WorkoutId) {}
}

/** What saving a template needs. */
export interface SaveAsTemplatePorts {
	readonly workouts: WorkoutReader;
	readonly templates: Templates;
	readonly ids: IdGenerator;
}

/** Saves a finished workout as a template at the end of the template list. */
export class SaveWorkoutAsTemplate {
	constructor(private readonly ports: SaveAsTemplatePorts) {}

	/** @param command - The workout and the template name. */
	async execute(
		command: SaveAsTemplateCommand
	): Promise<Result<WorkoutTemplate, TemplateProblem | FinishedWorkoutNotFound>> {
		const { workouts, templates, ids } = this.ports;
		const workout = await workouts.findById(command.workoutId);
		if (workout?.status !== WorkoutStatus.finished)
			return err(new FinishedWorkoutNotFound(command.workoutId));
		const position = (await templates.findAll()).length;
		const template = templateFromWorkout(workout, { id: ids.next(), name: command.name, position });
		if (template.ok) await templates.save([template.value]);
		return template;
	}
}
