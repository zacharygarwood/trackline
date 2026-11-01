import type { Clock } from '../../shared/clock.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, type Result } from '../../shared/result.ts';
import { createEntry, photosOf, type Entry, type InvalidEntry } from '../domain/entry.ts';
import type { FieldKey, FieldValue } from '../domain/field.ts';
import type { EntryId, SessionId, SubjectId, TrackerId } from '../domain/ids.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import type {
	EntryReader,
	EntryWriter,
	SessionReader,
	SubjectReader,
	TrackerReader
} from '../domain/tracking-repositories.ts';
import { SessionState } from '../domain/tracking.constants.ts';
import type { PhotoStore } from './photo-ports.ts';
import {
	EntryNotFound,
	SessionNotFound,
	SubjectNotFound,
	TrackerNotFound
} from './tracking-errors.ts';

/** What to log: the tracker, the values, and what it is about. */
export interface LogEntryCommand {
	readonly trackerId: TrackerId;
	readonly values: ReadonlyMap<FieldKey, FieldValue>;
	readonly subjectId?: SubjectId | undefined;
	/** The workout or other session under way that it belongs to. */
	readonly sessionId?: SessionId | undefined;
	/** The day it counts toward; today unless given. */
	readonly date?: LocalDate | undefined;
}

/** Why an entry could not be logged. */
export type LogEntryProblem = TrackerNotFound | SubjectNotFound | SessionNotFound | InvalidEntry;

/** What logging needs. */
export interface LogEntryPorts {
	readonly trackers: TrackerReader;
	readonly subjects: SubjectReader;
	readonly sessions: SessionReader;
	readonly entries: EntryWriter;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

async function subjectFor(
	subjects: SubjectReader,
	tracker: Tracker,
	id: SubjectId | undefined
): Promise<Result<Subject | undefined, SubjectNotFound>> {
	if (id === undefined) return { ok: true, value: undefined };
	const subject = await subjects.findById(id);
	return subject?.trackerId === tracker.id
		? { ok: true, value: subject }
		: err(new SubjectNotFound(id));
}

async function isActiveSession(
	sessions: SessionReader,
	tracker: Tracker,
	id: SessionId | undefined
): Promise<boolean> {
	if (id === undefined) return true;
	const session = await sessions.findById(id);
	return session?.trackerId === tracker.id && session.state === SessionState.active;
}

/** Logs an entry to a tracker, checked against its fields, library, and session. */
export class LogEntry {
	constructor(private readonly ports: LogEntryPorts) {}

	/** @param command - The tracker, values, and what the entry is about. */
	async execute(command: LogEntryCommand): Promise<Result<Entry, LogEntryProblem>> {
		const { trackers, subjects, sessions, entries, clock, ids } = this.ports;
		const tracker = await trackers.findById(command.trackerId);
		if (tracker === undefined) return err(new TrackerNotFound(command.trackerId));
		const subject = await subjectFor(subjects, tracker, command.subjectId);
		if (!subject.ok) return subject;
		if (
			command.sessionId !== undefined &&
			!(await isActiveSession(sessions, tracker, command.sessionId))
		)
			return err(new SessionNotFound(command.sessionId));
		const draft = {
			id: ids.next<'Entry'>(),
			date: command.date ?? clock.today(),
			loggedAt: clock.now(),
			sessionId: command.sessionId,
			values: command.values
		};
		const entry = createEntry(tracker, draft, subject.value);
		if (entry.ok) await entries.save(entry.value);
		return entry;
	}
}

/** An entry's new values. */
export interface ChangeEntryCommand {
	readonly id: EntryId;
	readonly values: ReadonlyMap<FieldKey, FieldValue>;
}

/** What changing an entry needs. */
export interface ChangeEntryPorts {
	readonly trackers: TrackerReader;
	readonly subjects: SubjectReader;
	readonly entries: EntryReader & EntryWriter;
}

/** Changes the values of a logged entry, such as the reps of a set. */
export class ChangeEntry {
	constructor(private readonly ports: ChangeEntryPorts) {}

	/** @param command - The entry and its values. */
	async execute(
		command: ChangeEntryCommand
	): Promise<Result<Entry, EntryNotFound | TrackerNotFound | InvalidEntry>> {
		const { trackers, subjects, entries } = this.ports;
		const entry = await entries.findById(command.id);
		if (entry === undefined) return err(new EntryNotFound(command.id));
		const tracker = await trackers.findById(entry.trackerId);
		if (tracker === undefined) return err(new TrackerNotFound(entry.trackerId));
		const subject =
			entry.subjectId === undefined ? undefined : await subjects.findById(entry.subjectId);
		const changed = createEntry(tracker, { ...entry, values: command.values }, subject);
		if (changed.ok) await entries.save(changed.value);
		return changed;
	}
}

/** Names one entry. */
export interface EntryCommand {
	readonly id: EntryId;
}

/** What deleting an entry needs. */
export interface DeleteEntryPorts {
	readonly entries: EntryReader & EntryWriter;
	readonly photos: PhotoStore;
}

/**
 * Deletes an entry. An entry without photos can come back with
 * {@link RestoreEntry}; an entry's photos are deleted with it.
 */
export class DeleteEntry {
	constructor(private readonly ports: DeleteEntryPorts) {}

	/**
	 * @param command - The entry.
	 * @returns The entry as it was, or undefined if it was already gone.
	 */
	async execute(command: EntryCommand): Promise<Entry | undefined> {
		const { entries, photos } = this.ports;
		const entry = await entries.findById(command.id);
		if (entry === undefined) return undefined;
		await entries.delete(entry.id);
		await Promise.all(photosOf(entry).map((id) => photos.delete(id)));
		return entry;
	}
}

/** The entry to put back. */
export interface RestoreEntryCommand {
	readonly entry: Entry;
}

/** Puts back a deleted entry, for undo. */
export class RestoreEntry {
	constructor(private readonly entries: EntryWriter) {}

	/** @param command - The entry as it was. */
	async execute(command: RestoreEntryCommand): Promise<void> {
		await this.entries.save(command.entry);
	}
}

/** Which tracker's entries to list, optionally only those about one thing. */
export interface ListEntriesCommand {
	readonly trackerId: TrackerId;
	readonly subjectId?: SubjectId | undefined;
	readonly sessionId?: SessionId | undefined;
}

/** Lists a tracker's entries, newest first, for its history and its library pages. */
export class ListEntries {
	constructor(private readonly entries: EntryReader) {}

	/** @param command - The tracker, and the thing or session to narrow to. */
	async execute(command: ListEntriesCommand): Promise<readonly Entry[]> {
		const all = await this.entries.findFor(command.trackerId);
		return all
			.filter(
				(entry) =>
					(command.subjectId === undefined || entry.subjectId === command.subjectId) &&
					(command.sessionId === undefined || entry.sessionId === command.sessionId)
			)
			.toReversed();
	}
}
