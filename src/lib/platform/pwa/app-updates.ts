import { SKIP_WAITING } from './update-message.constants.ts';

/** The parts of a `ServiceWorker` the update flow uses. */
export type WaitingWorker = Pick<ServiceWorker, 'state' | 'postMessage' | 'addEventListener'>;

/** The parts of a `ServiceWorkerRegistration` the update flow uses. */
export interface UpdateRegistration {
	readonly waiting: WaitingWorker | null;
	readonly installing: WaitingWorker | null;
	addEventListener(type: 'updatefound', listener: () => void): void;
}

/** The parts of `navigator.serviceWorker` the update flow uses. */
export interface UpdateContainer {
	readonly controller: unknown;
	getRegistration(): Promise<UpdateRegistration | undefined>;
	addEventListener(type: 'controllerchange', listener: () => void): void;
}

const INSTALLED: ServiceWorkerState = 'installed';

/**
 * Watches for a new version of the app that has finished downloading. When
 * one is ready, `onReady` receives a function that switches to it and reloads.
 * Nothing happens until the user asks, so an update never interrupts them.
 *
 * @param container - `navigator.serviceWorker`.
 * @param onReady - Called once per ready version with the function that applies it.
 * @param reload - Reloads the page after the new version takes over.
 */
export async function watchForUpdates(
	container: UpdateContainer,
	onReady: (apply: () => void) => void,
	reload: () => void
): Promise<void> {
	const registration = await container.getRegistration();
	if (registration === undefined) return;
	const offer = (worker: WaitingWorker) => {
		onReady(() => {
			container.addEventListener('controllerchange', reload);
			worker.postMessage(SKIP_WAITING);
		});
	};
	const isUpdate = () => container.controller !== null;
	if (registration.waiting !== null && isUpdate()) offer(registration.waiting);
	registration.addEventListener('updatefound', () => {
		const installing = registration.installing;
		installing?.addEventListener('statechange', () => {
			if (installing.state === INSTALLED && isUpdate()) offer(installing);
		});
	});
}
