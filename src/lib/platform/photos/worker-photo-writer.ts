import type { PhotoFile } from './photo-folder.ts';
import {
	isPhotoWriteResponse,
	type PhotoWriteRequest,
	type PhotoWriteResponse
} from './photo-writer-protocol.ts';

/** The part of a `Worker` the writer talks through. */
export interface PhotoWriterPort {
	postMessage(message: PhotoWriteRequest): void;
	addEventListener(type: 'message', listener: (event: MessageEvent<unknown>) => void): void;
}

interface PendingWrite {
	readonly resolve: () => void;
	readonly reject: (error: Error) => void;
}

/**
 * Writes photo files through a dedicated worker, which can open OPFS files
 * with synchronous access handles: the one way to write OPFS files that works
 * in every browser the database already runs in.
 */
export class WorkerPhotoWriter {
	private readonly pending = new Map<number, PendingWrite>();
	private nextId = 0;

	/** @param port - The worker running `photo-writer.worker.ts`. */
	constructor(private readonly port: PhotoWriterPort) {
		port.addEventListener('message', (event) => {
			this.settle(event.data);
		});
	}

	/**
	 * Writes files into the photo folder, replacing any with the same names.
	 *
	 * @param files - The files to write.
	 */
	write(files: readonly PhotoFile[]): Promise<void> {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.port.postMessage({ id, files });
		});
	}

	private settle(data: unknown): void {
		if (!isPhotoWriteResponse(data)) return;
		const write = this.pending.get(data.id);
		this.pending.delete(data.id);
		if (write !== undefined) answer(write, data);
	}
}

function answer(write: PendingWrite, response: PhotoWriteResponse): void {
	if (response.ok) {
		write.resolve();
	} else {
		write.reject(new Error(response.message));
	}
}
