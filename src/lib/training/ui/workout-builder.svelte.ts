import type { CreateExercise } from '../application/create-exercise.ts';
import type { CreateTemplate } from '../application/create-template.ts';
import type { EditTemplate } from '../application/edit-template.ts';
import type { ListRecentExercises } from '../application/list-recent-exercises.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { Tracking } from '../domain/tracking.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import { canCreateExercise, capitalized, matchExercises } from './exercise-search.ts';

/** The use cases the workout builder calls. */
export interface WorkoutBuilderUseCases {
	readonly listRecentExercises: ListRecentExercises;
	readonly createTemplate: CreateTemplate;
	readonly editTemplate: EditTemplate;
	readonly createExercise: CreateExercise;
}

/** State and actions of the New workout and Edit workout screens: a name and an ordered list of exercises. */
export class WorkoutBuilder {
	name = $state('');
	chosen: readonly Exercise[] = $state([]);
	library: readonly Exercise[] = $state([]);
	query = $state('');

	/**
	 * @param useCases - What the builder calls.
	 * @param editing - The saved workout being edited; a new one is built when absent.
	 */
	constructor(
		private readonly useCases: WorkoutBuilderUseCases,
		private readonly editing?: WorkoutTemplate
	) {}

	/** Loads the exercise library, and the saved workout being edited. */
	async load(): Promise<void> {
		this.library = await this.useCases.listRecentExercises.execute();
		if (this.editing === undefined) return;
		this.name = this.editing.name;
		this.chosen = this.editing.exercises.flatMap((planned) =>
			this.library.filter((exercise) => exercise.id === planned.exerciseId)
		);
	}

	/** Exercises matching the search, or the recent ones. */
	get matches(): readonly Exercise[] {
		return matchExercises(this.query, this.library);
	}

	/** Whether the search could become a new exercise. */
	get canCreate(): boolean {
		return canCreateExercise(this.query, this.library);
	}

	/** The search text as a new exercise would be named. */
	get newName(): string {
		return capitalized(this.query);
	}

	/** Whether the workout has a name and at least one exercise. */
	get canSave(): boolean {
		return this.name.trim() !== '' && this.chosen.length > 0;
	}

	/** Adds an exercise at the end and clears the search. */
	add(exercise: Exercise): void {
		this.chosen = [...this.chosen, exercise];
		this.query = '';
	}

	/** Removes the exercise at a position. */
	remove(position: number): void {
		this.chosen = this.chosen.filter((_, index) => index !== position);
	}

	/** Saves the search text as a new exercise and adds it. */
	async create(tracking: Tracking): Promise<void> {
		const created = await this.useCases.createExercise.execute({ name: this.newName, tracking });
		if (!created.ok) return;
		this.library = [created.value, ...this.library];
		this.add(created.value);
	}

	/**
	 * Saves the workout.
	 *
	 * @returns Its name, or undefined if it could not be saved.
	 */
	async save(): Promise<string | undefined> {
		const command = {
			name: capitalized(this.name),
			exerciseIds: this.chosen.map((exercise) => exercise.id)
		};
		const result =
			this.editing === undefined
				? await this.useCases.createTemplate.execute(command)
				: await this.useCases.editTemplate.execute({ ...command, id: this.editing.id });
		return result.ok ? result.value.name : undefined;
	}
}
