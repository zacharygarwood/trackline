import { err, ok, type Result } from '../../shared/result.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { parseName, type InvalidName } from '../domain/name.ts';
import { ExerciseExists } from './create-exercise.ts';
import type { Exercises } from './training-ports.ts';

/** Which exercise and its new name. */
export interface RenameExerciseCommand {
	readonly id: ExerciseId;
	readonly name: string;
}

/** Raised when the exercise is not in the library. */
export class ExerciseNotFound {
	/** @param id - The missing exercise. */
	constructor(readonly id: ExerciseId) {}
}

/** Why an exercise couldn't be renamed. */
export type RenameExerciseProblem = InvalidName | ExerciseExists | ExerciseNotFound;

/** Renames an exercise in the library; past workouts show the new name too. */
export class RenameExercise {
	constructor(private readonly exercises: Exercises) {}

	/** @param command - The exercise and new name. */
	async execute(command: RenameExerciseCommand): Promise<Result<Exercise, RenameExerciseProblem>> {
		const exercise = (await this.exercises.findAll()).find((known) => known.id === command.id);
		if (exercise === undefined) return err(new ExerciseNotFound(command.id));
		const name = parseName(command.name);
		if (!name.ok) return name;
		const clash = await this.exercises.findByName(name.value);
		if (clash !== undefined && clash.id !== exercise.id) return err(new ExerciseExists(clash));
		const renamed = { ...exercise, name: name.value };
		await this.exercises.save(renamed);
		return ok(renamed);
	}
}
