import { SvelteMap } from 'svelte/reactivity';
import { elementAt } from '../../shared/collections.ts';
import { messages } from '../../i18n/messages.en.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import type { Result } from '../../shared/result.ts';
import type { AddExerciseToWorkout } from '../application/add-exercise-to-workout.ts';
import type { AddSet } from '../application/add-set.ts';
import type { DiscardWorkout } from '../application/discard-workout.ts';
import type { FinishWorkout } from '../application/finish-workout.ts';
import type { GetActiveWorkout } from '../application/get-active-workout.ts';
import type { GetLastPerformance } from '../application/get-last-performance.ts';
import type { ListExercises } from '../application/list-exercises.ts';
import type { RemoveExerciseFromWorkout } from '../application/remove-exercise-from-workout.ts';
import type { RemoveSet } from '../application/remove-set.ts';
import type { SetWorkoutNote } from '../application/set-workout-note.ts';
import type { StartWorkout } from '../application/start-workout.ts';
import type { UpdateSet } from '../application/update-set.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { ExerciseId, WorkoutTemplateId } from '../domain/ids.ts';
import { InvalidName } from '../domain/name.ts';
import type { SetLocation } from '../domain/workout-editing.ts';
import { setsOf, type ActiveWorkout, type FinishedWorkout } from '../domain/workout.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';
import { lastTimeHint } from './workout-format.ts';

/** Decimals kept when showing a weight converted between units. */
const WEIGHT_DECIMALS = 2;

/** The use cases a workout session calls. */
export interface WorkoutSessionUseCases {
	readonly getActiveWorkout: GetActiveWorkout;
	readonly startWorkout: StartWorkout;
	readonly listExercises: ListExercises;
	readonly addExerciseToWorkout: AddExerciseToWorkout;
	readonly addSet: AddSet;
	readonly updateSet: UpdateSet;
	readonly removeSet: RemoveSet;
	readonly removeExerciseFromWorkout: RemoveExerciseFromWorkout;
	readonly setWorkoutNote: SetWorkoutNote;
	readonly finishWorkout: FinishWorkout;
	readonly discardWorkout: DiscardWorkout;
	readonly getLastPerformance: GetLastPerformance;
}

/** A set's values as shown in the steppers, with the weight in the user's unit. */
export interface SetEntry {
	readonly reps: number;
	readonly weight: number;
	readonly completed: boolean;
}

/** State and actions for the workout in progress. */
export class WorkoutSession {
	workout: ActiveWorkout | undefined = $state();
	library: readonly Exercise[] = $state([]);
	lastSessions: ReadonlyMap<ExerciseId, readonly WorkoutSet[]> = $state(new SvelteMap());
	unit: MassUnit = $state(MassUnit.kg);
	private queue: Promise<void> = Promise.resolve();

	constructor(private readonly useCases: WorkoutSessionUseCases) {}

	/**
	 * Loads the workout in progress and the exercise library.
	 *
	 * @param unit - The unit to show and enter weights in.
	 */
	async load(unit: MassUnit): Promise<void> {
		this.unit = unit;
		[this.workout, this.library] = await Promise.all([
			this.useCases.getActiveWorkout.execute(),
			this.useCases.listExercises.execute()
		]);
		await this.loadHints();
	}

	/** Starts a workout, empty or from a template. */
	async start(templateId?: WorkoutTemplateId): Promise<void> {
		this.show(await this.useCases.startWorkout.execute({ templateId }));
		await this.loadHints();
	}

	/** An exercise's name. */
	nameOf(exerciseId: ExerciseId): string {
		return this.library.find((exercise) => exercise.id === exerciseId)?.name ?? '';
	}

	/** What the user did last time for an exercise. */
	hintFor(exerciseId: ExerciseId): string {
		return lastTimeHint(this.lastSessions.get(exerciseId) ?? [], this.unit);
	}

