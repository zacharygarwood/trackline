import { describe, expect, it } from 'vitest';
import { requestPersistentStorage, type PersistableStorage } from './persistent-storage.ts';

class FakeStorage implements PersistableStorage {
	requests = 0;

	constructor(
		private alreadyPersisted: boolean,
		private readonly grants: boolean
	) {}

	persisted(): Promise<boolean> {
		return Promise.resolve(this.alreadyPersisted);
	}

	persist(): Promise<boolean> {
		this.requests += 1;
		this.alreadyPersisted = this.grants;
		return Promise.resolve(this.grants);
	}
}

describe('requestPersistentStorage', () => {
	it('asks for persistence when storage is not yet persistent', async () => {
		const storage = new FakeStorage(false, true);

		expect(await requestPersistentStorage(storage)).toBe(true);
		expect(storage.requests).toBe(1);
	});

	it('does not ask again once storage is persistent', async () => {
		const storage = new FakeStorage(true, true);

		expect(await requestPersistentStorage(storage)).toBe(true);
		expect(storage.requests).toBe(0);
	});

	it('reports a refusal', async () => {
		expect(await requestPersistentStorage(new FakeStorage(false, false))).toBe(false);
	});

	it('reports false when the browser has no storage manager', async () => {
		expect(await requestPersistentStorage(undefined)).toBe(false);
	});
});
