import type { Clock } from '../../src/lib/shared/clock.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { expectOk } from '../support/result.ts';

/** A clock frozen at a chosen instant and date; tests move it explicitly. */
export class FixedClock implements Clock {
	private instant: number;
	private date: LocalDate;

	constructor(instant = 0, date = '2026-10-27') {
		this.instant = instant;
		this.date = expectOk(LocalDate.parse(date));
	}

	now(): number {
		return this.instant;
	}

	today(): LocalDate {
		return this.date;
	}

	/** Moves the clock forward by some milliseconds. */
	advance(milliseconds: number): void {
		this.instant += milliseconds;
	}

	/** Sets the calendar date returned by `today`. */
	setToday(date: string): void {
		this.date = expectOk(LocalDate.parse(date));
	}
}
