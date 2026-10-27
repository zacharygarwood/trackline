import { err, ok, type Result } from './result.ts';

const UUID_V7_PATTERN = /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

declare const idBrand: unique symbol;

/**
 * A time-sortable identifier (lowercase UUIDv7) for one kind of entity.
 *
 * The brand keeps IDs of different entities apart at compile time, so a
 * `WorkoutId` can never be passed where a `FoodId` is expected.
 *
 * @typeParam Brand - The entity the ID belongs to, for example `'Workout'`.
 */
export type Id<Brand extends string> = string & { readonly [idBrand]: Brand };

/** Raised when text is not a valid UUIDv7. */
export class InvalidId {
	/** @param input - The rejected text. */
	constructor(readonly input: string) {}
}

/**
 * Whether text is a lowercase UUIDv7, narrowing it to a branded ID.
 *
 * @param text - Text to check.
 */
export function isId<Brand extends string>(text: string): text is Id<Brand> {
	return UUID_V7_PATTERN.test(text);
}

/**
 * Parses text into a branded ID.
 *
 * @param text - Text that should be a lowercase UUIDv7.
 */
export function parseId<Brand extends string>(text: string): Result<Id<Brand>, InvalidId> {
	return isId<Brand>(text) ? ok(text) : err(new InvalidId(text));
}
