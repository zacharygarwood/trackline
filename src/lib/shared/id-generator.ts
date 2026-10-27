import type { Id } from './id.ts';

/** Creates new, unique, time-sortable IDs. */
export interface IdGenerator {
	/** A new ID for an entity of the given brand. */
	next<Brand extends string>(): Id<Brand>;
}
