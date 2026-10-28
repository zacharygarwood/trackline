import type { LocalDate } from '../../shared/local-date.ts';
import { goalsOn, type DailyGoals } from '../domain/daily-goals.ts';
import type { DailyGoalsReader } from '../domain/nutrition-repositories.ts';

/** The day to read goals for. */
export interface GetDailyGoalsCommand {
	readonly date: LocalDate;
}

/** Reads the goals in effect on a day. */
export class GetDailyGoals {
	constructor(private readonly goals: DailyGoalsReader) {}

	/** @returns The goals in effect, or undefined if none were set by then. */
	async execute(command: GetDailyGoalsCommand): Promise<DailyGoals | undefined> {
		return goalsOn(await this.goals.findAll(), command.date);
	}
}
