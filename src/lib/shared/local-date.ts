import { err, ok, type Result } from './result.ts';

const MIN_YEAR = 1000;
const MAX_YEAR = 9999;
const MONTHS_PER_YEAR = 12;
const TWO_DIGITS = 2;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The year, month (1–12), and day of month of a calendar date. */
export interface DateParts {
	readonly year: number;
	readonly month: number;
	readonly day: number;
}

/** Raised when text or parts do not describe a real calendar date. */
export class InvalidLocalDate {
	/** @param input - What was rejected, for debugging. */
	constructor(readonly input: string) {}
}

/**
 * A calendar date in the user's time zone, with no time of day.
 *
 * All "per day" logic (one weigh-in per day, streaks, daily totals) uses
 * `LocalDate`, so a late-night entry never drifts into the next UTC day.
 */
export class LocalDate {
	private constructor(
		readonly year: number,
		readonly month: number,
		readonly day: number
	) {}

	/**
	 * Parses a date written as `YYYY-MM-DD`.
	 *
	 * @param text - The date text, for example `2026-10-27`.
	 */
	static parse(text: string): Result<LocalDate, InvalidLocalDate> {
		const match = DATE_PATTERN.exec(text);
		if (match === null) return err(new InvalidLocalDate(text));
		const [, year, month, day] = match.map(Number);
		return LocalDate.of({ year: year ?? 0, month: month ?? 0, day: day ?? 0 });
	}

	/**
	 * Builds a date from its parts, rejecting days that do not exist.
	 *
	 * @param parts - Year, month (1–12), and day of month.
	 */
	static of(parts: DateParts): Result<LocalDate, InvalidLocalDate> {
		const { year, month, day } = parts;
		const valid =
			Number.isInteger(year) &&
			year >= MIN_YEAR &&
			year <= MAX_YEAR &&
			isMonth(month) &&
			Number.isInteger(day) &&
			day >= 1 &&
			day <= daysInMonth(year, month);
		return valid
			? ok(new LocalDate(year, month, day))
			: err(new InvalidLocalDate(`${String(year)}-${String(month)}-${String(day)}`));
	}

	/**
	 * The date a number of days later, or earlier when negative.
	 *
	 * @param days - Whole days to add.
	 */
	addDays(days: number): LocalDate {
		const moved = new Date(Date.UTC(this.year, this.month - 1, this.day + days));
		return new LocalDate(moved.getUTCFullYear(), moved.getUTCMonth() + 1, moved.getUTCDate());
	}

	/**
	 * Orders two dates chronologically.
	 *
	 * @returns A negative number if this date is earlier, positive if later, zero if equal.
	 */
	compareTo(other: LocalDate): number {
		return this.toString().localeCompare(other.toString());
	}

	/** Whether this date falls before another. */
	isBefore(other: LocalDate): boolean {
		return this.compareTo(other) < 0;
	}

	/** Whether both dates are the same calendar day. */
	equals(other: LocalDate): boolean {
		return this.compareTo(other) === 0;
	}

	/** The date as `YYYY-MM-DD`. */
	toString(): string {
		return [this.year, this.month, this.day]
			.map((part) => String(part).padStart(TWO_DIGITS, '0'))
			.join('-');
	}
}

function isMonth(month: number): boolean {
	return Number.isInteger(month) && month >= 1 && month <= MONTHS_PER_YEAR;
}

function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
