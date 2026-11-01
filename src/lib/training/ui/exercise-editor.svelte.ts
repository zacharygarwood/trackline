import { messages } from '../../i18n/messages.en.ts';
import { ExerciseExists } from '../application/create-exercise.ts';
import type { DeleteExercise } from '../application/delete-exercise.ts';
import type { RenameExercise } from '../application/rename-exercise.ts';
import type { Exercise } from '../domain/exercise.ts';

/** The use cases the exercise editor calls. */
export interface ExerciseEditorUseCases {
	readonly renameExercise: RenameExercise;
	readonly deleteExercise: DeleteExercise;
}

/** State and actions of an exercise's edit page: renaming and deleting it. */
export class ExerciseEditor {
	name: string = $state('');
	/** Why the last change failed, if it did. */
	problem: string | undefined = $state();

	constructor(
		private readonly useCases: ExerciseEditorUseCases,
		private readonly exercise: Exercise
	) {
		this.name = exercise.name;
	}

	/** Renames the exercise; on failure, says why. */
	async rename(): Promise<boolean> {
		const result = await this.useCases.renameExercise.execute({
			id: this.exercise.id,
			name: this.name
		});
		if (result.ok) {
			this.problem = undefined;
			return true;
		}
		this.problem =
			result.error instanceof ExerciseExists
				? messages.exercise.exists(result.error.existing.name)
				: messages.exercise.invalidName;
		return false;
	}

	/** Deletes the exercise; if saved workouts use it, says which. */
	async delete(): Promise<boolean> {
		const result = await this.useCases.deleteExercise.execute({ id: this.exercise.id });
		this.problem = result.ok
			? undefined
			: messages.exercise.inUse(result.error.workoutNames.join(messages.exercise.listSeparator));
		return result.ok;
	}
}
