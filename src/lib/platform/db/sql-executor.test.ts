import { beforeEach, describe, expect, it } from 'vitest';
import { NodeSqliteExecutor } from '../../../../tests/support/node-sqlite-executor.ts';
import { executeRequest } from './sql-executor.ts';
import type { SqlStatement } from './sql.ts';
import { SqlRequestKind } from './sql-request.constants.ts';

const statement = (sql: string, ...params: readonly (string | number)[]): SqlStatement => ({
	name: 'test statement',
	sql,
	params
});

describe('executeRequest', () => {
	let executor: NodeSqliteExecutor;

	beforeEach(() => {
		executor = new NodeSqliteExecutor();
		executor.run(
			statement('CREATE TABLE note (id INTEGER PRIMARY KEY, body TEXT NOT NULL) STRICT')
		);
	});

	const insert = (body: string) => statement('INSERT INTO note (body) VALUES (?)', body);
	const countNotes = () =>
		executeRequest(executor, {
			kind: SqlRequestKind.query,
			statement: statement('SELECT count(*) AS n FROM note')
		});

	it('runs a query and returns its rows', () => {
		executeRequest(executor, { kind: SqlRequestKind.execute, statement: insert('hello') });

		const response = executeRequest(executor, {
			kind: SqlRequestKind.query,
			statement: statement('SELECT body FROM note WHERE id = ?', 1)
		});

		expect(response).toEqual({ ok: true, rows: [{ body: 'hello' }] });
	});

	it('commits every statement of a successful transaction', () => {
		executeRequest(executor, {
			kind: SqlRequestKind.transaction,
			statements: [insert('a'), insert('b')]
		});

		expect(countNotes()).toEqual({ ok: true, rows: [{ n: 2 }] });
	});

	it('rolls back the whole transaction when one statement fails', () => {
		const failing = {
			...statement('INSERT INTO note (body) VALUES (NULL)'),
			name: 'insert empty note'
		};

		const response = executeRequest(executor, {
			kind: SqlRequestKind.transaction,
			statements: [insert('a'), failing]
		});

		expect(response.ok).toBe(false);
		expect(!response.ok && response.message).toContain('insert empty note');
		expect(countNotes()).toEqual({ ok: true, rows: [{ n: 0 }] });
	});

	it('reports a failing statement as an error response instead of throwing', () => {
		const response = executeRequest(executor, {
			kind: SqlRequestKind.execute,
			statement: statement('INSERT INTO missing_table VALUES (1)')
		});

		expect(response.ok).toBe(false);
	});
});
