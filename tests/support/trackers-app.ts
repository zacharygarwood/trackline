import { DeleteTracker, MoveTracker } from '../../src/lib/trackers/application/arrange-trackers.ts';
import { ListTrackerProgress } from '../../src/lib/trackers/application/list-tracker-progress.ts';
import {
	DeleteTrackerEntry,
	ListTrackerEntries,
	LogTrackerEntry,
	RestoreTrackerEntry
} from '../../src/lib/trackers/application/log-tracker-entry.ts';
import { SaveTracker } from '../../src/lib/trackers/application/save-tracker.ts';
import { SeedTrackers } from '../../src/lib/trackers/application/seed-trackers.ts';
import { FixedClock } from '../fakes/fixed-clock.ts';
import {
	InMemoryTrackerEntries,
	InMemoryTrackers,
	InMemoryTrackerSetup
} from '../fakes/in-memory-tracker-repositories.ts';
import { SequentialIdGenerator } from '../fakes/sequential-id-generator.ts';
import { StubTrackerSources } from '../fakes/stub-tracker-sources.ts';

/** Every tracker use case wired to in-memory fakes and a fixed clock (Thursday, Oct 29, 2026). */
export function trackersApp(clock = new FixedClock(Date.UTC(2026, 9, 29, 9), '2026-10-29')) {
	const ids = new SequentialIdGenerator();
	const entries = new InMemoryTrackerEntries();
	const trackers = new InMemoryTrackers(entries);
	const setup = new InMemoryTrackerSetup();
	const sources = new StubTrackerSources();
	return {
		clock,
		sources,
		saveTracker: new SaveTracker({ trackers, ids }),
		moveTracker: new MoveTracker(trackers),
		deleteTracker: new DeleteTracker(trackers),
		seedTrackers: new SeedTrackers({ trackers, setup, ids }),
		listTrackerProgress: new ListTrackerProgress({ trackers, entries, sources, clock }),
		logTrackerEntry: new LogTrackerEntry({ trackers, entries, clock, ids }),
		deleteTrackerEntry: new DeleteTrackerEntry(entries),
		restoreTrackerEntry: new RestoreTrackerEntry(entries),
		listTrackerEntries: new ListTrackerEntries(entries)
	};
}
