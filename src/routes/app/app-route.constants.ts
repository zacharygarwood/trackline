/** The route of each screen in the installable app. */
export const AppRoute = {
	today: '/app',
	stats: '/app/stats',
	addTracker: '/app/add',
	nameTracker: '/app/add/name',
	tracker: '/app/tracker',
	log: '/app/tracker/log',
	entry: '/app/tracker/entry',
	editTracker: '/app/tracker/edit',
	library: '/app/tracker/library',
	subject: '/app/tracker/item',
	newSubject: '/app/tracker/new-item',
	workout: '/app/tracker/workout',
	addExercise: '/app/tracker/workout/add',
	session: '/app/tracker/session',
	addFood: '/app/tracker/food',
	portion: '/app/tracker/portion',
	compare: '/app/tracker/compare',
	settings: '/app/settings',
	settingsTrackers: '/app/settings/trackers',
	settingsTheme: '/app/settings/theme',
	settingsUnits: '/app/settings/units',
	settingsData: '/app/settings/data',
	settingsSupport: '/app/settings/support',
	settingsAbout: '/app/settings/about',
	welcome: '/app/welcome'
} as const;

/** One of the {@link AppRoute} values. */
export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
