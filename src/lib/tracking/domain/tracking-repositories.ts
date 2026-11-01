import type { LocalDate } from '../../shared/local-date.ts';
import type { Entry } from './entry.ts';
import type { EntryId, SessionId, SubjectId, TrackerId } from './ids.ts';
import type { Session } from './session.ts';
import type { Subject } from './subject.ts';
import type { Tracker } from './tracker.ts';

/** Reads trackers. */
export interface TrackerReader {
	/** Every tracker, in Home order. */
	findAll(): Promise<readonly Tracker[]>;
	/** A tracker by id. */
	findById(id: TrackerId): Promise<Tracker | undefined>;
}

/** Stores and removes trackers. */
export interface TrackerWriter {
	/** Stores trackers, replacing earlier versions; saving several at once keeps their order consistent. */
	save(trackers: readonly Tracker[]): Promise<void>;
	/** Removes a tracker with its library, sessions, and entries. */
	delete(id: TrackerId): Promise<void>;
}

/** Reads the things in trackers' libraries. */
export interface SubjectReader {
	/** A tracker's library, deleted things included, by name. */
	findFor(trackerId: TrackerId): Promise<readonly Subject[]>;
	/** A thing by id. */
	findById(id: SubjectId): Promise<Subject | undefined>;
}

/** Stores things in trackers' libraries. */
export interface SubjectWriter {
	/** Stores things, replacing earlier versions. */
	save(subjects: readonly Subject[]): Promise<void>;
}

/** Reads logged entries. */
export interface EntryReader {
	/** Every entry of every tracker on or after a day, oldest first. */
	findSince(date: LocalDate): Promise<readonly Entry[]>;
	/** Every entry of one tracker, oldest first. */
	findFor(trackerId: TrackerId): Promise<readonly Entry[]>;
	/** An entry by id. */
	findById(id: EntryId): Promise<Entry | undefined>;
}

/** Stores and removes logged entries. */
export interface EntryWriter {
	/** Stores an entry, replacing one with the same id. */
	save(entry: Entry): Promise<void>;
	/** Removes an entry; does nothing if it doesn't exist. */
	delete(id: EntryId): Promise<void>;
}

/** Reads sessions, such as workouts. */
export interface SessionReader {
	/** Every session of one tracker, newest first. */
	findFor(trackerId: TrackerId): Promise<readonly Session[]>;
	/** A session by id. */
	findById(id: SessionId): Promise<Session | undefined>;
}

/** Stores and removes sessions. */
export interface SessionWriter {
	/** Stores a session, replacing one with the same id. */
	save(session: Session): Promise<void>;
	/** Removes a session and its entries. */
	delete(id: SessionId): Promise<void>;
}
