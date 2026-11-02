declare global {
	/** The app's version from package.json, injected at build time. */
	const __APP_VERSION__: string;

	namespace App {
		/**
		 * What a page passes to the page it opens, kept in history rather than the
		 * URL so no user data appears in addresses. Empty after a reload, when the
		 * page sends the user back to Home.
		 */
		interface PageState {
			/** The id of the tracker the page shows or logs to. */
			tracker?: string;
			/** The id of the exercise, food, plant, or other thing the page shows. */
			subject?: string;
			/** The id of the entry the page shows. */
			entry?: string;
			/** The id of the workout or other session the page shows. */
			session?: string;
			/** The key of the basic template the page names and adds. */
			template?: string;
			/** The id of a food in the built-in food database, for the page that logs a portion of it. */
			food?: string;
			/** Whether the food the page makes or edits is a recipe. */
			recipe?: boolean;
			/** A name typed on the page before, for a page that creates something. */
			name?: string;
			/** The ids of the two photo entries to compare, older first. */
			compare?: readonly [string, string];
		}
	}
}

export {};
