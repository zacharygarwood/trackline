import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { Entry } from '../domain/entry.ts';
import type { EntryId, SessionId, SubjectId, TrackerId } from '../domain/ids.ts';
import type { Session } from '../domain/session.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import type {
	EntryReader,
	EntryWriter,
	SessionReader,
	SessionWriter,
	SubjectReader,
	SubjectWriter,
	TrackerReader,
	TrackerWriter
} from '../domain/tracking-repositories.ts';
import { entryMapper, sessionMapper, subjectMapper, trackerMapper } from './tracking.mapper.ts';
import {
	deleteEntry,
	deleteSession,
	deleteTracker,
	FIND_ALL_TRACKERS,
	findEntriesFor,
	findEntriesSince,
	findEntryById,
	findSessionById,
	findSessionsFor,
	findSubjectById,
	findSubjectsFor,
	findTrackerById,
	saveEntry,
	saveSession,
	saveSubject,
	saveTracker
} from './tracking.sql.ts';

/** Trackers in the `tracker` table. */
export class SqliteTrackerRepository implements TrackerReader, TrackerWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc TrackerReader.findAll} */
	async findAll(): Promise<readonly Tracker[]> {
		const rows = await this.database.query(FIND_ALL_TRACKERS);
		return rows.map((row) => requireValidRow(trackerMapper.toDomain(row)));
	}

	/** {@inheritDoc TrackerReader.findById} */
	async findById(id: TrackerId): Promise<Tracker | undefined> {
		const row = first(await this.database.query(findTrackerById(id)));
		return row === undefined ? undefined : requireValidRow(trackerMapper.toDomain(row));
	}

	/** {@inheritDoc TrackerWriter.save} */
	async save(trackers: readonly Tracker[]): Promise<void> {
		await this.database.transaction(
			trackers.map((tracker) => saveTracker(trackerMapper.toRow(tracker)))
		);
	}

	/** {@inheritDoc TrackerWriter.delete} */
	async delete(id: TrackerId): Promise<void> {
		await this.database.execute(deleteTracker(id));
	}
}

/** The things in libraries, in the `subject` table. */
export class SqliteSubjectRepository implements SubjectReader, SubjectWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc SubjectReader.findFor} */
	async findFor(trackerId: TrackerId): Promise<readonly Subject[]> {
		const rows = await this.database.query(findSubjectsFor(trackerId));
		return rows.map((row) => requireValidRow(subjectMapper.toDomain(row)));
	}

	/** {@inheritDoc SubjectReader.findById} */
	async findById(id: SubjectId): Promise<Subject | undefined> {
		const row = first(await this.database.query(findSubjectById(id)));
		return row === undefined ? undefined : requireValidRow(subjectMapper.toDomain(row));
	}

	/** {@inheritDoc SubjectWriter.save} */
	async save(subjects: readonly Subject[]): Promise<void> {
		await this.database.transaction(
			subjects.map((subject) => saveSubject(subjectMapper.toRow(subject)))
		);
	}
}

/** Sessions, such as workouts, in the `session` table. */
export class SqliteSessionRepository implements SessionReader, SessionWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc SessionReader.findFor} */
	async findFor(trackerId: TrackerId): Promise<readonly Session[]> {
		const rows = await this.database.query(findSessionsFor(trackerId));
		return rows.map((row) => requireValidRow(sessionMapper.toDomain(row)));
	}

	/** {@inheritDoc SessionReader.findById} */
	async findById(id: SessionId): Promise<Session | undefined> {
		const row = first(await this.database.query(findSessionById(id)));
		return row === undefined ? undefined : requireValidRow(sessionMapper.toDomain(row));
	}

	/** {@inheritDoc SessionWriter.save} */
	async save(session: Session): Promise<void> {
		await this.database.execute(saveSession(sessionMapper.toRow(session)));
	}

	/** {@inheritDoc SessionWriter.delete} */
	async delete(id: SessionId): Promise<void> {
		await this.database.execute(deleteSession(id));
	}
}

/** Logged entries, in the `entry` table. */
export class SqliteEntryRepository implements EntryReader, EntryWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc EntryReader.findSince} */
	async findSince(date: LocalDate): Promise<readonly Entry[]> {
		const rows = await this.database.query(findEntriesSince(date.toString()));
		return rows.map((row) => requireValidRow(entryMapper.toDomain(row)));
	}

	/** {@inheritDoc EntryReader.findFor} */
	async findFor(trackerId: TrackerId): Promise<readonly Entry[]> {
		const rows = await this.database.query(findEntriesFor(trackerId));
		return rows.map((row) => requireValidRow(entryMapper.toDomain(row)));
	}

	/** {@inheritDoc EntryReader.findById} */
	async findById(id: EntryId): Promise<Entry | undefined> {
		const row = first(await this.database.query(findEntryById(id)));
		return row === undefined ? undefined : requireValidRow(entryMapper.toDomain(row));
	}

	/** {@inheritDoc EntryWriter.save} */
	async save(entry: Entry): Promise<void> {
		await this.database.execute(saveEntry(entryMapper.toRow(entry)));
	}

	/** {@inheritDoc EntryWriter.delete} */
	async delete(id: EntryId): Promise<void> {
		await this.database.execute(deleteEntry(id));
	}
}
