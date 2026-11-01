import { Dimension, FieldType } from './tracking.constants.ts';
import { createField, type Field, type FieldDraft } from './field.ts';
import type { TrackerId } from './ids.ts';
import type { TemplateField, TemplateKey, TemplateUnit } from './template.constants.ts';
import type { Template, TemplateFieldDefinition } from './template.ts';
import { TEMPLATES } from './templates.ts';
import type { TrackerDraft } from './tracker.ts';

/** The words a template needs from the messages: the tracker's name, and each field's label and unit. */
export interface TemplateText {
	readonly name: string;
	label(field: TemplateField): string;
	unit(unit: TemplateUnit): string;
}

/** Where a new tracker goes: its id and its place on Home. */
export interface Placement {
	readonly id: TrackerId;
	readonly position: number;
}

function fieldDraft(definition: TemplateFieldDefinition, text: TemplateText): FieldDraft {
	const label = text.label(definition.key);
	if (definition.type !== FieldType.number) return { ...definition, label };
	const unit =
		definition.dimension === Dimension.plain && definition.unit !== undefined
			? text.unit(definition.unit)
			: '';
	return { ...definition, label, unit };
}

/**
 * The template with a key.
 *
 * @param key - The template's key.
 * @throws Error when no template has the key, which is a programmer error.
 */
export function templateOf(key: TemplateKey): Template {
	const template = TEMPLATES.find((candidate) => candidate.key === key);
	if (template === undefined) throw new Error(`No template: ${key}`);
	return template;
}

/**
 * A new tracker from a template, in the user's words, ready for `createTracker`.
 *
 * @param template - The template.
 * @param placement - The new tracker's id and place on Home.
 * @param text - The tracker's name and its fields' labels and units.
 */
export function draftFromTemplate(
	template: Template,
	placement: Placement,
	text: TemplateText
): TrackerDraft {
	return {
		...placement,
		name: text.name,
		icon: template.icon,
		kind: template.kind,
		fields: template.fields.map((definition) => fieldDraft(definition, text)),
		goal: template.goal
	};
}

/**
 * A template's fields in the user's words, checked, such as for setting a goal
 * before the tracker exists.
 *
 * @param template - The template.
 * @param text - The fields' labels and units.
 */
export function fieldsOfTemplate(template: Template, text: TemplateText): readonly Field[] {
	return template.fields.flatMap((definition) => {
		const field = createField(fieldDraft(definition, text));
		return field.ok ? [field.value] : [];
	});
}
