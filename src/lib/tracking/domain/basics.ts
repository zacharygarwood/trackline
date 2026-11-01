import { BasicKey, TemplateField, TemplateGroup } from './template.constants.ts';
import {
	note,
	optional,
	plain,
	required,
	type BasicTemplate,
	type Template,
	type TemplateFieldDefinition
} from './template.ts';
import type { Goal } from './goal.ts';
import { daysAWeek } from './goal-parts.ts';
import {
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period,
	TrackerIcon,
	TrackerKind
} from './tracking.constants.ts';

/** A photo with an optional note: the fields of a photo timeline. */
export const PHOTO_FIELDS: readonly TemplateFieldDefinition[] = [
	{ key: TemplateField.photo, type: FieldType.photo, ...required },
	note
];

/** An optional photo and note: the fields of each thing in a collection. */
export const THING_FIELDS: readonly TemplateFieldDefinition[] = [
	{ key: TemplateField.photo, type: FieldType.photo, ...optional },
	note
];

const EVERY_DAY = 7;
const MOST_DAYS = 5;

/**
 * A goal of a number of entries each week, such as one photo a week.
 *
 * @param target - How many entries.
 */
export function timesAWeek(target: number): Goal {
	return {
		type: GoalType.period,
		measure: Measure.entries,
		target,
		direction: Direction.atLeast,
		period: Period.week
	};
}

/** A goal of logging once each day, such as a habit checked off. */
export const ONCE_A_DAY: Goal = { ...daysAWeek(1), period: Period.day };

function basic(
	key: BasicKey,
	look: Pick<Template, 'kind' | 'icon' | 'goal'>,
	fields: readonly TemplateFieldDefinition[]
): BasicTemplate {
	return { key, group: TemplateGroup.basic, ...look, fields, starters: [] };
}

const daily = { kind: TrackerKind.log, goal: daysAWeek(EVERY_DAY) } as const;

/**
 * The basic templates, one per kind of thing to track, each with a plain goal
 * of logging often. The ready-made templates are these building blocks with a
 * name and good defaults.
 */
export const BASICS: readonly BasicTemplate[] = [
	basic(
		BasicKey.photos,
		{ kind: TrackerKind.photos, icon: TrackerIcon.camera, goal: timesAWeek(1) },
		PHOTO_FIELDS
	),
	basic(BasicKey.number, { ...daily, icon: TrackerIcon.hash }, [
		plain(TemplateField.amount, undefined, true),
		note
	]),
	basic(BasicKey.done, { ...daily, icon: TrackerIcon.check, goal: ONCE_A_DAY }, [
		{ key: TemplateField.done, type: FieldType.check, ...required }
	]),
	basic(BasicKey.time, { ...daily, icon: TrackerIcon.clock }, [
		{ key: TemplateField.time, type: FieldType.duration, ...required },
		note
	]),
	basic(BasicKey.rating, { ...daily, icon: TrackerIcon.star }, [
		{ key: TemplateField.rating, type: FieldType.rating, ...required },
		note
	]),
	basic(BasicKey.notes, { ...daily, icon: TrackerIcon.pen, goal: daysAWeek(MOST_DAYS) }, [
		{ ...note, ...required }
	]),
	basic(
		BasicKey.collection,
		{ kind: TrackerKind.collection, icon: TrackerIcon.box, goal: timesAWeek(1) },
		THING_FIELDS
	)
];
