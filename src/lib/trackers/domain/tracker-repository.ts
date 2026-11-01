import type { LocalDate } from '../../shared/local-date.ts';
import type { Tracker, TrackerEntry, TrackerEntryId, TrackerId } from './tracker.ts';

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
	/** Removes a tracker and everything logged to it. */
	delete(id: TrackerId): Promise<void>;
}

/** Reads values logged to trackers. */
export interface TrackerEntryReader {
	/** Every entry on or after a day, of any tracker, oldest first. */
	findSince(date: LocalDate): Promise<readonly TrackerEntry[]>;
	/** A tracker's latest entries, newest first. */
	findLatest(trackerId: TrackerId, limit: number): Promise<readonly TrackerEntry[]>;
}

/** Stores and removes values logged to trackers. */
export interface TrackerEntryWriter {
	/** Stores an entry, replacing one with the same id. */
	save(entry: TrackerEntry): Promise<void>;
	/** Removes an entry; does nothing if it doesn't exist. */
	delete(id: TrackerEntryId): Promise<void>;
}

/** Remembers whether the starting trackers were made, so deleting them all doesn't bring them back. */
export interface TrackerSetup {
	/** Whether the starting trackers were made. */
	isSeeded(): Promise<boolean>;
	/** Records that the starting trackers were made. */
	markSeeded(): Promise<void>;
}
