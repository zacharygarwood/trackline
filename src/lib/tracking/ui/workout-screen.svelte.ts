import type { Clock } from '../../shared/clock.ts';
import { isId } from '../../shared/id.ts';
import type { ChangeEntry, DeleteEntry, ListEntries, LogEntry } from '../application/entries.ts';
import type { ListSubjects } from '../application/library.ts';
import type { DiscardSession, FinishSession, ListSessions } from '../application/sessions.ts';
import type { GetTracker } from '../application/trackers.ts';
import type { Entry } from '../domain/entry.ts';
import type { FieldKey, FieldValue } from '../domain/field.ts';
import type { SubjectId } from '../domain/ids.ts';
import type { ActiveSession, FinishedSession } from '../domain/session.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { groupSets, lastTimeSets, nextSetValues, type ExerciseSets } from './workout-sets.ts';

const MILLISECONDS_PER_SECOND = 1000;

/** The use cases the workout page calls. */
export interface WorkoutUseCases {
	readonly getTracker: GetTracker;
	readonly listSubjects: ListSubjects;
	readonly listSessions: ListSessions;
	readonly listEntries: ListEntries;
	readonly logEntry: LogEntry;
	readonly changeEntry: ChangeEntry;
	readonly deleteEntry: DeleteEntry;
	readonly finishSession: FinishSession;
	readonly discardSession: DiscardSession;
}

/** One exercise in the workout under way: its sets, and last time's for reference. */
export interface WorkoutExercise extends ExerciseSets {
	readonly exercise: Subject;
	readonly lastTime: readonly Entry[];
}

/**
 * State and actions of a workout under way: each exercise's sets, adding a
 * set as a copy of the one before, and the rest timer that starts after it.
 */
export class WorkoutScreen {
	tracker: Tracker | undefined = $state();
	session: ActiveSession | undefined = $state();
	/** Every exercise in the library, deleted ones included, for names. */
	library: readonly Subject[] = $state([]);
	/** Every set of the tracker, so last time's sets are at hand. */
	history: readonly Entry[] = $state([]);
	/** When the rest timer ends, in epoch milliseconds. */
	restEndsAt: number | undefined = $state();
	/** Set changes still being saved, which a new set waits for so it copies them. */
	private saving: Promise<unknown> = Promise.resolve();

	constructor(
		private readonly useCases: WorkoutUseCases,
		private readonly clock: Clock
	) {}

	/**
	 * Reads the workout under way.
	 *
	 * @param trackerId - The workout tracker, from page state.
	 * @returns Whether a workout is under way.
	 */
	async load(trackerId: string | undefined): Promise<boolean> {
		if (trackerId === undefined || !isId<'Tracker'>(trackerId)) return false;
		const [tracker, sessions, library, history] = await Promise.all([
			this.useCases.getTracker.execute({ id: trackerId }),
			this.useCases.listSessions.execute({ trackerId }),
			this.useCases.listSubjects.execute({ trackerId, archived: true }),
			this.useCases.listEntries.execute({ trackerId })
		]);
		if (tracker === undefined || sessions.active === undefined) return false;
		this.tracker = tracker;
		this.session = sessions.active;
		this.library = library;
		this.history = history;
		return true;
	}

	/** The exercises in this workout, in the order they were started. */
	get exercises(): readonly WorkoutExercise[] {
		const current = this.history.filter((entry) => entry.sessionId === this.session?.id);
		return groupSets(current).flatMap((group) => {
			const exercise = this.library.find((subject) => subject.id === group.subjectId);
			if (exercise === undefined) return [];
			const lastTime = lastTimeSets(this.history, exercise.id, this.session?.id);
			return [{ ...group, exercise, lastTime }];
		});
	}

	/** The exercises the library offers, by name, without deleted ones. */
	get choices(): readonly Subject[] {
		return this.library.filter((subject) => !subject.archived);
	}

	/**
	 * Logs a set of an exercise, a copy of the one before it once any change to
	 * that one is saved, and starts the rest timer.
	 *
	 * @param subjectId - The exercise.
	 * @param restSeconds - How long the rest timer runs.
	 */
	async addSet(subjectId: SubjectId, restSeconds: number): Promise<void> {
		await this.saving;
		const { tracker, session } = this;
		const exercise = this.library.find((subject) => subject.id === subjectId);
		if (tracker === undefined || session === undefined || exercise === undefined) return;
		const current = this.history.filter(
			(entry) => entry.sessionId === session.id && entry.subjectId === subjectId
		);
		const values = nextSetValues(tracker, exercise, {
			current,
			lastTime: lastTimeSets(this.history, subjectId, session.id)
		});
		const logged = await this.useCases.logEntry.execute({
			trackerId: tracker.id,
			subjectId,
			sessionId: session.id,
			values
		});
		if (!logged.ok) return;
		this.history = [...this.history, logged.value];
		if (current.length > 0)
			this.restEndsAt = this.clock.now() + restSeconds * MILLISECONDS_PER_SECOND;
	}

	/**
	 * Changes a set's values, such as its reps.
	 *
	 * @param set - The set.
	 * @param values - Its new values.
	 */
	changeSet(set: Entry, values: ReadonlyMap<FieldKey, FieldValue>): Promise<void> {
		const change = this.saveChange(set, values);
		this.saving = Promise.all([this.saving, change]);
		return change;
	}

	private async saveChange(set: Entry, values: ReadonlyMap<FieldKey, FieldValue>): Promise<void> {
		const changed = await this.useCases.changeEntry.execute({ id: set.id, values });
		if (!changed.ok) return;
		this.history = this.history.map((entry) => (entry.id === set.id ? changed.value : entry));
	}

	/**
	 * Deletes a set.
	 *
	 * @param set - The set.
	 */
	async deleteSet(set: Entry): Promise<void> {
		await this.useCases.deleteEntry.execute({ id: set.id });
		this.history = this.history.filter((entry) => entry.id !== set.id);
	}

	/** Stops the rest timer. */
	skipRest(): void {
		this.restEndsAt = undefined;
	}

	/**
	 * Finishes the workout.
	 *
	 * @returns The saved workout, or undefined when nothing was logged and it was discarded.
	 */
	async finish(): Promise<FinishedSession | undefined> {
		if (this.session === undefined) return undefined;
		const finished = await this.useCases.finishSession.execute({ id: this.session.id });
		return finished.ok ? finished.value : undefined;
	}

	/** Throws the workout away with its sets. */
	async discard(): Promise<void> {
		if (this.session !== undefined)
			await this.useCases.discardSession.execute({ id: this.session.id });
	}
}
