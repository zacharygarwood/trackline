import type { Clock } from '../../shared/clock.ts';
import { LocalDate } from '../../shared/local-date.ts';

/** The real clock, reading the device's time and time zone. */
export class SystemClock implements Clock {
	/** The current instant in epoch milliseconds. */
	now(): number {
		return Date.now();
	}

	/**
	 * Today's date in the device's time zone.
	 *
	 * @throws If the device reports a date outside the supported years.
	 */
	today(): LocalDate {
		const now = new Date();
		const result = LocalDate.of({
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate()
		});
		if (!result.ok) throw new Error(`Device date is out of range: ${result.error.input}`);
		return result.value;
	}
}
