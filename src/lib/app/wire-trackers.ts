import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import { DeleteTracker, MoveTracker } from '../trackers/application/arrange-trackers.ts';
import { ListTrackerProgress } from '../trackers/application/list-tracker-progress.ts';
import {
	DeleteTrackerEntry,
	ListTrackerEntries,
	LogTrackerEntry,
	RestoreTrackerEntry
} from '../trackers/application/log-tracker-entry.ts';
import { SaveTracker } from '../trackers/application/save-tracker.ts';
import { SeedTrackers } from '../trackers/application/seed-trackers.ts';
import {
	SqliteTrackerEntryRepository,
	SqliteTrackerRepository
} from '../trackers/infrastructure/sqlite-tracker-repositories.ts';
import { SqliteTrackerSources } from '../trackers/infrastructure/sqlite-tracker-sources.ts';
import type { Infrastructure } from './infrastructure.ts';

/**
 * Wires the Trackers context: what Home tracks, and what the user logs to their own trackers.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireTrackers(infrastructure: Infrastructure) {
	const { database, clock } = infrastructure;
	const ids = new UuidV7IdGenerator(clock);
	const trackers = new SqliteTrackerRepository(database);
	const entries = new SqliteTrackerEntryRepository(database);
	const sources = new SqliteTrackerSources(database);
	return {
		saveTracker: new SaveTracker({ trackers, ids }),
		moveTracker: new MoveTracker(trackers),
		deleteTracker: new DeleteTracker(trackers),
		seedTrackers: new SeedTrackers({ trackers, setup: trackers, ids }),
		listTrackerProgress: new ListTrackerProgress({ trackers, entries, sources, clock }),
		logTrackerEntry: new LogTrackerEntry({ trackers, entries, clock, ids }),
		deleteTrackerEntry: new DeleteTrackerEntry(entries),
		restoreTrackerEntry: new RestoreTrackerEntry(entries),
		listTrackerEntries: new ListTrackerEntries(entries)
	};
}
