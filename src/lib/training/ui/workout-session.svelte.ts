import { messages } from '../../i18n/messages.en.ts';
import type { Clock } from '../../shared/clock.ts';
import { last } from '../../shared/collections.ts';
import type { AddExerciseToWorkout } from '../application/add-exercise-to-workout.ts';
import type { CreateExercise } from '../application/create-exercise.ts';
import type { DiscardWorkout } from '../application/discard-workout.ts';
import type { FinishWorkout } from '../application/finish-workout.ts';
import type { GetActiveWorkout } from '../application/get-active-workout.ts';
import type { GetLastPerformance } from '../application/get-last-performance.ts';
import type { ListRecentExercises } from '../application/list-recent-exercises.ts';
import type { ListTemplates } from '../application/list-templates.ts';
import type { LogSet } from '../application/log-set.ts';
import type { RemoveSet } from '../application/remove-set.ts';
import type { RestoreWorkout } from '../application/restore-workout.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { suggestNextSet } from '../domain/set-suggestion.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { tracks, type Tracking } from '../domain/tracking.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import { setsOf, type ActiveWorkout, type WorkoutExercise } from '../domain/workout.ts';
import {
	nextOpen,
	NONE,
	STOPPED,
	stopwatchSeconds,
	targetSets,
	toggleStopwatch,
	type Stopwatch
} from './session-rules.ts';
import {
	draftFrom,
	measuresFrom,
	stepDraft,
	type SetDraft,
	type SteppedField
} from './set-draft.ts';
import { RestTimer } from './rest-timer.svelte.ts';
import { setText, workoutName, type TrainingUnits } from './workout-format.ts';

/** The use cases the workout screen calls. */
export interface WorkoutSessionUseCases {
	readonly getActiveWorkout: GetActiveWorkout;
	readonly listRecentExercises: ListRecentExercises;
	readonly listTemplates: ListTemplates;
	readonly addExerciseToWorkout: AddExerciseToWorkout;
	readonly createExercise: CreateExercise;
	readonly logSet: LogSet;
	readonly removeSet: RemoveSet;
	readonly finishWorkout: FinishWorkout;
	readonly discardWorkout: DiscardWorkout;
	readonly restoreWorkout: RestoreWorkout;
	readonly getLastPerformance: GetLastPerformance;
}

/** The preferences the workout screen follows. */
export interface SessionPreferences {
	readonly units: TrainingUnits;
	readonly restSeconds: number;
}

/** State and actions of the workout in progress. */
export class WorkoutSession {
	workout: ActiveWorkout | undefined = $state();
	library: readonly Exercise[] = $state([]);
	templates: readonly WorkoutTemplate[] = $state([]);
	/** The position of the exercise being logged, or -1 when every exercise is done. */
	current = $state(0);
	adding = $state(false);
	query = $state('');
	drafts: Readonly<Partial<Record<ExerciseId, SetDraft>>> = $state({});
	stopwatches: Readonly<Partial<Record<ExerciseId, Stopwatch>>> = $state({});
	/** Exercises the user finished early with "Done with …". */
	finishedEarly: readonly ExerciseId[] = $state([]);
	readonly rest = new RestTimer();

	constructor(
		private readonly useCases: WorkoutSessionUseCases,
		private readonly clock: Clock,
		private readonly preferences: () => SessionPreferences
	) {}

	/**
	 * Loads the workout in progress.
	 *
	 * @returns Whether there is one.
	 */
	async load(): Promise<boolean> {
		const workout = await this.useCases.getActiveWorkout.execute();
		if (workout === undefined) return false;
		[this.library, this.templates] = await Promise.all([
			this.useCases.listRecentExercises.execute(),
			this.useCases.listTemplates.execute()
		]);
		this.workout = workout;
		await Promise.all(workout.exercises.map((exercise) => this.prepare(exercise.exerciseId)));
		this.current = Math.max(0, nextOpen(this.doneFlags, NONE));
		this.adding = workout.exercises.length === 0;
		return true;
	}

