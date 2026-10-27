import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self as worker } from '$app/service-worker';
import { CACHE_PREFIX } from './cache.constants.ts';

const cacheName = CACHE_PREFIX + version;
const appFiles = [...immutable, ...assets, ...prerendered].map((file) => file.path);

/** Stores every file of this version so the app opens with no network. */
async function precache(): Promise<void> {
	const cache = await caches.open(cacheName);
	await cache.addAll(appFiles);
}

/** Deletes the caches of earlier versions, then takes control of open pages. */
async function activate(): Promise<void> {
	const names = await caches.keys();
	await Promise.all(names.filter((name) => name !== cacheName).map((name) => caches.delete(name)));
	await worker.clients.claim();
}

/** Answers from this version's cache, falling back to the app's own origin. */
async function respond(request: Request): Promise<Response> {
	const cache = await caches.open(cacheName);
	return (await cache.match(request, { ignoreSearch: true, ignoreVary: true })) ?? fetch(request);
}

worker.addEventListener('install', (event) => {
	event.waitUntil(precache());
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(activate());
});

worker.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.method === 'GET' && url.origin === worker.location.origin) {
		event.respondWith(respond(event.request));
	}
});
