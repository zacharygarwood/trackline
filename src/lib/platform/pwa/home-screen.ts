/**
 * Whether this is a browser where the app can only be installed with Add to
 * Home Screen (Safari on iPhone and iPad) and it isn't installed yet. Only
 * iOS Safari has `navigator.standalone`; it is false until the app is opened
 * from the home screen. Android browsers offer their own install prompt.
 *
 * @param browser - `navigator`.
 */
export function canAddToHomeScreen(browser: object): boolean {
	return 'standalone' in browser && browser.standalone === false;
}
