import type { WeekStart } from '../../shared/week-start.constants.ts';
import type { WeekStartWriter } from '../domain/week-start-preference.ts';

/** The day the user picked. */
export interface SetWeekStartCommand {
	readonly weekStart: WeekStart;
}

/** Changes the day calendar weeks begin on. */
export class SetWeekStart {
	constructor(private readonly preference: WeekStartWriter) {}

	/** @param command - The first day of the week from now on. */
	async execute(command: SetWeekStartCommand): Promise<void> {
		await this.preference.write(command.weekStart);
	}
}