	/** A set's values for the steppers. */
	entryOf(set: WorkoutSet): SetEntry {
		return {
			reps: set.reps,
			weight: Number(set.weight.toUnit(this.unit).toFixed(WEIGHT_DECIMALS)),
			completed: set.completed
		};
	}

	/**
	 * Adds an exercise by name, creating it if it's new.
	 *
	 * @returns A message to show if the name was rejected.
	 */
	async addExercise(name: string): Promise<string | undefined> {
		const result = await this.useCases.addExerciseToWorkout.execute({ name });
		if (!result.ok) {
			return result.error instanceof InvalidName
				? messages.training.enterName
				: messages.training.exerciseAlreadyAdded;
		}
		this.workout = result.value;
		this.library = await this.useCases.listExercises.execute();
		await this.loadHints();
		return undefined;
	}

	/** Adds a set to an exercise, pre-filled from the previous one. */
	async addSet(exerciseId: ExerciseId): Promise<void> {
		this.show(await this.useCases.addSet.execute({ exerciseId }));
	}

	/** Changes a set's reps, keeping its weight and check mark. */
	setReps(location: SetLocation, reps: number): Promise<void> {
		return this.changeSet(location, (set) => ({ ...set, reps }));
	}

	/** Changes a set's weight, given in the user's unit; an invalid weight is ignored. */
	setWeight(location: SetLocation, weight: number): Promise<void> {
		const mass = Mass.of(weight, this.unit);
		return mass.ok
			? this.changeSet(location, (set) => ({ ...set, weight: mass.value }))
			: this.queue;
	}

	/** Checks a set off, or unchecks it. */
	toggleCompleted(location: SetLocation): Promise<void> {
		return this.changeSet(location, (set) => ({ ...set, completed: !set.completed }));
	}

	/** Removes a set. */
	async removeSet(location: SetLocation): Promise<void> {
		this.show(await this.useCases.removeSet.execute({ location }));
	}

	/** Removes an exercise and its sets. */
	async removeExercise(exerciseId: ExerciseId): Promise<void> {
		this.show(await this.useCases.removeExerciseFromWorkout.execute({ exerciseId }));
	}

	/** Saves the workout note. */
	async setNote(note: string): Promise<void> {
		this.show(await this.useCases.setWorkoutNote.execute({ note }));
	}

	/**
	 * Finishes the workout.
	 *
	 * @returns The finished workout, or undefined if nothing was completed and it was discarded.
	 */
	async finish(): Promise<FinishedWorkout | undefined> {
		const result = await this.useCases.finishWorkout.execute();
		this.workout = undefined;
		return result.ok ? result.value : undefined;
	}

	/** Throws the workout away. */
	async discard(): Promise<void> {
		await this.useCases.discardWorkout.execute();
		this.workout = undefined;
	}

	/**
	 * Applies a change to the latest version of a set. Changes run one at a
	 * time, so quick successive edits never overwrite each other.
	 */
	private changeSet(location: SetLocation, change: (set: WorkoutSet) => WorkoutSet): Promise<void> {
		this.queue = this.queue.then(async () => {
			const sets =
				this.workout === undefined ? [] : (setsOf(this.workout, location.exerciseId) ?? []);
			const current = elementAt(sets, location.position);
			if (current === undefined) return;
			this.show(await this.useCases.updateSet.execute({ location, ...change(current) }));
		});
		return this.queue;
	}

	private show(result: Result<ActiveWorkout, unknown>): void {
		if (result.ok) this.workout = result.value;
	}

	private async loadHints(): Promise<void> {
		const ids = this.workout?.exercises.map((exercise) => exercise.exerciseId) ?? [];
		const hints = await Promise.all(
			ids.map(
				async (exerciseId) =>
					[exerciseId, await this.useCases.getLastPerformance.execute({ exerciseId })] as const
			)
		);
		this.lastSessions = new SvelteMap(hints);
	}
}
