const APP_NAME = 'Buffalog';

/**
 * Every user-facing English string in the app, grouped by where it appears.
 *
 * Components read text from here instead of using string literals, so wording
 * stays consistent and can be translated later.
 */
export const messages = {
	pageTitle: (section: string | undefined) =>
		section === undefined ? APP_NAME : `${section} · ${APP_NAME}`,
	app: {
		name: APP_NAME,
		tagline: 'A small, private tracker for workouts, food, and body weight.',
		storageUnavailable:
			'Your data could not be opened on this device. Try reloading, or use a browser that supports offline storage.'
	},
	landing: {
		openApp: 'Open the app'
	},
	navigation: {
		tabs: 'Sections',
		today: 'Today',
		train: 'Train',
		eat: 'Eat',
		body: 'Body',
		stats: 'Stats',
		settings: 'Settings'
	},
	placeholder: {
		comingSoon: 'Nothing here yet. This section is being built.'
	},
	design: {
		close: 'Close',
		decimalSeparator: 'Decimal point',
		deleteDigit: 'Delete',
		decrease: (label: string) => `Decrease ${label}`,
		increase: (label: string) => `Increase ${label}`
	}
} as const;
