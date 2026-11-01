import type { Goal } from './goal.ts';
import {
	TemplateField,
	type BasicKey,
	type StarterExercise,
	type TemplateGroup,
	type TemplateKey,
	type TemplateUnit
} from './template.constants.ts';
import { Dimension, FieldType, type TrackerIcon, type TrackerKind } from './tracking.constants.ts';

/** A field a template starts with; its label comes from the messages by its key. */
export type TemplateFieldDefinition = {
	readonly key: TemplateField;
	readonly required: boolean;
} & (
	| {
			readonly type: typeof FieldType.number;
			readonly dimension: typeof Dimension.plain;
			/** The unit label, or undefined for a bare amount the tracker's name explains. */
			readonly unit: TemplateUnit | undefined;
	  }
	| {
			readonly type: typeof FieldType.number;
			readonly dimension: typeof Dimension.mass | typeof Dimension.distance;
	  }
	| {
			readonly type:
				| typeof FieldType.duration
				| typeof FieldType.rating
				| typeof FieldType.check
				| typeof FieldType.note
				| typeof FieldType.photo;
	  }
);

/** A thing a template's library starts with, and the fields its entries fill. */
export interface StarterSubject {
	readonly key: StarterExercise;
	readonly fields: readonly TemplateField[];
}

/**
 * A ready-made tracker: its kind, icon, fields, a sensible goal, and a starting
 * library. A template in the basic group is a plain building block the user names.
 */
export interface Template {
	readonly key: TemplateKey;
	readonly group: TemplateGroup;
	readonly kind: TrackerKind;
	readonly icon: TrackerIcon;
	readonly fields: readonly TemplateFieldDefinition[];
	/** A sensible goal to start with, so its bar on Home has something to fill toward. */
	readonly goal: Goal;
	readonly starters: readonly StarterSubject[];
}

/** A basic template, which the user names before it is added. */
export interface BasicTemplate extends Template {
	readonly key: BasicKey;
}

/** Marks a template field optional. */
export const optional = { required: false } as const;

/** Marks a template field required. */
export const required = { required: true } as const;

/** An optional note. */
export const note = { key: TemplateField.note, type: FieldType.note, ...optional } as const;

/**
 * A plain number field.
 *
 * @param key - The field's key.
 * @param unit - Its unit label, or undefined for a bare amount.
 * @param isRequired - Whether every entry needs it.
 */
export function plain(
	key: TemplateField,
	unit: TemplateUnit | undefined,
	isRequired = false
): TemplateFieldDefinition {
	return { key, type: FieldType.number, dimension: Dimension.plain, unit, required: isRequired };
}
