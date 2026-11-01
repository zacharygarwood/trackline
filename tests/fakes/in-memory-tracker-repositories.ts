import type {
	TrackerEntryReader,
	TrackerEntryWriter,
	TrackerReader,
	TrackerSetup,
	TrackerWriter
} from '../../src/lib/trackers/domain/tracker-repository.ts';
import type {
	Tracker,
	TrackerEntry,
	TrackerEntryId,
	TrackerId
} from '../../src/lib/trackers/domain/tracker.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/** Logged values in memory, shared with {@link InMemoryTrackers} so deleting a tracker removes them. */
export class InMemoryTrackerEntries implements TrackerEntryReader, TrackerEntryWriter {
	readonly entries = new Map<TrackerEntryId, TrackerEntry>();

	findSince(date: LocalDate): Promise<readonly TrackerEntry[]> {
		return Promise.resolve(
			[...this.entries.values()]
				.filter((entry) => !entry.date.isBefore(date))
				.toSorted((a, b) => a.date.compareTo(b.date) * 2 + a.id.localeCompare(b.id))
		);
	}

	findLatest(trackerId: TrackerId, limit: number): Promise<readonly TrackerEntry[]> {
		return Promise.resolve(
			[...this.entries.values()]
				.filter((entry) => entry.trackerId === trackerId)
				.toSorted((a, b) => b.date.compareTo(a.date) * 2 + b.id.localeCompare(a.id))
				.slice(0, limit)
		);
	}

	save(entry: TrackerEntry): Promise<void> {
		this.entries.set(entry.id, entry);
		return Promise.resolve();
	}

	delete(id: TrackerEntryId): Promise<void> {
		this.entries.delete(id);
		return Promise.resolve();
	}
}

/** Trackers in memory, in Home order. */
export class InMemoryTrackers implements TrackerReader, TrackerWriter {
	private readonly trackers = new Map<TrackerId, Tracker>();

	constructor(private readonly entries: InMemoryTrackerEntries) {}

	findAll(): Promise<readonly Tracker[]> {
		return Promise.resolve([...this.trackers.values()].toSorted((a, b) => a.position - b.position));
	}

	findById(id: TrackerId): Promise<Tracker | undefined> {
		return Promise.resolve(this.trackers.get(id));
	}

	save(trackers: readonly Tracker[]): Promise<void> {
		for (const tracker of trackers) this.trackers.set(tracker.id, tracker);
		return Promise.resolve();
	}

	delete(id: TrackerId): Promise<void> {
		this.trackers.delete(id);
		for (const entry of this.entries.entries.values()) {
			if (entry.trackerId === id) this.entries.entries.delete(entry.id);
		}
		return Promise.resolve();
	}
}

/** Whether the starting trackers were made, in memory. */
export class InMemoryTrackerSetup implements TrackerSetup {
	private seeded = false;

	isSeeded(): Promise<boolean> {
		return Promise.resolve(this.seeded);
	}

	markSeeded(): Promise<void> {
		this.seeded = true;
		return Promise.resolve();
	}
}
