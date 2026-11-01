import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

/**
 * Hash of the inline `style` attribute on SvelteKit's route announcer, the live region that
 * tells screen readers about navigation. Allowing this exact hash keeps `'unsafe-inline'` out of
 * the policy; the CSP end-to-end test fails if a SvelteKit upgrade changes it.
 */
const ROUTE_ANNOUNCER_STYLE_HASH = 'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo=';

type BasePath = '' | `/${string}`;

const isBasePath = (value: string): value is BasePath => value === '' || value.startsWith('/');

/**
 * Reads the URL prefix the app is served under (for example `/trackline` on GitHub Pages).
 *
 * @returns The base path from the `BASE_PATH` environment variable, or the empty string.
 * @throws If `BASE_PATH` is set but does not start with a slash.
 */
function basePath(): BasePath {
	const value = process.env.BASE_PATH ?? '';
	if (!isBasePath(value)) {
		throw new Error(`BASE_PATH must start with "/": ${value}`);
	}
	return value;
}

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: '404.html' }),
			paths: { base: basePath() },
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'connect-src': ['self'],
					'img-src': ['self', 'blob:', 'data:'],
					'worker-src': ['self', 'blob:'],
					'script-src': ['self', 'wasm-unsafe-eval'],
					'style-src': ['self', 'unsafe-hashes', ROUTE_ANNOUNCER_STYLE_HASH],
					'object-src': ['none'],
					'base-uri': ['none'],
					'form-action': ['none']
				}
			}
		})
	],
	define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0') },
	worker: { format: 'es' },
	optimizeDeps: { exclude: ['@sqlite.org/sqlite-wasm'] },
	test: {
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			include: ['src/lib/**/*.ts'],
			exclude: [
				'src/lib/**/*.test.ts',
				'src/lib/**/*.constants.ts',
				'src/lib/platform/db/{worker,open-database,wasm-sql-executor}.ts',
				'src/lib/platform/backup/download-file.ts',
				'src/lib/platform/photos/{photo-writer.worker,opfs-photo-folder,open-photo-folder,reencode-image}.ts',
				'src/lib/body/infrastructure/canvas-image-processor.ts'
			],
			thresholds: {
				'src/lib/**/{domain,application}/**': { lines: 95 },
				'src/lib/shared/**': { lines: 95 },
				'src/lib/**/infrastructure/**': { lines: 85 },
				'src/lib/platform/**': { lines: 85 }
			}
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts', 'scripts/**/*.test.ts', 'tests/**/*.test.ts'],
					exclude: ['src/**/*.svelte.test.ts']
				}
			},
			{
				extends: true,
				plugins: [svelteTesting()],
				test: {
					name: 'components',
					environment: 'jsdom',
					include: ['src/**/*.svelte.test.ts'],
					setupFiles: ['tests/setup/components.ts']
				}
			}
		]
	}
});
