import type { IdGenerator } from '../../shared/id-generator.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { DayHasWorkout, type RestDay } from '../domain/rest-day.ts';
import type { WorkoutReader } from '../domain/workout-repository.ts';
import type { RestDays } from './training-ports.ts';

/** The day to rest. */
export interface RestDayCommand {
	readonly date: LocalDate;
}

/** What marking a rest day needs. */
export interface MarkRestDayPorts {
	readonly restDays: RestDays;
	readonly workouts: WorkoutReader;
	readonly ids: IdGenerator;
}

/** Marks a day as a rest day, which keeps the training streak alive. A day with a workout already counts. */
export class MarkRestDay {
	constructor(private readonly ports: MarkRestDayPorts) {}

	/** @param command - The day. */
	async execute(command: RestDayCommand): Promise<Result<RestDay, DayHasWorkout>> {
		const { restDays, workouts, ids } = this.ports;
		const trained = await workouts.findTrainedDates();
		if (trained.some((date) => date.equals(command.date)))
			return err(new DayHasWorkout(command.date));
		const existing = await restDays.findByDate(command.date);
		if (existing !== undefined) return ok(existing);
		const restDay: RestDay = { id: ids.next(), date: command.date };
		await restDays.save(restDay);
		return ok(restDay);
	}
}
