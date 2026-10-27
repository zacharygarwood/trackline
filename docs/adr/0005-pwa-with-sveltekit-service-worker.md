# 0005. Use SvelteKit's own service worker instead of @vite-pwa/sveltekit

- Status: accepted
- Date: 2026-10-27

## Context

The plan names `@vite-pwa/sveltekit` (Workbox) for offline support. Its current release supports only SvelteKit 1 and 2, and this project is on SvelteKit 3. SvelteKit 3 has built-in service worker support with typed modules for the build manifest (`$app/manifest`) and the worker scope (`$app/service-worker`).

## Decision

- **Service worker** (`src/service-worker/`): precaches every built file, static file, and prerendered page under a cache named after the build version. It answers same-origin GET requests from that cache and falls back to the network. On activation it deletes older caches and takes control of open pages, so the first visit already works offline. It does not call `skipWaiting`: a new version takes over only after every tab is closed, so an update never reloads the app mid-workout. The plan's "Update available" toast is left for later.
- **Cache matching ignores `Vary`**, because the cache holds only our own precached files and module-script requests carry different headers than the precache requests.
- **The manifest** is a hand-written `static/manifest.webmanifest` with relative URLs, so it works under any base path. Icons are rendered from SVG sources by `scripts/generate-icons.sh`.
- **App routes** under `/app` set `ssr = false` and are prerendered as empty shells. Every tab has a real HTML file, which GitHub Pages and the service worker both serve directly.
- **SQLite WASM file:** SvelteKit's build manifest omits assets emitted by worker bundles, so the WASM file that the database worker loads was never precached. The main bundle now imports the WASM URL (`?url`), which puts it in the precache, and passes it to the worker in a setup message. The worker hands it to SQLite through Emscripten's `locateFile` option. The worker bundle still emits its own unused copy of the file. That makes the deployed site larger but adds nothing to what users download.

No dependency is added.

## Consequences

There is one fewer dependency, and Workbox's runtime is not in the bundle. An end-to-end test checks that the app opens and navigates offline and that the WASM file is precached.
