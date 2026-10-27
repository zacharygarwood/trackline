import type { SqlStatement } from './sql.ts';

/** Starts a transaction that takes the write lock immediately. */
export const BEGIN_TRANSACTION: SqlStatement = {
	name: 'begin transaction',
	sql: 'BEGIN IMMEDIATE',
	params: []
};

/** Commits the open transaction. */
export const COMMIT_TRANSACTION: SqlStatement = { name: 'commit', sql: 'COMMIT', params: [] };

/** Rolls back the open transaction. */
export const ROLLBACK_TRANSACTION: SqlStatement = { name: 'rollback', sql: 'ROLLBACK', params: [] };
