import { ok, type Result } from '../../shared/result.ts';
import {
	parseWeeklyWorkoutGoal,
	type InvalidWeeklyWorkoutGoal,
	type Preferences,
	type PreferencesWriter
} from '../domain/preferences.ts';

/** Changes some preferences. */
export class UpdatePreferences {
	constructor(private readonly preferences: PreferencesWriter) {}

	/**
	 * @param changes - The preferences to change; the others stay as they are.
	 * @returns An error, and nothing saved, if the weekly goal is out of range.
	 */
	async execute(changes: Partial<Preferences>): Promise<Result<void, InvalidWeeklyWorkoutGoal>> {
		if (changes.weeklyWorkoutGoal !== undefined) {
			const goal = parseWeeklyWorkoutGoal(changes.weeklyWorkoutGoal);
			if (!goal.ok) return goal;
		}
		await this.preferences.write(changes);
		return ok(undefined);
	}
}
