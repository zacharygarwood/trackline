import { messages } from '../../i18n/messages.en.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { formatMass, massEntry, parseMassEntry } from '../../ui/format.ts';
import type { ClearWeightGoal } from '../application/clear-weight-goal.ts';
import type { GetWeightGoal } from '../application/get-weight-goal.ts';
import type { SetWeightGoal } from '../application/set-weight-goal.ts';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import type { WeightGoal } from '../domain/weight-goal.ts';
import { weightOutOfRangeMessage } from './weight-messages.ts';

/** The use cases the goal editor calls. */
export interface WeightGoalEditorUseCases {
	readonly getWeightGoal: GetWeightGoal;
	readonly setWeightGoal: SetWeightGoal;
	readonly clearWeightGoal: ClearWeightGoal;
}

/** Label for each goal direction. */
export const DIRECTION_LABELS: Readonly<Record<GoalDirection, string>> = {
	[GoalDirection.lose]: messages.body.lose,
	[GoalDirection.gain]: messages.body.gain,
	[GoalDirection.maintain]: messages.body.maintain
};

/** State and actions for viewing, setting, and removing the weight goal. */
export class WeightGoalEditor {
	goal: WeightGoal | undefined = $state();

	constructor(private readonly useCases: WeightGoalEditorUseCases) {}

	/** Loads the active goal. */
	async load(): Promise<void> {
		this.goal = await this.useCases.getWeightGoal.execute();
	}

	/**
	 * The goal in words, for example "75.0 kg, Lose".
	 *
	 * @param unit - The unit to show the target in.
	 */
	describe(unit: MassUnit): string {
		if (this.goal === undefined) return messages.body.noGoal;
		return messages.body.goalSummary(
			formatMass(this.goal.target, unit),
			DIRECTION_LABELS[this.goal.direction]
		);
	}

	/** @param unit - The unit for the number pad's starting value. */
	suggestion(unit: MassUnit): string {
		return this.goal === undefined ? '' : massEntry(this.goal.target, unit);
	}

	/**
	 * Sets the goal from a number pad entry.
	 *
	 * @returns A message to show if the entry was rejected.
	 */
	async save(entry: string, direction: GoalDirection, unit: MassUnit): Promise<string | undefined> {
		const target = parseMassEntry(entry, unit);
		if (!target.ok) return messages.body.enterWeight;
		const result = await this.useCases.setWeightGoal.execute({ target: target.value, direction });
		if (!result.ok) return weightOutOfRangeMessage(unit);
		this.goal = result.value;
		return undefined;
	}

	/**
	 * Sets the goal if a target was typed; a blank entry sets nothing.
	 *
	 * @returns A message to show if the entry was rejected.
	 */
	saveIfFilled(
		entry: string,
		direction: GoalDirection,
		unit: MassUnit
	): Promise<string | undefined> {
		return entry.trim() === '' ? Promise.resolve(undefined) : this.save(entry, direction, unit);
	}

	/** Removes the goal. */
	async remove(): Promise<void> {
		await this.useCases.clearWeightGoal.execute();
		this.goal = undefined;
	}
}
