const MS_PER_SECOND = 1000;

/** The rest between sets: when it ends and how long it is, in milliseconds. */
interface Rest {
	readonly endsAt: number;
	readonly length: number;
}

/** Counts down the rest after a set. */
export class RestTimer {
	rest: Rest | undefined = $state();

	/** Whether a rest is counting down. */
	get running(): boolean {
		return this.rest !== undefined;
	}

	/**
	 * Starts a rest.
	 *
	 * @param now - The current time, in epoch milliseconds.
	 * @param seconds - How long to rest.
	 */
	start(now: number, seconds: number): void {
		this.rest = { endsAt: now + seconds * MS_PER_SECOND, length: seconds * MS_PER_SECOND };
	}

	/** Seconds left, or zero. */
	left(now: number): number {
		return this.rest === undefined
			? 0
			: Math.max(0, Math.ceil((this.rest.endsAt - now) / MS_PER_SECOND));
	}

	/** How much of the rest is left, from 1 to 0. */
	share(now: number): number {
		return this.rest === undefined ? 0 : Math.max(0, (this.rest.endsAt - now) / this.rest.length);
	}

	/**
	 * Ends a rest whose time is up.
	 *
	 * @returns Whether a rest just ended.
	 */
	tick(now: number): boolean {
		if (this.rest === undefined || now < this.rest.endsAt) return false;
		this.rest = undefined;
		return true;
	}

	/** Stops the rest early. */
	stop(): void {
		this.rest = undefined;
	}
}
