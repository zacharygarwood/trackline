import { describe, expect, it } from 'vitest';
import type { PhotoWriteRequest, PhotoWriteResponse } from './photo-writer-protocol.ts';
import { isPhotoWriteRequest, isPhotoWriteResponse } from './photo-writer-protocol.ts';
import { WorkerPhotoWriter, type PhotoWriterPort } from './worker-photo-writer.ts';

/** A worker stand-in that answers each request with the given outcome. */
function fakeWorker(answer: (request: PhotoWriteRequest) => PhotoWriteResponse): {
	port: PhotoWriterPort;
	requests: PhotoWriteRequest[];
} {
	const requests: PhotoWriteRequest[] = [];
	let listener: ((event: MessageEvent<unknown>) => void) | undefined;
	return {
		requests,
		port: {
			postMessage(request) {
				requests.push(request);
				queueMicrotask(() => listener?.(new MessageEvent('message', { data: answer(request) })));
			},
			addEventListener(_, added) {
				listener = added;
			}
		}
	};
}

describe('WorkerPhotoWriter', () => {
	const files = [{ name: 'a', bytes: Uint8Array.of(1) }];

	it('sends files to the worker and resolves when it confirms', async () => {
		const worker = fakeWorker((request) => ({ id: request.id, ok: true }));

		await new WorkerPhotoWriter(worker.port).write(files);

		expect(worker.requests).toEqual([{ id: 0, files }]);
	});

	it('rejects with the worker’s message when a write fails', async () => {
		const worker = fakeWorker((request) => ({ id: request.id, ok: false, message: 'disk full' }));

		await expect(new WorkerPhotoWriter(worker.port).write(files)).rejects.toThrow('disk full');
	});

	it('matches answers to requests by id', async () => {
		const worker = fakeWorker((request) =>
			request.id === 0 ? { id: 0, ok: false, message: 'first failed' } : { id: 1, ok: true }
		);
		const writer = new WorkerPhotoWriter(worker.port);

		const results = await Promise.allSettled([writer.write(files), writer.write(files)]);

		expect(results.map((result) => result.status)).toEqual(['rejected', 'fulfilled']);
	});
});

describe('photo writer protocol', () => {
	it.each([
		[{ id: 1, files: [{ name: 'a', bytes: Uint8Array.of(1) }] }, true],
		[{ id: 1, files: [{ name: 'a', bytes: [1] }] }, false],
		[{ id: '1', files: [] }, false],
		[null, false]
	])('recognizes write request %j: %s', (value, expected) => {
		expect(isPhotoWriteRequest(value)).toBe(expected);
	});

	it.each([
		[{ id: 1, ok: true }, true],
		[{ id: 1, ok: false, message: 'x' }, true],
		[{ id: 1, ok: false }, false],
		['done', false]
	])('recognizes response %j: %s', (value, expected) => {
		expect(isPhotoWriteResponse(value)).toBe(expected);
	});
});
