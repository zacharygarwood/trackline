import { messages } from '../../i18n/messages.en.ts';
import type { AddTrackers } from '../application/trackers.ts';
import { renameFields, type FieldRename, type NumberField } from '../domain/field.ts';
import { fieldsOfTemplate } from '../domain/from-template.ts';
import type { BasicTemplate } from '../domain/template.ts';
import type { Tracker } from '../domain/tracker.ts';
import type { DisplayUnits } from './display-units.ts';
import { renamableFields } from './field-renames.ts';
import { GoalEditor } from './goal-editor.svelte.ts';
import { templatePick, templateText } from './template-text.ts';

/** State of naming a new tracker from a basic template, giving its number a unit, and choosing its goal. */
export class NewTracker {
	name = $state('');
	/** The unit typed for {@link unitField}, such as "oz". */
	unit = $state('');
	problem: string | undefined = $state();
	readonly goal: GoalEditor;
	/** The plain number the user can give a unit, if the template has one. */
	readonly unitField: NumberField | undefined;

	/**
	 * @param basic - The basic template, such as Time or Photos.
	 * @param units - The user's units.
	 */
	constructor(
		readonly basic: BasicTemplate,
		units: DisplayUnits
	) {
		const fields = fieldsOfTemplate(basic, templateText(basic));
		this.unitField = renamableFields({ kind: basic.kind, fields }).at(0);
		const renames = () => this.renames();
		this.goal = new GoalEditor(
			{
				kind: basic.kind,
				goal: basic.goal,
				get fields() {
					return renameFields(fields, renames());
				}
			},
			units
		);
	}

	private renames(): FieldRename[] {
		const field = this.unitField;
		return field === undefined ? [] : [{ key: field.key, label: field.label, unit: this.unit }];
	}

	/**
	 * Adds the tracker with its name and goal, or explains what to fix.
	 *
	 * @param addTrackers - The use case.
	 * @returns The new tracker, or undefined when something needs fixing.
	 */
	async add(addTrackers: AddTrackers): Promise<Tracker | undefined> {
		const goal = this.goal.goal();
		if (!goal.ok) {
			this.problem = goal.error.message;
			return undefined;
		}
		const pick = { ...templatePick(this.basic, goal.value, this.name), renames: this.renames() };
		const added = await addTrackers.execute({ picks: [pick] });
		const tracker = added.ok ? added.value.at(0) : undefined;
		this.problem = tracker === undefined ? messages.tracking.add.nameNeeded : undefined;
		return tracker;
	}
}
