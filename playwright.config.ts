import { defineConfig } from '@playwright/test';
import { androidPhone, iPhone } from './tests/e2e/devices.ts';

const PORT = 4173;
const isCi = process.env.CI !== undefined;

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.ts',
	forbidOnly: isCi,
	retries: isCi ? 1 : 0,
	reporter: isCi ? 'github' : 'list',
	use: { baseURL: `http://localhost:${String(PORT)}` },
	webServer: {
		command: `pnpm build && pnpm preview --port ${String(PORT)} --strictPort`,
		port: PORT,
		reuseExistingServer: !isCi
	},
	projects: [
		{ name: 'chromium', use: { ...androidPhone } },
		{ name: 'webkit', use: { ...iPhone } }
	]
});
