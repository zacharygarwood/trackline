import { err, ok, type Result } from '../../shared/result.ts';
import type { ExerciseId } from '../domain/ids.ts';
import type { Exercises, Templates } from './training-ports.ts';

/** Which exercise to delete. */
export interface DeleteExerciseCommand {
	readonly id: ExerciseId;
}

/** Raised when saved workouts still include the exercise. */
export class ExerciseInUse {
	/** @param workoutNames - The saved workouts that include it, in list order. */
	constructor(readonly workoutNames: readonly string[]) {}
}

/** What deleting an exercise needs. */
export interface DeleteExercisePorts {
	readonly exercises: Exercises;
	readonly templates: Templates;
}

/**
 * Removes an exercise from the library. Past workouts keep it, and creating one
 * with its name brings it back. Saved workouts that include it must drop it first.
 */
export class DeleteExercise {
	constructor(private readonly ports: DeleteExercisePorts) {}

	/** @param command - The exercise. */
	async execute(command: DeleteExerciseCommand): Promise<Result<void, ExerciseInUse>> {
		const using = (await this.ports.templates.findAll()).filter((template) =>
			template.exercises.some((planned) => planned.exerciseId === command.id)
		);
		if (using.length > 0) return err(new ExerciseInUse(using.map((template) => template.name)));
		await this.ports.exercises.archive(command.id);
		return ok(undefined);
	}
}
