import { defineConfig } from '@playwright/test';
import { androidPhone } from './tests/e2e/devices.ts';

const PORT = 4174;

/** Captures the site screenshots: `pnpm screenshots`. Not part of the test suite. */
export default defineConfig({
	testDir: 'tests/screenshots',
	testMatch: '**/*.screenshots.ts',
	reporter: 'list',
	use: { baseURL: `http://localhost:${String(PORT)}` },
	webServer: {
		command: `pnpm build && pnpm preview --port ${String(PORT)} --strictPort`,
		port: PORT,
		reuseExistingServer: false
	},
	projects: [{ name: 'chromium', use: { ...androidPhone } }]
});
