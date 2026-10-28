/** The route of each screen in the installable app. */
export const AppRoute = {
	today: '/app',
	train: '/app/train',
	eat: '/app/eat',
	body: '/app/body',
	stats: '/app/stats',
	settings: '/app/settings',
	welcome: '/app/welcome'
} as const;

/** One of the {@link AppRoute} values. */
export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
