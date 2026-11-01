import { messages } from '../../i18n/messages.en.ts';
import type { AddTrackers } from '../application/trackers.ts';
import { fieldsOfTemplate, templateOf } from '../domain/from-template.ts';
import type { TemplateKey } from '../domain/template.constants.ts';
import type { Template } from '../domain/template.ts';
import { TEMPLATES } from '../domain/templates.ts';
import type { DisplayUnits } from './display-units.ts';
import { GoalEditor } from './goal-editor.svelte.ts';
import { DEFAULT_PICKS, OnboardingStep } from './onboarding.constants.ts';
import { templatePick, templateText } from './template-text.ts';

/** A picked template and the editor for its goal. */
export interface PickedGoal {
	readonly template: Template;
	readonly editor: GoalEditor;
}

/**
 * State of onboarding: pick what to track, choose units, then check each
 * pick's goal, which starts at the template's sensible default.
 */
export class Onboarding {
	step: OnboardingStep = $state(OnboardingStep.pick);
	picked: readonly TemplateKey[] = $state(DEFAULT_PICKS);
	goals: readonly PickedGoal[] = $state([]);
	problem: string | undefined = $state();

	/**
	 * Picks or unpicks a template.
	 *
	 * @param key - The template.
	 */
	toggle(key: TemplateKey): void {
		this.picked = this.picked.includes(key)
			? this.picked.filter((picked) => picked !== key)
			: [...this.picked, key];
		this.problem = undefined;
	}

	/** Whether a template is picked. */
	isPicked(key: TemplateKey): boolean {
		return this.picked.includes(key);
	}

	/** Goes from picking to units, once something is picked. */
	toUnits(): void {
		if (this.picked.length === 0) {
			this.problem = messages.tracking.onboarding.pickOne;
			return;
		}
		this.step = OnboardingStep.units;
	}

	/**
	 * Goes from units to goals, in the units just chosen.
	 *
	 * @param units - The user's units.
	 */
	toGoals(units: DisplayUnits): void {
		const ordered = TEMPLATES.filter((template) => this.picked.includes(template.key));
		this.goals = ordered.map((template) => {
			const fields = fieldsOfTemplate(template, templateText(template));
			const tracker = { fields, kind: template.kind, goal: template.goal };
			return { template, editor: new GoalEditor(tracker, units) };
		});
		this.step = OnboardingStep.goals;
	}

	/** Goes back a step. */
	back(): void {
		this.step = this.step === OnboardingStep.goals ? OnboardingStep.units : OnboardingStep.pick;
	}

	/**
	 * Adds the picked trackers with their goals.
	 *
	 * @param addTrackers - The use case.
	 * @returns Whether they were added.
	 */
	async finish(addTrackers: AddTrackers): Promise<boolean> {
		const picks = [];
		for (const { template, editor } of this.goals) {
			const goal = editor.goal();
			if (!goal.ok) {
				this.problem = goal.error.message;
				return false;
			}
			picks.push(templatePick(templateOf(template.key), goal.value));
		}
		const added = await addTrackers.execute({ picks });
		if (!added.ok) this.problem = messages.tracking.page.fixProblem;
		return added.ok;
	}
}
