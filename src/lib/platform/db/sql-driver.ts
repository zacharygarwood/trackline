import type { SqlRow, SqlStatement } from './sql.ts';

/**
 * Runs SQL against the device database. Repositories depend on this port,
 * never on the worker or a SQLite engine directly.
 *
 * Failures reject the returned promise: they mean a bug or corrupt data,
 * not an expected outcome.
 */
export interface SqlDriver {
	/** Runs a statement and returns its rows. */
	query(statement: SqlStatement): Promise<readonly SqlRow[]>;
	/** Runs a statement that returns no rows. */
	execute(statement: SqlStatement): Promise<void>;
	/** Runs statements in order inside one transaction; any failure rolls back all of them. */
	transaction(statements: readonly SqlStatement[]): Promise<void>;
}
