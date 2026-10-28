import type { LocalDate } from '../../shared/local-date.ts';
import type { RestDay } from './rest-day.ts';

/** Reads rest days. */
export interface RestDayReader {
	/** The rest day on a date, if any. */
	findByDate(date: LocalDate): Promise<RestDay | undefined>;
	/** Every rest day's date. */
	findAllDates(): Promise<readonly LocalDate[]>;
}

/** Stores and removes rest days. */
export interface RestDayWriter {
	/** Marks a date as a rest day. */
	save(restDay: RestDay): Promise<void>;
	/** Removes the rest day on a date, if any. */
	deleteOn(date: LocalDate): Promise<void>;
}