	/** The units the screen shows weights and distances in. */
	get preferenceUnits(): TrainingUnits {
		return this.preferences().units;
	}

	/** The workout's name: its template's, or its first exercise's. */
	get name(): string {
		return this.workout === undefined
			? ''
			: workoutName(this.workout, this.templates, (id) => this.exerciseOf(id)?.name ?? '');
	}

	/** The exercise in the library with this id. */
	exerciseOf(id: ExerciseId): Exercise | undefined {
		return this.library.find((exercise) => exercise.id === id);
	}

	/** How many sets an exercise of this workout aims for. */
	targetOf(exercise: Exercise): number {
		const template = this.templates.find((known) => known.id === this.workout?.sourceTemplateId);
		return targetSets(exercise, template);
	}

	/** Whether an exercise of this workout is done. */
	isDone(entry: WorkoutExercise): boolean {
		const exercise = this.exerciseOf(entry.exerciseId);
		const target = exercise === undefined ? 0 : this.targetOf(exercise);
		return (
			this.finishedEarly.includes(entry.exerciseId) || (target > 0 && entry.sets.length >= target)
		);
	}

	private get doneFlags(): readonly boolean[] {
		return (this.workout?.exercises ?? []).map((entry) => this.isDone(entry));
	}

	/** The exercise being logged, unless adding or all done. */
	get currentEntry(): WorkoutExercise | undefined {
		return this.adding || this.current === NONE
			? undefined
			: this.workout?.exercises.at(this.current);
	}

	/** Shows an exercise of the workout. */
	select(position: number): void {
		this.current = position;
		this.adding = false;
		this.query = '';
	}

	/** Opens or closes the search for another exercise. */
	toggleAdding(): void {
		this.adding = !this.adding;
		this.query = '';
	}

	/** Adds an exercise from the library and shows it. */
	async add(exercise: Exercise): Promise<void> {
		const result = await this.useCases.addExerciseToWorkout.execute({ name: exercise.name });
		if (!result.ok) return;
		this.workout = result.value;
		this.library = await this.useCases.listRecentExercises.execute();
		await this.prepare(exercise.id);
		this.select(result.value.exercises.length - 1);
	}

	/** Creates an exercise from the search text and adds it. */
	async create(tracking: Tracking): Promise<void> {
		const created = await this.useCases.createExercise.execute({ name: this.query, tracking });
		if (created.ok) await this.add(created.value);
	}

	/** Changes a stepper value as typed. */
	type(id: ExerciseId, field: SteppedField, text: string): void {
		const draft = this.drafts[id];
		if (draft !== undefined) this.drafts = { ...this.drafts, [id]: { ...draft, [field]: text } };
	}

	/** Moves a stepper one step up (1) or down (-1). */
	step(id: ExerciseId, field: SteppedField, direction: number): void {
		const draft = this.drafts[id];
		const unit = this.preferences().units.mass;
		if (draft !== undefined) {
			this.drafts = { ...this.drafts, [id]: stepDraft(draft, { field, direction, unit }) };
		}
	}

	/** Picks a grade for the next effort. */
	pickGrade(id: ExerciseId, grade: number): void {
		const draft = this.drafts[id];
		if (draft !== undefined) this.drafts = { ...this.drafts, [id]: { ...draft, grade } };
	}

	/** The seconds an exercise's stopwatch shows. */
	seconds(id: ExerciseId, now: number): number {
		return stopwatchSeconds(this.stopwatches[id] ?? STOPPED, now);
	}

	/** Starts, pauses, or resumes an exercise's stopwatch. */
	toggleStopwatch(id: ExerciseId): void {
		const watch = toggleStopwatch(this.stopwatches[id] ?? STOPPED, this.clock.now());
		this.stopwatches = { ...this.stopwatches, [id]: watch };
	}

