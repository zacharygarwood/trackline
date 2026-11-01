import type { IdGenerator } from '../../shared/id-generator.ts';
import { createTracker, type Tracker } from '../domain/tracker.ts';
import type { SaveTrackerCommand } from './save-tracker.ts';
import type { Setup, Trackers } from './tracker-ports.ts';

/** The starting trackers, in Home order. */
export interface SeedTrackersCommand {
	readonly trackers: readonly SaveTrackerCommand[];
}

/** What making the starting trackers needs. */
export interface SeedTrackersPorts {
	readonly trackers: Trackers;
	readonly setup: Setup;
	readonly ids: IdGenerator;
}

/** Makes the starting trackers once; later calls, even after deleting them all, do nothing. */
export class SeedTrackers {
	constructor(private readonly ports: SeedTrackersPorts) {}

	/**
	 * @param command - The starting trackers; invalid ones are skipped.
	 * @returns Whether they were made now.
	 */
	async execute(command: SeedTrackersCommand): Promise<boolean> {
		if (await this.ports.setup.isSeeded()) return false;
		const made: Tracker[] = [];
		for (const fields of command.trackers) {
			const tracker = createTracker({
				...fields,
				id: this.ports.ids.next(),
				position: made.length
			});
			if (tracker.ok) made.push(tracker.value);
		}
		await this.ports.trackers.save(made);
		await this.ports.setup.markSeeded();
		return true;
	}
}
