import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test as base, webkit } from '@playwright/test';
import { iPhone } from './devices.ts';

/**
 * Playwright's test runner with one change: WebKit tests run in a persistent
 * context, because WebKit's ephemeral contexts reject the Origin Private File
 * System that the app stores its database in.
 */
export const test = base.extend({
	context: async ({ browserName, context, baseURL }, use) => {
		if (browserName !== 'webkit' || baseURL === undefined) {
			await use(context);
			return;
		}
		const profile = await mkdtemp(path.join(tmpdir(), 'trackline-webkit-'));
		const persistent = await webkit.launchPersistentContext(profile, {
			...iPhone,
			baseURL
		});
		await use(persistent);
		await persistent.close();
		await rm(profile, { recursive: true, force: true });
	}
});

export { expect } from '@playwright/test';
