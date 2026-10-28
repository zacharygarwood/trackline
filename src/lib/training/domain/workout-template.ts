import { err, ok, type Result } from '../../shared/result.ts';
import type { ExerciseId, WorkoutTemplateId } from './ids.ts';
import { parseName, type InvalidName } from './name.ts';
import type { FinishedWorkout } from './workout.ts';

/** The fewest target sets a template exercise can have. */
export const MIN_TARGET_SETS = 1;

/** The most target sets a template exercise can have. */
export const MAX_TARGET_SETS = 20;

/** An exercise in a template and how many sets to do. */
export interface TemplateExercise {
	readonly exerciseId: ExerciseId;
	readonly targetSets: number;
}

/** A reusable workout plan: named, ordered exercises with target sets. */
export interface WorkoutTemplate {
	readonly id: WorkoutTemplateId;
	readonly name: string;
	/** Where the template appears in the list, starting at 0. */
	readonly position: number;
	readonly exercises: readonly TemplateExercise[];
}

/** Raised when a template has no exercises. */
export class EmptyTemplate {
	/** @param name - The template's name. */
	constructor(readonly name: string) {}
}

/** Raised when a target set count is not a whole number from 1 to 20. */
export class InvalidTargetSets {
	/** @param targetSets - The rejected count. */
	constructor(readonly targetSets: number) {}
}

/** Why a template is invalid. */
export type TemplateProblem = InvalidName | EmptyTemplate | InvalidTargetSets;

const isTargetSets = (count: number) =>
	Number.isInteger(count) && count >= MIN_TARGET_SETS && count <= MAX_TARGET_SETS;

/**
 * Creates a template, checking its name, exercises, and set counts.
 *
 * @param fields - The template's id, name, list position, and exercises.
 */
export function createTemplate(fields: WorkoutTemplate): Result<WorkoutTemplate, TemplateProblem> {
	const name = parseName(fields.name);
	if (!name.ok) return name;
	if (fields.exercises.length === 0) return err(new EmptyTemplate(name.value));
	const invalid = fields.exercises.find((exercise) => !isTargetSets(exercise.targetSets));
	if (invalid !== undefined) return err(new InvalidTargetSets(invalid.targetSets));
	return ok({ ...fields, name: name.value });
}

/**
 * A template that repeats a finished workout: its exercises, each with as
 * many target sets as were completed (at most 20).
 *
 * @param workout - The workout to repeat.
 * @param fields - The new template's id, name, and list position.
 */
export function templateFromWorkout(
	workout: FinishedWorkout,
	fields: Omit<WorkoutTemplate, 'exercises'>
): Result<WorkoutTemplate, TemplateProblem> {
	return createTemplate({
		...fields,
		exercises: workout.exercises.map((exercise) => ({
			exerciseId: exercise.exerciseId,
			targetSets: Math.min(exercise.sets.length, MAX_TARGET_SETS)
		}))
	});
}

/**
 * Renames a template.
 *
 * @param template - The template.
 * @param name - The new name as typed.
 */
export function renameTemplate(
	template: WorkoutTemplate,
	name: string
): Result<WorkoutTemplate, InvalidName> {
	const parsed = parseName(name);
	return parsed.ok ? ok({ ...template, name: parsed.value }) : parsed;
}

/** Which way to move a template in the list. */
export const MoveDirection = { up: -1, down: 1 } as const;

/** One of the {@link MoveDirection} values. */
export type MoveDirection = (typeof MoveDirection)[keyof typeof MoveDirection];

/**
 * Moves one template up or down the list and renumbers every position from 0.
 *
 * @param templates - All templates, in list order.
 * @param id - The template to move.
 * @param direction - Up or down; moving past either end changes nothing.
 * @returns The templates in their new order, with contiguous positions.
 */
export function moveTemplate(
	templates: readonly WorkoutTemplate[],
	id: WorkoutTemplateId,
	direction: MoveDirection
): readonly WorkoutTemplate[] {
	const from = templates.findIndex((template) => template.id === id);
	const to = from + direction;
	const order = [...templates];
	const [moved] = from < 0 || to < 0 || to >= order.length ? [] : order.splice(from, 1);
	if (moved !== undefined) order.splice(to, 0, moved);
	return order.map((template, position) => ({ ...template, position }));
}
