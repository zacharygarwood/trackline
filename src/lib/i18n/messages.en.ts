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
	units: {
		kg: 'kg',
		lb: 'lb',
		kgLong: 'Kilograms',
		lbLong: 'Pounds'
	},
	dates: {
		today: 'Today',
		yesterday: 'Yesterday'
	},
	body: {
		weighIn: 'Weigh in',
		save: 'Save',
		deleteWeighIn: 'Delete weigh-in',
		history: 'History',
		empty: 'No weigh-ins yet. Weigh in to start your graph.',
		enterWeight: 'Enter your weight.',
		weightOutOfRange: (min: string, max: string) => `Enter a weight between ${min} and ${max}.`,
		editWeighIn: (date: string, weight: string) => `${date}, ${weight}. Edit`,
		chartTitle: 'Weight',
		chartSummary: (count: number, latest: string, average: string) =>
			`Weight chart with ${String(count)} ${count === 1 ? 'weigh-in' : 'weigh-ins'}. Latest ${latest}, 7-day average ${average}.`,
		chartGoal: (goal: string) => ` Goal ${goal}.`,
		trendLegend: '7-day average',
		goalLegend: 'Goal',
		goalWeight: 'Goal weight',
		noGoal: 'No goal set.',
		goalSummary: (target: string, direction: string) => `${target}, ${direction}`,
		setGoal: 'Set goal',
		changeGoal: 'Change goal',
		removeGoal: 'Remove goal',
		direction: 'Direction',
		lose: 'Lose',
		gain: 'Gain',
		maintain: 'Maintain'
	},
	settings: {
		units: 'Units'
	},
	design: {
		close: 'Close',
		decimalSeparator: 'Decimal point',
		deleteDigit: 'Delete',
		decrease: (label: string) => `Decrease ${label}`,
		increase: (label: string) => `Increase ${label}`
	}
} as const;
