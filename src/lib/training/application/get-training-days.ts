import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { RestDayReader } from '../domain/rest-day-repository.ts';
import { trainingStreak, type TrainingStreak } from '../domain/training-streak.ts';
import type { WorkoutReader } from '../domain/workout-repository.ts';

/** What happened on one day. */
export interface TrainingDay {
	readonly date: LocalDate;
	readonly trained: boolean;
	readonly rested: boolean;
}

/** The recent days, newest first, and the streak they form. */
export interface TrainingCalendar {
	readonly days: readonly TrainingDay[];
	readonly streak: TrainingStreak;
}

/** How many days back to show. */
export interface GetTrainingDaysCommand {
	readonly days: number;
}

/** What reading the training calendar needs. */
export interface TrainingDaysPorts {
	readonly workouts: WorkoutReader;
	readonly restDays: RestDayReader;
	readonly clock: Clock;
}

/** Lists the recent days with what was done on each, and the current and longest streaks. */
export class GetTrainingDays {
	constructor(private readonly ports: TrainingDaysPorts) {}

	/** @param command - How many days, ending today. */
	async execute(command: GetTrainingDaysCommand): Promise<TrainingCalendar> {
		const { workouts, restDays, clock } = this.ports;
		const today = clock.today();
		const [trained, rested] = await Promise.all([
			workouts.findTrainedDates(),
			restDays.findAllDates()
		]);
		const has = (dates: readonly LocalDate[], date: LocalDate) =>
			dates.some((other) => other.equals(date));
		const days = Array.from({ length: command.days }, (_, back) => {
			const date = today.addDays(-back);
			return { date, trained: has(trained, date), rested: has(rested, date) };
		});
		return { days, streak: trainingStreak({ trained, rested, today }) };
	}
}
