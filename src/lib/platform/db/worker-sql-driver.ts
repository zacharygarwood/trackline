import type { SqlRow, SqlStatement } from './sql.ts';
import type { SqlDriver } from './sql-driver.ts';
import {
	isSqlResponseMessage,
	type SqlRequest,
	type SqlRequestMessage,
	type SqlResponse
} from './sql-protocol.ts';
import { SqlRequestKind } from './sql-request.constants.ts';

/** The part of a `Worker` (or `MessagePort`) the driver talks through. */
export interface SqlWorkerPort {
	postMessage(message: SqlRequestMessage): void;
	addEventListener(type: 'message', listener: (event: MessageEvent<unknown>) => void): void;
}

interface PendingRequest {
	readonly resolve: (rows: readonly SqlRow[]) => void;
	readonly reject: (error: Error) => void;
}

/**
 * A {@link SqlDriver} that sends each request to the database worker and
 * resolves when the worker answers, so queries never block the UI thread.
 */
export class WorkerSqlDriver implements SqlDriver {
	private readonly pending = new Map<number, PendingRequest>();
	private nextId = 0;

	/** @param port - The worker running {@link executeRequest} on SQLite. */
	constructor(private readonly port: SqlWorkerPort) {
		port.addEventListener('message', (event) => {
			this.settle(event.data);
		});
	}

	/** {@inheritDoc SqlDriver.query} */
	query(statement: SqlStatement): Promise<readonly SqlRow[]> {
		return this.send({ kind: SqlRequestKind.query, statement });
	}

	/** {@inheritDoc SqlDriver.execute} */
	async execute(statement: SqlStatement): Promise<void> {
		await this.send({ kind: SqlRequestKind.execute, statement });
	}

	/** {@inheritDoc SqlDriver.transaction} */
	async transaction(statements: readonly SqlStatement[]): Promise<void> {
		await this.send({ kind: SqlRequestKind.transaction, statements });
	}

	private send(request: SqlRequest): Promise<readonly SqlRow[]> {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.port.postMessage({ id, request });
		});
	}

	private settle(data: unknown): void {
		if (!isSqlResponseMessage(data)) return;
		const request = this.pending.get(data.id);
		this.pending.delete(data.id);
		if (request !== undefined) answer(request, data.response);
	}
}

function answer(request: PendingRequest, response: SqlResponse): void {
	if (response.ok) {
		request.resolve(response.rows);
	} else {
		request.reject(new Error(response.message));
	}
}
