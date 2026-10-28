import { messages } from '../../i18n/messages.en.ts';
import type { Clock } from '../../shared/clock.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { GetDailyGoals } from '../application/get-daily-goals.ts';
import type { SetDailyGoals } from '../application/set-daily-goals.ts';
import type { Macros } from '../domain/macros.ts';

/** A typed number, or NaN so the domain rejects text that isn't one. */
const numberOf = (text: string) => parseDecimal(text) ?? Number.NaN;

/** The use cases the goals editor calls. */
export interface DailyGoalsEditorUseCases {
	readonly getDailyGoals: GetDailyGoals;
	readonly setDailyGoals: SetDailyGoals;
}

/** The four targets as typed into the form. */
export type GoalsForm = Readonly<Record<keyof Macros, string>>;

/** State and actions for editing daily calorie and macro targets. */
export class DailyGoalsEditor {
	targets: Macros | undefined = $state();

	constructor(
		private readonly useCases: DailyGoalsEditorUseCases,
		private readonly clock: Clock
	) {}

	/** Loads today's targets. */
	async load(): Promise<void> {
		this.targets = (await this.useCases.getDailyGoals.execute({ date: this.clock.today() }))
			?.targets;
	}

	/** The form's starting values: today's targets, or empty fields. */
	get form(): GoalsForm {
		const value = (amount: number | undefined) => (amount === undefined ? '' : String(amount));
		return {
			calories: value(this.targets?.calories),
			protein: value(this.targets?.protein),
			carbs: value(this.targets?.carbs),
			fat: value(this.targets?.fat)
		};
	}

	/**
	 * Saves new targets from today on.
	 *
	 * @returns A confirmation, or a message if a value was rejected.
	 */
	async save(form: GoalsForm): Promise<string> {
		const result = await this.useCases.setDailyGoals.execute({
			targets: {
				calories: numberOf(form.calories),
				protein: numberOf(form.protein),
				carbs: numberOf(form.carbs),
				fat: numberOf(form.fat)
			}
		});
		if (!result.ok) return messages.nutrition.checkGoals;
		this.targets = result.value.targets;
		return messages.nutrition.goalsSaved;
	}
}
