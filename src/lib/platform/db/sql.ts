/** A value SQLite can store or return: TEXT, INTEGER or REAL, NULL, or BLOB. */
type SqlValue = string | number | null | Uint8Array;

/** One result row, keyed by column name. Infrastructure mappers turn rows into domain models. */
export type SqlRow = Readonly<Record<string, SqlValue>>;

/** A named SQL statement and the parameters bound to its `?` placeholders. */
export interface SqlStatement {
	/** A short name for errors and debugging; never contains user data. */
	readonly name: string;
	readonly sql: string;
	readonly params: readonly SqlValue[];
}

/**
 * Converts a row from a SQLite engine into a {@link SqlRow}.
 *
 * Engines may return integers as `bigint`; values that fit in a JavaScript
 * number are converted, anything else is a corrupt or unsupported value.
 *
 * @param record - A row object as returned by the engine.
 * @throws If a column holds a value outside {@link SqlValue}.
 */
export function toSqlRow(record: Readonly<Record<string, unknown>>): SqlRow {
	return Object.fromEntries(
		Object.entries(record).map(([column, value]) => [column, toSqlValue(column, value)])
	);
}

function toSqlValue(column: string, value: unknown): SqlValue {
	if (value === null || typeof value === 'string' || value instanceof Uint8Array) return value;
	if (typeof value === 'number') return value;
	if (typeof value === 'bigint' && Number.isSafeInteger(Number(value))) return Number(value);
	throw new Error(`Column ${column} holds an unsupported value`);
}
