import { WeekStart } from '../../shared/week-start.constants.ts';
import type { WeekStartReader } from '../domain/week-start-preference.ts';

/** Reads the day calendar weeks begin on. */
export class GetWeekStart {
	constructor(private readonly preference: WeekStartReader) {}

	/** @returns The chosen day, or Monday until the user picks one. */
	async execute(): Promise<WeekStart> {
		return (await this.preference.read()) ?? WeekStart.monday;
	}
}
