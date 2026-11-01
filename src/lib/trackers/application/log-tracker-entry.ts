import type { Clock } from '../../shared/clock.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import {
	checkEntryValue,
	type InvalidEntryValue,
	type TrackerEntry,
	type TrackerEntryId,
	type TrackerId
} from '../domain/tracker.ts';
import { TrackerNotFound, type TrackerEntries, type Trackers } from './tracker-ports.ts';

/** A value to log to one of the user's own trackers today. */
export interface LogTrackerEntryCommand {
	readonly trackerId: TrackerId;
	readonly value: number;
}

/** What logging needs. */
export interface LogTrackerEntryPorts {
	readonly trackers: Trackers;
	readonly entries: TrackerEntries;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

/** Logs a value to a tracker for today. */
export class LogTrackerEntry {
	constructor(private readonly ports: LogTrackerEntryPorts) {}

	/** @param command - The tracker and value. */
	async execute(
		command: LogTrackerEntryCommand
	): Promise<Result<TrackerEntry, TrackerNotFound | InvalidEntryValue>> {
		const tracker = await this.ports.trackers.findById(command.trackerId);
		if (tracker === undefined) return err(new TrackerNotFound(command.trackerId));
		const value = checkEntryValue(tracker, command.value);
		if (!value.ok) return value;
		const entry = {
			id: this.ports.ids.next<'TrackerEntry'>(),
			trackerId: tracker.id,
			date: this.ports.clock.today(),
			value: value.value
		};
		await this.ports.entries.save(entry);
		return ok(entry);
	}
}

/** Which entry to remove. */
export interface DeleteTrackerEntryCommand {
	readonly id: TrackerEntryId;
}

/** Removes a logged value. */
export class DeleteTrackerEntry {
	constructor(private readonly entries: TrackerEntries) {}

	/** @param command - The entry. */
	async execute(command: DeleteTrackerEntryCommand): Promise<void> {
		await this.entries.delete(command.id);
	}
}

/** The entry to put back. */
export interface RestoreTrackerEntryCommand {
	readonly entry: TrackerEntry;
}

/** Puts back a removed value, for undo. */
export class RestoreTrackerEntry {
	constructor(private readonly entries: TrackerEntries) {}

	/** @param command - The entry as it was. */
	async execute(command: RestoreTrackerEntryCommand): Promise<void> {
		await this.entries.save(command.entry);
	}
}

/** Which tracker's entries to list, or the day to list every tracker's entries from. */
export type ListTrackerEntriesCommand =
	{ readonly trackerId: TrackerId } | { readonly since: LocalDate };

/** How many of a tracker's latest entries its page lists. */
export const LATEST_ENTRIES = 30;

/** Lists one tracker's latest entries, newest first, or every entry since a day, for Stats. */
export class ListTrackerEntries {
	constructor(private readonly entries: TrackerEntries) {}

	/** @param command - The tracker, or the first day. */
	execute(command: ListTrackerEntriesCommand): Promise<readonly TrackerEntry[]> {
		return 'trackerId' in command
			? this.entries.findLatest(command.trackerId, LATEST_ENTRIES)
			: this.entries.findSince(command.since);
	}
}
