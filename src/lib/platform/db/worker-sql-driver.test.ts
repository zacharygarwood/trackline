import { MessageChannel, type MessagePort } from 'node:worker_threads';
import { afterEach, describe, expect, it } from 'vitest';
import { NodeSqliteExecutor } from '../../../../tests/support/node-sqlite-executor.ts';
import { executeRequest } from './sql-executor.ts';
import { isSqlRequestMessage, isSqlWorkerSetup } from './sql-protocol.ts';
import { WorkerSqlDriver, type SqlWorkerPort } from './worker-sql-driver.ts';

const ports: MessagePort[] = [];

/** Connects a driver to a fake worker that runs requests on in-memory SQLite. */
function connectedDriver(): WorkerSqlDriver {
	const { port1: mainThread, port2: worker } = new MessageChannel();
	ports.push(mainThread, worker);
	const executor = new NodeSqliteExecutor();
	worker.on('message', (data: unknown) => {
		if (isSqlRequestMessage(data)) {
			worker.postMessage({ id: data.id, response: executeRequest(executor, data.request) });
		}
	});
	const port: SqlWorkerPort = {
		postMessage: (message) => {
			mainThread.postMessage(message);
		},
		addEventListener: (type, listener) => {
			mainThread.on(type, (data: unknown) => {
				listener(new MessageEvent(type, { data }));
			});
		}
	};
	return new WorkerSqlDriver(port);
}

afterEach(() => {
	ports.splice(0).forEach((port) => {
		port.close();
	});
});

const statement = (sql: string) => ({ name: 'test statement', sql, params: [] });

describe('WorkerSqlDriver', () => {
	it('round-trips statements through the worker', async () => {
		const driver = connectedDriver();
		await driver.execute(statement('CREATE TABLE note (body TEXT NOT NULL) STRICT'));
		await driver.transaction([
			statement("INSERT INTO note VALUES ('a')"),
			statement("INSERT INTO note VALUES ('b')")
		]);

		const rows = await driver.query(statement('SELECT body FROM note ORDER BY body'));

		expect(rows).toEqual([{ body: 'a' }, { body: 'b' }]);
	});

	it('matches concurrent responses to their requests', async () => {
		const driver = connectedDriver();

		const [one, two] = await Promise.all([
			driver.query(statement('SELECT 1 AS n')),
			driver.query(statement('SELECT 2 AS n'))
		]);

		expect(one).toEqual([{ n: 1 }]);
		expect(two).toEqual([{ n: 2 }]);
	});

	it('rejects when the worker reports a failure', async () => {
		const driver = connectedDriver();

		await expect(driver.query(statement('SELECT * FROM missing_table'))).rejects.toThrow(
			'missing_table'
		);
	});
});

describe('isSqlRequestMessage', () => {
	it('rejects messages that are not requests', () => {
		expect(isSqlRequestMessage(null)).toBe(false);
		expect(isSqlRequestMessage({ id: 1, request: { kind: 'drop' } })).toBe(false);
		expect(isSqlRequestMessage({ id: 1, request: { kind: 'query', statement: { sql: 1 } } })).toBe(
			false
		);
	});
});

describe('isSqlWorkerSetup', () => {
	it('recognizes the setup message', () => {
		expect(isSqlWorkerSetup({ wasmUrl: '/sqlite3.wasm' })).toBe(true);
		expect(isSqlWorkerSetup({ id: 1 })).toBe(false);
	});
});
