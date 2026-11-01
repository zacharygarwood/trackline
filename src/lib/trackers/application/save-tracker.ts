import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, type Result } from '../../shared/result.ts';
import {
	createTracker,
	type InvalidTracker,
	type Tracker,
	type TrackerId
} from '../domain/tracker.ts';
import { TrackerNotFound, type Trackers } from './tracker-ports.ts';

/** A tracker as entered; with an id it changes that tracker, without one it is added last. */
export type SaveTrackerCommand = Omit<Tracker, 'id' | 'position'> & { readonly id?: TrackerId };

/** What saving a tracker needs. */
export interface SaveTrackerPorts {
	readonly trackers: Trackers;
	readonly ids: IdGenerator;
}

/** Adds a tracker at the end of Home, or changes one in place. */
export class SaveTracker {
	constructor(private readonly ports: SaveTrackerPorts) {}

	/** @param command - The tracker as entered. */
	async execute(
		command: SaveTrackerCommand
	): Promise<Result<Tracker, InvalidTracker | TrackerNotFound>> {
		const { id, ...fields } = command;
		const all = await this.ports.trackers.findAll();
		const place = this.placeOf(all, id);
		if (place === undefined) return err(new TrackerNotFound(id ?? this.ports.ids.next()));
		const tracker = createTracker({ ...fields, ...place });
		if (tracker.ok) await this.ports.trackers.save([tracker.value]);
		return tracker;
	}

	/** A new tracker's id and last place, or an existing one's; undefined if that one is gone. */
	private placeOf(
		all: readonly Tracker[],
		id: TrackerId | undefined
	): Pick<Tracker, 'id' | 'position'> | undefined {
		if (id === undefined) return { id: this.ports.ids.next(), position: all.length };
		const existing = all.find((tracker) => tracker.id === id);
		return existing === undefined ? undefined : { id, position: existing.position };
	}
}
