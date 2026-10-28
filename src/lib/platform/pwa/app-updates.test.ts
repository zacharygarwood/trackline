import { describe, expect, it } from 'vitest';
import {
	watchForUpdates,
	type UpdateContainer,
	type UpdateRegistration,
	type WaitingWorker
} from './app-updates.ts';

class FakeWorker extends EventTarget implements WaitingWorker {
	state: ServiceWorkerState = 'installing';
	readonly messages: unknown[] = [];

	postMessage(message: unknown): void {
		this.messages.push(message);
	}

	install(): void {
		this.state = 'installed';
		this.dispatchEvent(new Event('statechange'));
	}
}

class FakeRegistration extends EventTarget implements UpdateRegistration {
	waiting: FakeWorker | null = null;
	installing: FakeWorker | null = null;

	find(worker: FakeWorker): void {
		this.installing = worker;
		this.dispatchEvent(new Event('updatefound'));
	}
}

class FakeContainer extends EventTarget implements UpdateContainer {
	constructor(
		readonly registration: FakeRegistration | undefined,
		readonly controller: unknown = {}
	) {
		super();
	}

	getRegistration(): Promise<UpdateRegistration | undefined> {
		return Promise.resolve(this.registration);
	}

	takeOver(): void {
		this.dispatchEvent(new Event('controllerchange'));
	}
}

let reloads = 0;
const reload = () => {
	reloads += 1;
};

describe('watchForUpdates', () => {
	it('offers a version that finishes installing, and applies it only when asked', async () => {
		const registration = new FakeRegistration();
		const container = new FakeContainer(registration);
		const offers: (() => void)[] = [];
		reloads = 0;
		await watchForUpdates(container, (apply) => offers.push(apply), reload);
		const worker = new FakeWorker();

		registration.find(worker);
		worker.install();

		expect(offers).toHaveLength(1);
		expect(worker.messages).toEqual([]);
		offers.at(0)?.();
		expect(worker.messages).toEqual(['skip-waiting']);
		expect(reloads).toBe(0);
		container.takeOver();
		expect(reloads).toBe(1);
	});

	it('offers a version that was already waiting', async () => {
		const registration = new FakeRegistration();
		registration.waiting = new FakeWorker();
		const offers: (() => void)[] = [];

		await watchForUpdates(new FakeContainer(registration), (apply) => offers.push(apply), reload);

		expect(offers).toHaveLength(1);
	});

	it('does not call the first install an update', async () => {
		const registration = new FakeRegistration();
		const offers: (() => void)[] = [];
		await watchForUpdates(
			new FakeContainer(registration, null),
			(apply) => offers.push(apply),
			reload
		);
		const worker = new FakeWorker();

		registration.find(worker);
		worker.install();

		expect(offers).toEqual([]);
	});

	it('does nothing without a service worker registration', async () => {
		const offers: (() => void)[] = [];

		await watchForUpdates(new FakeContainer(undefined), (apply) => offers.push(apply), reload);

		expect(offers).toEqual([]);
	});
});
