import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { AppRoute } from './app-route.constants.ts';

/**
 * Opens a page, passing ids in page state rather than the URL.
 *
 * @param route - The page.
 * @param state - The ids it shows.
 */
export function open(route: AppRoute, state: App.PageState = {}): Promise<void> {
	return goto(resolve(route), { state });
}

/**
 * Replaces the current page, such as after saving or when its item is gone.
 *
 * @param route - The page.
 * @param state - The ids it shows.
 */
export function replace(route: AppRoute, state: App.PageState = {}): Promise<void> {
	return goto(resolve(route), { state, replaceState: true });
}

/** Goes back to the page before, which keeps its page state. */
export function back(): void {
	history.back();
}

const TWO_PAGES = -2;

/** Goes back past the page before, such as past a thing's page after deleting it. */
export function backTwice(): void {
	history.go(TWO_PAGES);
}
