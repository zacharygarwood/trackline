import { describe, expect, it } from 'vitest';
import { gzippedBytes, isBudgetedScript } from './check-bundle-size';

describe('isBudgetedScript', () => {
	it('counts JavaScript chunks', () => {
		expect(isBudgetedScript('_app/immutable/chunks/abc123.js')).toBe(true);
	});

	it('ignores the SQLite WASM loader', () => {
		expect(isBudgetedScript('_app/immutable/assets/sqlite3-worker.js')).toBe(false);
	});

	it('ignores files that are not JavaScript', () => {
		expect(isBudgetedScript('_app/immutable/assets/sqlite3.wasm')).toBe(false);
		expect(isBudgetedScript('index.html')).toBe(false);
	});
});

describe('gzippedBytes', () => {
	it('measures the compressed size, not the raw size', () => {
		const repetitive = new TextEncoder().encode('a'.repeat(10_000));

		expect(gzippedBytes(repetitive)).toBeLessThan(repetitive.byteLength);
	});
});
