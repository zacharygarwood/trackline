import type { LocalDate } from '../../shared/local-date.ts';
import type { RestDayId } from './ids.ts';

/** A day the user chose not to train. It keeps the training streak going. One per date. */
export interface RestDay {
	readonly id: RestDayId;
	readonly date: LocalDate;
}

/** Raised when marking a rest day on a date that already has a workout. */
export class DayHasWorkout {
	/** @param date - The date that has a workout. */
	constructor(readonly date: LocalDate) {}
}
