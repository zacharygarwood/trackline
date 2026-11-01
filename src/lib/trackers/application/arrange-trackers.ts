import type { TrackerId } from '../domain/tracker.ts';
import type { Trackers } from './tracker-ports.ts';

/** Which way to move a tracker on Home. */
export const TrackerMove = { up: -1, down: 1 } as const;

/** One of the {@link TrackerMove} values. */
export type TrackerMove = (typeof TrackerMove)[keyof typeof TrackerMove];

/** Which tracker to move, and which way. */
export interface MoveTrackerCommand {
	readonly id: TrackerId;
	readonly move: TrackerMove;
}

/** Moves a tracker one place up or down Home; moving past either end changes nothing. */
export class MoveTracker {
	constructor(private readonly trackers: Trackers) {}

	/** @param command - The tracker and direction. */
	async execute(command: MoveTrackerCommand): Promise<void> {
		const order = [...(await this.trackers.findAll())];
		const from = order.findIndex((tracker) => tracker.id === command.id);
		const to = from + command.move;
		if (from < 0 || to < 0 || to >= order.length) return;
		const [moved] = order.splice(from, 1);
		if (moved !== undefined) order.splice(to, 0, moved);
		await this.trackers.save(order.map((tracker, position) => ({ ...tracker, position })));
	}
}

/** Which tracker to delete. */
export interface DeleteTrackerCommand {
	readonly id: TrackerId;
}

/** Removes a tracker and what was logged to it; the rest keep their order. */
export class DeleteTracker {
	constructor(private readonly trackers: Trackers) {}

	/** @param command - The tracker. */
	async execute(command: DeleteTrackerCommand): Promise<void> {
		await this.trackers.delete(command.id);
		const rest = await this.trackers.findAll();
		await this.trackers.save(rest.map((tracker, position) => ({ ...tracker, position })));
	}
}
