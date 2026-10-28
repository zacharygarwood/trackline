import { err, ok, type Result } from '../../shared/result.ts';
import type { WorkoutTemplateId } from '../domain/ids.ts';
import { prefillSets } from '../domain/set-suggestion.ts';
import type { WorkoutTemplateReader } from '../domain/workout-template-repository.ts';
import type { TemplateExercise } from '../domain/workout-template.ts';
import { startWorkout, type ActiveWorkout, type WorkoutExercise } from '../domain/workout.ts';
import { lastSessionOf } from './last-session.ts';
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
 * Starts a workout, empty or from a template. From a template, every set is
 * pre-filled with the weights and reps of the exercise's most recent session.
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
			exercises: await Promise.all(
				(template?.exercises ?? []).map((planned) => this.prefill(planned))
			)
		});
		await workouts.save(workout);
		return ok(workout);
	}

	private async prefill(planned: TemplateExercise): Promise<WorkoutExercise> {
		const lastSession = await lastSessionOf(this.ports.workouts, planned.exerciseId);
		return { exerciseId: planned.exerciseId, sets: prefillSets(lastSession, planned.targetSets) };
	}
}
