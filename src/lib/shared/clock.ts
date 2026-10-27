import type { LocalDate } from './local-date.ts';

/**
 * The source of the current time. Inject it instead of reading the system
 * clock, so code that depends on "now" or "today" is testable.
 */
export interface Clock {
	/** The current instant in epoch milliseconds. */
	now(): number;
	/** The current calendar date in the user's time zone. */
	today(): LocalDate;
}
