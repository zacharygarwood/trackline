import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type {
	TrackerEntryReader,
	TrackerEntryWriter,
	TrackerReader,
	TrackerSetup,
	TrackerWriter
} from '../domain/tracker-repository.ts';
import type { Tracker, TrackerEntry, TrackerEntryId, TrackerId } from '../domain/tracker.ts';
import { trackerEntryMapper, trackerMapper } from './tracker.mapper.ts';
import {
	deleteTracker,
	deleteTrackerEntry,
	FIND_ALL_TRACKERS,
	FIND_TRACKER_SETUP,
	findLatestTrackerEntries,
	findTrackerById,
	findTrackerEntriesSince,
	MARK_TRACKERS_SEEDED,
	saveTracker,
	saveTrackerEntry
} from './trackers.sql.ts';

/** Trackers in the `tracker` table, and whether the starting ones were made. */
export class SqliteTrackerRepository implements TrackerReader, TrackerWriter, TrackerSetup {
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

	/** {@inheritDoc TrackerSetup.isSeeded} */
	async isSeeded(): Promise<boolean> {
		return (await this.database.query(FIND_TRACKER_SETUP)).length > 0;
	}

	/** {@inheritDoc TrackerSetup.markSeeded} */
	async markSeeded(): Promise<void> {
		await this.database.execute(MARK_TRACKERS_SEEDED);
	}
}

/** Values logged to trackers, in the `tracker_entry` table. */
export class SqliteTrackerEntryRepository implements TrackerEntryReader, TrackerEntryWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc TrackerEntryReader.findSince} */
	async findSince(date: LocalDate): Promise<readonly TrackerEntry[]> {
		const rows = await this.database.query(findTrackerEntriesSince(date.toString()));
		return rows.map((row) => requireValidRow(trackerEntryMapper.toDomain(row)));
	}

	/** {@inheritDoc TrackerEntryReader.findLatest} */
	async findLatest(trackerId: TrackerId, limit: number): Promise<readonly TrackerEntry[]> {
		const rows = await this.database.query(findLatestTrackerEntries(trackerId, limit));
		return rows.map((row) => requireValidRow(trackerEntryMapper.toDomain(row)));
	}

	/** {@inheritDoc TrackerEntryWriter.save} */
	async save(entry: TrackerEntry): Promise<void> {
		await this.database.execute(saveTrackerEntry(trackerEntryMapper.toRow(entry)));
	}

	/** {@inheritDoc TrackerEntryWriter.delete} */
	async delete(id: TrackerEntryId): Promise<void> {
		await this.database.execute(deleteTrackerEntry(id));
	}
}
