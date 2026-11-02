/**
 * Reads a JSON file the app serves from its own origin, such as the built-in
 * food database. The service worker answers from its cache when offline.
 *
 * @param url - The file's URL on the app's own origin.
 * @throws If the file can't be fetched or isn't JSON.
 */
export async function fetchAppFile(url: string): Promise<unknown> {
	const response = await fetch(url);
	const parsed: unknown = await response.json();
	return parsed;
}
