import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const BYTES_PER_KIB = 1024;
const BUDGET_KIB = 250;
const BUILD_DIRECTORY = 'build';

/** Gzipped JavaScript the app may ship, excluding the SQLite WASM glue. */
export const BUNDLE_BUDGET_BYTES = BUDGET_KIB * BYTES_PER_KIB;

/**
 * Whether a built file counts toward the JavaScript size budget.
 *
 * @param fileName - Path or name of a file in the build output.
 * @returns True for JavaScript files other than the SQLite WASM loader.
 */
export function isBudgetedScript(fileName: string): boolean {
	return fileName.endsWith('.js') && !path.basename(fileName).startsWith('sqlite3');
}

/**
 * Size of the given bytes after gzip compression.
 *
 * @param contents - Raw file contents.
 * @returns The compressed size in bytes.
 */
export function gzippedBytes(contents: Uint8Array): number {
	return gzipSync(contents).byteLength;
}

/**
 * Total gzipped size of every budgeted script under a directory.
 *
 * @param directory - The build output directory to scan recursively.
 * @returns The summed compressed size in bytes.
 */
export function budgetedBytesIn(directory: string): number {
	return readdirSync(directory, { recursive: true, encoding: 'utf8' })
		.filter(isBudgetedScript)
		.map((fileName) => gzippedBytes(readFileSync(path.join(directory, fileName))))
		.reduce((total, size) => total + size, 0);
}

if (import.meta.main) {
	const total = budgetedBytesIn(BUILD_DIRECTORY);
	const summary = `Bundle size: ${(total / BYTES_PER_KIB).toFixed(1)} KiB gzipped of ${String(BUDGET_KIB)} KiB budget\n`;
	process.stdout.write(summary);
	if (total > BUNDLE_BUDGET_BYTES) {
		process.exitCode = 1;
	}
}
