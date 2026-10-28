import { DatabaseSync } from 'node:sqlite';
import { toSqlRow, type SqlRow, type SqlStatement } from '../../src/lib/platform/db/sql.ts';
import type { SqlExecutor } from '../../src/lib/platform/db/sql-executor.ts';

/** A {@link SqlExecutor} on Node's built-in SQLite, in memory, for fast tests against real SQL. */
export class NodeSqliteExecutor implements SqlExecutor {
	private readonly database = new DatabaseSync(':memory:');

	constructor() {
		this.database.exec('PRAGMA foreign_keys = ON');
	}

	rows(statement: SqlStatement): readonly SqlRow[] {
		return this.database
			.prepare(statement.sql)
			.all(...statement.params)
			.map(toSqlRow);
	}

	run(statement: SqlStatement): void {
		if (statement.params.length === 0) {
			this.database.exec(statement.sql);
		} else {
			this.database.prepare(statement.sql).run(...statement.params);
		}
	}

	/** The whole database as a SQLite file, as a backup stores it. */
	serialize(): Uint8Array {
		return this.database.serialize();
	}
}
