import type { Clock } from '../../shared/clock.ts';
import { isId } from '../../shared/id.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import type { DeleteEntry, ListEntries, LogEntry, RestoreEntry } from '../application/entries.ts';
import type { ListSubjects } from '../application/library.ts';
import type { ListSessions, StartSession, TrackerSessions } from '../application/sessions.ts';
import type { GetTracker } from '../application/trackers.ts';
import type { Entry } from '../domain/entry.ts';
import { progressOf, type Progress } from '../domain/goal.ts';
import type { ActiveSession } from '../domain/session.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { FieldType, KIND_RULES, SubjectUse } from '../domain/tracking.constants.ts';
import { onlyValue } from './entry-drafts.ts';

/** The use cases a tracker's page calls. */
export interface TrackerScreenUseCases {
	readonly getTracker: GetTracker;
	readonly listEntries: ListEntries;
	readonly listSubjects: ListSubjects;
	readonly listSessions: ListSessions;
	readonly logEntry: LogEntry;
	readonly deleteEntry: DeleteEntry;
	readonly restoreEntry: RestoreEntry;
	readonly startSession: StartSession;
}

const NO_SESSIONS: TrackerSessions = { active: undefined, finished: [] };

/**
 * Whether a tracker is a single check, like vitamins, so its page logs with
 * one tap instead of opening a form.
 *
 * @param tracker - The tracker.
 */
export function isOneTap(tracker: Tracker): boolean {
	const [only] = tracker.fields;
	return tracker.fields.length === 1 && only?.type === FieldType.check;
}

/** State and actions of a tracker's page: its progress, history, library, and sessions. */
export class TrackerScreen {
	tracker: Tracker | undefined = $state();
	/** Newest first. */
	entries: readonly Entry[] = $state([]);
	subjects: readonly Subject[] = $state([]);
	sessions: TrackerSessions = $state(NO_SESSIONS);

	constructor(
		private readonly useCases: TrackerScreenUseCases,
		private readonly clock: Clock,
		private readonly weekStart: WeekStart
	) {}

	/**
	 * Reads the tracker and everything its page shows.
	 *
	 * @param id - The tracker's id, from page state.
	 * @returns Whether the tracker exists.
	 */
	async load(id: string | undefined): Promise<boolean> {
		if (id === undefined || !isId<'Tracker'>(id)) return false;
		const tracker = await this.useCases.getTracker.execute({ id });
		if (tracker === undefined) return false;
		const rules = KIND_RULES[tracker.kind];
		const [entries, subjects, sessions] = await Promise.all([
			this.useCases.listEntries.execute({ trackerId: id }),
			rules.subjects === SubjectUse.none
				? []
				: this.useCases.listSubjects.execute({ trackerId: id }),
			rules.sessions ? this.useCases.listSessions.execute({ trackerId: id }) : NO_SESSIONS
		]);
		this.tracker = tracker;
		this.entries = entries;
		this.subjects = subjects;
		this.sessions = sessions;
		return true;
	}

	/** How far the tracker is toward its goal, if it has one. */
	get progress(): Progress | undefined {
		const goal = this.tracker?.goal;
		if (goal === undefined) return undefined;
		const history = { entries: this.entries, sessions: [...this.sessions.finished] };
		return progressOf(goal, history, { today: this.clock.today(), weekStart: this.weekStart });
	}

	/** Today's entries, oldest first. */
	get today(): readonly Entry[] {
		const today = this.clock.today();
		return this.entries.filter((entry) => entry.date.equals(today)).toReversed();
	}

	/**
	 * The newest entry about a thing in the library.
	 *
	 * @param subject - The thing.
	 */
	latestAbout(subject: Subject): Entry | undefined {
		return this.entries.find((entry) => entry.subjectId === subject.id);
	}

	/**
	 * Whether a check was logged today, for the tracker or for one thing in its library.
	 *
	 * @param subject - The thing, such as a plant.
	 */
	checkedToday(subject?: Subject): boolean {
		const field = this.tracker?.fields.find((candidate) => candidate.type === FieldType.check);
		return this.today.some(
			(entry) =>
				entry.subjectId === subject?.id && field !== undefined && entry.values.has(field.key)
		);
	}

	/**
	 * Logs the tracker's check for today, once, such as vitamins taken or a plant watered.
	 *
	 * @param subject - The thing it is about, for a collection.
	 */
	async check(subject?: Subject): Promise<Entry | undefined> {
		const tracker = this.tracker;
		const field = tracker?.fields.find((candidate) => candidate.type === FieldType.check);
		if (tracker === undefined || field === undefined || this.checkedToday(subject))
			return undefined;
		const logged = await this.useCases.logEntry.execute({
			trackerId: tracker.id,
			subjectId: subject?.id,
			values: onlyValue(field.key, { type: FieldType.check })
		});
		if (!logged.ok) return undefined;
		this.entries = [logged.value, ...this.entries];
		return logged.value;
	}

	/**
	 * The entries about one thing in the library, newest first.
	 *
	 * @param subject - The thing.
	 */
	entriesAbout(subject: Subject): readonly Entry[] {
		return this.entries.filter((entry) => entry.subjectId === subject.id);
	}

	/** Starts a session, or picks up the one under way. */
	async startSession(): Promise<ActiveSession | undefined> {
		const tracker = this.tracker;
		if (tracker === undefined) return undefined;
		const started = await this.useCases.startSession.execute({ trackerId: tracker.id });
		return started.ok ? started.value : undefined;
	}

	/**
	 * Deletes an entry, returning how to undo it unless it held photos.
	 *
	 * @param entry - The entry.
	 */
	async remove(entry: Entry): Promise<(() => Promise<void>) | undefined> {
		const removed = await this.useCases.deleteEntry.execute({ id: entry.id });
		this.entries = this.entries.filter((candidate) => candidate.id !== entry.id);
		if (
			removed === undefined ||
			[...removed.values.values()].some((value) => value.type === FieldType.photo)
		)
			return undefined;
		return async () => {
			await this.useCases.restoreEntry.execute({ entry: removed });
			this.entries = [removed, ...this.entries].toSorted(
				(one, other) => other.loggedAt - one.loggedAt
			);
		};
	}
}
