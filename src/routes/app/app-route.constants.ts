/** The route of each screen in the installable app. */
export const AppRoute = {
	today: '/app',
	train: '/app/train',
	workout: '/app/train/workout',
	newWorkout: '/app/train/new',
	eat: '/app/eat',
	body: '/app/body',
	photos: '/app/body/photos',
	stats: '/app/stats',
	settings: '/app/settings',
	welcome: '/app/welcome'
} as const;

/** One of the {@link AppRoute} values. */
export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