	/**
	 * Logs the current exercise's next set from its steppers and stopwatch,
	 * moves on when its sets are done, and starts the rest timer after reps.
	 *
	 * @returns What to announce, or undefined if nothing was logged.
	 */
	async logCurrent(): Promise<string | undefined> {
		const entry = this.currentEntry;
		const exercise = entry === undefined ? undefined : this.exerciseOf(entry.exerciseId);
		if (entry === undefined || exercise === undefined) return undefined;
		const logged = await this.log(exercise);
		if (logged === undefined) return undefined;
		const position = this.current;
		if (this.doneFlags.at(position) === true) this.current = nextOpen(this.doneFlags, position);
		if (tracks(exercise.tracking, TrackedField.reps) && this.current !== NONE) {
			this.rest.start(this.clock.now(), this.preferences().restSeconds);
		} else {
			this.rest.stop();
		}
		return messages.workout.loggedAnnouncement(logged);
	}

	/** Finishes the current exercise early, logging any time on its stopwatch, and moves on. */
	async doneWithCurrent(): Promise<string | undefined> {
		const entry = this.currentEntry;
		const exercise = entry === undefined ? undefined : this.exerciseOf(entry.exerciseId);
		if (entry === undefined || exercise === undefined) return undefined;
		if (this.seconds(exercise.id, this.clock.now()) >= 1) await this.log(exercise);
		this.finishedEarly = [...this.finishedEarly, exercise.id];
		this.current = nextOpen(this.doneFlags, this.current);
		this.rest.stop();
		return messages.workout.exerciseDone(exercise.name);
	}

	/** Removes a logged set; an exercise finished early opens again unless its sets are still done. */
	async removeSet(id: ExerciseId, position: number): Promise<void> {
		const result = await this.useCases.removeSet.execute({
			location: { exerciseId: id, position }
		});
		if (!result.ok) return;
		this.workout = result.value;
		this.finishedEarly = this.finishedEarly.filter((done) => done !== id);
	}

	/**
	 * Finishes the workout, first logging any running stopwatch.
	 *
	 * @returns Whether anything was saved, and the workout as it was, for Undo.
	 */
	async finish(): Promise<{ readonly saved: boolean; readonly before: ActiveWorkout | undefined }> {
		for (const entry of this.workout?.exercises ?? []) {
			const exercise = this.exerciseOf(entry.exerciseId);
			if (exercise !== undefined && this.seconds(exercise.id, this.clock.now()) >= 1) {
				await this.log(exercise);
			}
		}
		const before = this.workout;
		const result = await this.useCases.finishWorkout.execute();
		return { saved: result.ok, before };
	}

	/** Throws the workout away, returning it as it was, for Undo. */
	async discard(): Promise<ActiveWorkout | undefined> {
		const before = this.workout;
		await this.useCases.discardWorkout.execute();
		return before;
	}

	/** Brings back a workout that was just finished or discarded. */
	async restore(workout: ActiveWorkout): Promise<void> {
		await this.useCases.restoreWorkout.execute({ workout });
	}

	private async log(exercise: Exercise): Promise<string | undefined> {
		const draft = this.drafts[exercise.id];
		if (draft === undefined) return undefined;
		const { units } = this.preferences();
		const seconds = tracks(exercise.tracking, TrackedField.time)
			? Math.round(this.seconds(exercise.id, this.clock.now()))
			: undefined;
		const measures = measuresFrom(draft, {
			exercise,
			units,
			...(seconds === undefined ? {} : { seconds })
		});
		const result = await this.useCases.logSet.execute({ exerciseId: exercise.id, measures });
		if (!result.ok) return undefined;
		this.workout = result.value;
		this.stopwatches = { ...this.stopwatches, [exercise.id]: STOPPED };
		const logged = last(setsOf(result.value, exercise.id) ?? []);
		return logged === undefined ? undefined : setText(logged, exercise, { units });
	}

	private async prepare(id: ExerciseId): Promise<void> {
		const lastSession = await this.useCases.getLastPerformance.execute({ exerciseId: id });
		const current = this.workout === undefined ? [] : (setsOf(this.workout, id) ?? []);
		const draft = draftFrom(suggestNextSet({ current, lastSession }), this.preferences().units);
		this.drafts = { ...this.drafts, [id]: draft };
	}
}
