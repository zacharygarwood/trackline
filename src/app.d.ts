import type { StatsRange } from './lib/insights/application/stats-range.constants.ts';

declare global {
	/** The app's version from package.json, injected at build time. */
	const __APP_VERSION__: string;

	namespace App {
		/**
		 * What a tab passes to a page it opens, kept in history rather than the URL
		 * so no user data appears in addresses. Empty after a reload, when the page
		 * sends the user back to its tab.
		 */
		interface PageState {
			/** The id of the food, entry, workout, or exercise the page shows. */
			selected?: string;
			/** A name typed on the tab, for a page that creates something. */
			name?: string;
			/** Whether a new exercise goes into the workout in progress rather than only the library. */
			toWorkout?: boolean;
			/** Whether a new exercise goes back to the exercise library rather than the one-exercise list. */
			toLibrary?: boolean;
			/** The day, as YYYY-MM-DD, a past day's page or its entries show. */
			day?: string;
			/** The preset a new tracker starts from. */
			preset?: string;
			/** The Stats range the page opens on. */
			range?: StatsRange;
		}
	}
}

export {};
