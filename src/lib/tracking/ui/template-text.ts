import { messages } from '../../i18n/messages.en.ts';
import type { TemplatePick } from '../application/trackers.ts';
import type { TemplateText } from '../domain/from-template.ts';
import type { Goal } from '../domain/goal.ts';
import type { Template } from '../domain/template.ts';

/**
 * A template's tracker name, field labels, and units in the user's language.
 *
 * @param template - The template.
 * @param name - The name the user gave it; the template's own unless given.
 */
export function templateText(
	template: Template,
	name: string = messages.tracking.templates[template.key]
): TemplateText {
	return {
		name,
		label: (field) => messages.tracking.fields[field],
		unit: (unit) => messages.tracking.units[unit]
	};
}

/**
 * A template ready to add, with its starting library named and a goal.
 *
 * @param template - The template.
 * @param goal - The goal to start with; the template's own unless given.
 * @param name - The tracker's name; the template's own unless given.
 */
export function templatePick(
	template: Template,
	goal: Goal | undefined = template.goal,
	name?: string
): TemplatePick {
	return {
		template,
		text: templateText(template, name),
		goal,
		starterNames: template.starters.map((starter) => messages.tracking.starters[starter.key])
	};
}
