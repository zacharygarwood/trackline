import type { Clock } from '../shared/clock.ts';

/** How often running timers redraw, in milliseconds. */
const TICK_MILLISECONDS = 1000;

/** The current time, updated every second while started, for workout and rest timers. */
export class Ticker {
	now: number = $state(0);

	constructor(private readonly clock: Clock) {
		this.now = clock.now();
	}

	/**
	 * Starts ticking.
	 *
	 * @param onTick - Called after each update.
	 * @returns A function that stops ticking.
	 */
	start(onTick?: () => void): () => void {
		const timer = setInterval(() => {
			this.now = this.clock.now();
			onTick?.();
		}, TICK_MILLISECONDS);
		return () => {
			clearInterval(timer);
		};
	}
}
