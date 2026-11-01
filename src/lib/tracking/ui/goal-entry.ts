import { messages } from '../../i18n/messages.en.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { fieldKey, numberOf, type Field, type FieldValue } from '../domain/field.ts';
import { fieldsFor, type GoalParts } from '../domain/goal-parts.ts';
import { Dimension, FieldType, GoalType, Measure } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import { FormProblem, parseDraft, type FieldDraft } from './entry-drafts.ts';

const TARGET_KEY = fieldKey('target');
const HALF_AN_HOUR = 1800;
const MIDDLE_STARS = 3;

/**
 * The input a goal's target is typed into: the field a total, average, or
 * target is of, such as hours of practice, or a plain count of days, times,
 * or workouts. It is required: every tracker has a goal.
 *
 * @param fields - The tracker's fields.
 * @param parts - What the goal counts, and of which field.
 */
export function targetField(
	fields: readonly Field[],
	parts: Pick<GoalParts, 'measure' | 'field'>
): Field {
	const own = fieldsFor(parts.measure, fields).find((field) => field.key === parts.field);
	if (own !== undefined) return { ...own, required: true };
	const unit =
		parts.measure === Measure.days || parts.measure === Measure.sessions
			? messages.tracking.countUnits[parts.measure]
			: messages.tracking.countUnits.entries;
	return {
		type: FieldType.number,
		dimension: Dimension.plain,
		key: TARGET_KEY,
		label: messages.tracking.edit.goalAmount,
		required: true,
		unit
	};
}

/**
 * A goal's target as a value of its input's type.
 *
 * @param target - The target.
 * @param field - The goal's input, from {@link targetField}.
 */
export function targetValue(target: number, field: Field): FieldValue {
	if (field.type === FieldType.duration) return { type: FieldType.duration, seconds: target };
	if (field.type === FieldType.rating) return { type: FieldType.rating, stars: target };
	return { type: FieldType.number, amount: target };
}

/**
 * The amount a goal starts at when its type is chosen, so the input is never
 * empty: 1 day, time, or workout, half an hour, 3 stars, or 1 of a number. A
 * target, like a goal weight, starts at 0 for the person to fill in.
 *
 * @param parts - What the goal counts.
 * @param field - The goal's input, from {@link targetField}.
 */
export function startingTarget(parts: Pick<GoalParts, 'measure'>, field: Field): number {
	if (parts.measure === GoalType.target) return 0;
	if (field.type === FieldType.duration) return HALF_AN_HOUR;
	return field.type === FieldType.rating ? MIDDLE_STARS : 1;
}

/**
 * The target as typed, or what to fix when it is empty, zero, or not a number.
 *
 * @param field - The goal's input.
 * @param draft - What was typed.
 * @param units - The user's units.
 */
export function typedTarget(
	field: Field,
	draft: FieldDraft,
	units: DisplayUnits
): Result<number, FormProblem> {
	const parsed = parseDraft(field, draft, units);
	const target = parsed.ok ? numberOf(parsed.value) : undefined;
	return target === undefined || target <= 0
		? err(new FormProblem(messages.tracking.edit.goalNeeded))
		: ok(target);
}
