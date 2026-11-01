import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import type { ListTrackerProgress } from '../application/list-tracker-progress.ts';
import type {
	DeleteTrackerEntry,
	ListTrackerEntries,
	LogTrackerEntry,
	RestoreTrackerEntry
} from '../application/log-tracker-entry.ts';
import type { Tracker, TrackerEntry } from '../domain/tracker.ts';

/** The use cases a tracker's log page calls. */
export interface TrackerLogUseCases {
	readonly listTrackerProgress: ListTrackerProgress;
	readonly listTrackerEntries: ListTrackerEntries;
	readonly logTrackerEntry: LogTrackerEntry;
	readonly deleteTrackerEntry: DeleteTrackerEntry;
	readonly restoreTrackerEntry: RestoreTrackerEntry;
}

/** State and actions of the page where the user logs to one of their own trackers. */
export class TrackerLog {
	tracker: Tracker | undefined = $state();
	/** This day's or week's value. */
	value = $state(0);
	entries: readonly TrackerEntry[] = $state([]);

	constructor(
		private readonly useCases: TrackerLogUseCases,
		private readonly clock: Clock,
		private readonly weekStart: WeekStart
	) {}

	/**
	 * Loads a tracker and its latest entries.
	 *
	 * @returns Whether the tracker exists.
	 */
	async load(id: string | undefined): Promise<boolean> {
		const progress = await this.useCases.listTrackerProgress.execute({ weekStart: this.weekStart });
		const found = progress.find((item) => item.tracker.id === id);
		if (found === undefined) return false;
		this.tracker = found.tracker;
		this.value = found.value ?? 0;
		this.entries = await this.useCases.listTrackerEntries.execute({ trackerId: found.tracker.id });
		return true;
	}

	/** Today's date, for labelling entries. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** Whether anything was logged today. */
	get loggedToday(): boolean {
		const today = this.clock.today();
		return this.entries.some((entry) => entry.date.equals(today));
	}

	/**
	 * Logs a value for today.
	 *
	 * @returns The entry, or undefined if the value was invalid.
	 */
	async log(value: number): Promise<TrackerEntry | undefined> {
		if (this.tracker === undefined) return undefined;
		const result = await this.useCases.logTrackerEntry.execute({
			trackerId: this.tracker.id,
			value
		});
		await this.load(this.tracker.id);
		return result.ok ? result.value : undefined;
	}

	/** Removes an entry, returning what puts it back. */
	async remove(entry: TrackerEntry): Promise<() => Promise<void>> {
		await this.useCases.deleteTrackerEntry.execute({ id: entry.id });
		await this.load(entry.trackerId);
		return async () => {
			await this.useCases.restoreTrackerEntry.execute({ entry });
			await this.load(entry.trackerId);
		};
	}
}
