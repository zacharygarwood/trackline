import { err, ok, type Result } from '../../shared/result.ts';
import type { WorkoutTemplateId } from '../domain/ids.ts';
import type { WorkoutTemplateReader } from '../domain/workout-template-repository.ts';
import { startWorkout, type ActiveWorkout } from '../domain/workout.ts';
import type { Creation, Workouts } from './training-ports.ts';

/** Which template to start from, if any. */
export interface StartWorkoutCommand {
	readonly templateId: WorkoutTemplateId | undefined;
}

/** Raised when the chosen template no longer exists. */
export class TemplateNotFound {
	/** @param templateId - The missing template. */
	constructor(readonly templateId: WorkoutTemplateId) {}
}

/** What starting a workout needs. */
export interface StartWorkoutPorts extends Creation {
	readonly workouts: Workouts;
	readonly templates: WorkoutTemplateReader;
}

/**
 * Starts a workout, empty or with a template's exercises and no sets yet.
 * If a workout is already in progress, that one is returned instead.
 */
export class StartWorkout {
	constructor(private readonly ports: StartWorkoutPorts) {}

	/** @param command - The template to start from, or undefined for an empty workout. */
	async execute(command: StartWorkoutCommand): Promise<Result<ActiveWorkout, TemplateNotFound>> {
		const { workouts, templates, clock, ids } = this.ports;
		const active = await workouts.findActive();
		if (active !== undefined) return ok(active);
		const template =
			command.templateId === undefined ? undefined : await templates.findById(command.templateId);
		if (command.templateId !== undefined && template === undefined) {
			return err(new TemplateNotFound(command.templateId));
		}
		const workout = startWorkout({
			id: ids.next(),
			date: clock.today(),
			startedAt: clock.now(),
			sourceTemplateId: template?.id,
			exercises: (template?.exercises ?? []).map((planned) => ({
				exerciseId: planned.exerciseId,
				sets: []
			}))
		});
		await workouts.save(workout);
		return ok(workout);
	}
}
