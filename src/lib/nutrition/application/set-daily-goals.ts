import type { Clock } from '../../shared/clock.ts';
import type { Result } from '../../shared/result.ts';
import { createDailyGoals, type DailyGoals } from '../domain/daily-goals.ts';
import type { InvalidMacros, Macros } from '../domain/macros.ts';
import type { DailyGoalsWriter } from '../domain/nutrition-repositories.ts';

/** The new daily targets. */
export interface SetDailyGoalsCommand {
	readonly targets: Macros;
}

/** Sets new daily targets from today on; earlier days keep the goals they had. */
export class SetDailyGoals {
	constructor(
		private readonly goals: DailyGoalsWriter,
		private readonly clock: Clock
	) {}

	/** @param command - The targets. */
	async execute(command: SetDailyGoalsCommand): Promise<Result<DailyGoals, InvalidMacros>> {
		const goals = createDailyGoals({ targets: command.targets, effectiveFrom: this.clock.today() });
		if (goals.ok) await this.goals.save(goals.value);
		return goals;
	}
}
