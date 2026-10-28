import type { Result } from '../../shared/result.ts';

/** A stored row that can't become a domain model: the database holds data the app never writes. */
export class CorruptRow {
	/**
	 * @param table - The table the row came from.
	 * @param reason - What is wrong, without any of the row's values.
	 */
	constructor(
		readonly table: string,
		readonly reason: string
	) {}
}

/**
 * The model from a mapped row, or an exception for corrupt data, which is a
 * bug or a damaged database rather than an expected failure.
 *
 * @param result - A mapper's `toDomain` result.
 * @throws If the row is corrupt.
 */
export function requireValidRow<T>(result: Result<T, CorruptRow>): T {
	if (!result.ok) throw new Error(`Corrupt ${result.error.table} row: ${result.error.reason}`);
	return result.value;
}
