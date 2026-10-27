import type { SqlStatement } from './sql.ts';

/** Reads the schema version, which is the number of the last applied migration. */
export const READ_SCHEMA_VERSION: SqlStatement = {
	name: 'read schema version',
	sql: 'PRAGMA user_version',
	params: []
};

/**
 * Records the schema version. PRAGMA values can't be bound as parameters, so
 * the version is checked to be a non-negative integer before it is inlined.
 *
 * @param version - The number of the last applied migration.
 * @throws If the version is not a non-negative integer.
 */
export function writeSchemaVersion(version: number): SqlStatement {
	if (!Number.isSafeInteger(version) || version < 0) {
		throw new Error(`Invalid schema version ${String(version)}`);
	}
	return {
		name: 'write schema version',
		sql: `PRAGMA user_version = ${String(version)}`,
		params: []
	};
}
