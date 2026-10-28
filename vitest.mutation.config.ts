import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

/**
 * The Vitest setup Stryker runs: only the Node unit tests. Component tests
 * never reach the domain and application code that Stryker mutates, and their
 * jsdom setup doesn't resolve inside Stryker's sandbox.
 */
export default defineConfig({
	...viteConfig,
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		exclude: ['src/**/*.svelte.test.ts']
	}
});
