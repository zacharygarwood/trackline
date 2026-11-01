import type { AddExerciseToWorkout } from '../application/add-exercise-to-workout.ts';
import type { CreateExercise } from '../application/create-exercise.ts';
import type { GetActiveWorkout } from '../application/get-active-workout.ts';
import type { ListRecentExercises } from '../application/list-recent-exercises.ts';
import type { ListTemplates } from '../application/list-templates.ts';
import type { StartWorkout } from '../application/start-workout.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { Tracking } from '../domain/tracking.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import { canCreateExercise, capitalized, matchExercises } from './exercise-search.ts';
import { workoutName } from './workout-format.ts';

/** The use cases the Train tab calls. */
export interface TrainScreenUseCases {
	readonly listTemplates: ListTemplates;
	readonly listRecentExercises: ListRecentExercises;
	readonly getActiveWorkout: GetActiveWorkout;
	readonly startWorkout: StartWorkout;
	readonly addExerciseToWorkout: AddExerciseToWorkout;
	readonly createExercise: CreateExercise;
}

/** State and actions of the Train tab and its pages: saved workouts, exercises, and starting or adding to a workout. */
export class TrainScreen {
	templates: readonly WorkoutTemplate[] = $state([]);
	library: readonly Exercise[] = $state([]);
	active: ActiveWorkout | undefined = $state();
	query = $state('');

	constructor(private readonly useCases: TrainScreenUseCases) {}

	/** Loads saved workouts, the exercise library, and the workout in progress. */
	async load(): Promise<void> {
		[this.templates, this.library, this.active] = await Promise.all([
			this.useCases.listTemplates.execute(),
			this.useCases.listRecentExercises.execute(),
			this.useCases.getActiveWorkout.execute()
		]);
	}

	/** Saved workouts whose name matches the search. */
	get visibleTemplates(): readonly WorkoutTemplate[] {
		const typed = this.query.trim().toLowerCase();
		return this.templates.filter((template) => template.name.toLowerCase().includes(typed));
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

	/** The name of the workout in progress. */
	get activeName(): string {
		return this.active === undefined
			? ''
			: workoutName(
					this.active,
					this.templates,
					(id) => this.library.find((exercise) => exercise.id === id)?.name ?? ''
				);
	}

	/**
	 * The saved workout a page was opened for.
	 *
	 * @param id - The id passed to the page, if any.
	 */
	findTemplate(id: string | undefined): WorkoutTemplate | undefined {
		return this.templates.find((template) => template.id === id);
	}

	/** The names of a saved workout's exercises, in order. */
	exerciseNames(template: WorkoutTemplate): readonly string[] {
		return template.exercises.flatMap((planned) => {
			const exercise = this.library.find((known) => known.id === planned.exerciseId);
			return exercise === undefined ? [] : [exercise.name];
		});
	}

	/** Starts a saved workout, or adds its exercises to the workout in progress. */
	async startTemplate(template: WorkoutTemplate): Promise<void> {
		if (this.active === undefined) {
			await this.useCases.startWorkout.execute({ templateId: template.id });
			return;
		}
		for (const planned of template.exercises) {
			const exercise = this.library.find((known) => known.id === planned.exerciseId);
			if (exercise !== undefined) {
				await this.useCases.addExerciseToWorkout.execute({ name: exercise.name });
			}
		}
	}

	/** Starts a workout of one exercise, or adds it to the workout in progress. */
	async startExercise(exercise: Exercise): Promise<void> {
		if (this.active === undefined) {
			await this.useCases.startWorkout.execute({ templateId: undefined });
		}
		await this.useCases.addExerciseToWorkout.execute({ name: exercise.name });
	}

	/**
	 * Saves the search text as a new exercise.
	 *
	 * @returns The new exercise's name, or undefined if it could not be saved.
	 */
	async create(tracking: Tracking): Promise<string | undefined> {
		const created = await this.useCases.createExercise.execute({ name: this.newName, tracking });
		if (!created.ok) return undefined;
		this.query = '';
		await this.load();
		return created.value.name;
	}
}
