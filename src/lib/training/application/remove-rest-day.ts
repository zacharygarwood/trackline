import type { RestDayWriter } from '../domain/rest-day-repository.ts';
import type { RestDayCommand } from './mark-rest-day.ts';

/** Removes a rest day in one tap. */
export class RemoveRestDay {
	constructor(private readonly restDays: RestDayWriter) {}

	/** @param command - The day. */
	async execute(command: RestDayCommand): Promise<void> {
		await this.restDays.deleteOn(command.date);
	}
}
