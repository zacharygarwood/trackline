import type { WeekStart } from '../../shared/week-start.constants.ts';

/** Reads the day the user's weeks begin on. */
export interface WeekStartReader {
	/** The chosen day, or undefined if the user hasn't chosen one yet. */
	read(): Promise<WeekStart | undefined>;
}

/** Stores the day the user's weeks begin on. */
export interface WeekStartWriter {
	/** Remembers the day. */
	write(weekStart: WeekStart): Promise<void>;
}
