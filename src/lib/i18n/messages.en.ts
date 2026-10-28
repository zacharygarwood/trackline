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
		settings: 'Settings',
		welcome: 'Welcome'
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
		units: 'Units',
		backup: 'Backup',
		backupExplainer:
			'Your data lives only on this device. Export a backup now and then, and keep it somewhere safe.',
		exportBackup: 'Export backup',
		restoreBackup: 'Restore from backup',
		lastExport: (date: string) => `Last backup: ${date}.`,
		neverExported: 'No backup yet.',
		backupOverdue: 'It has been a while. Consider exporting a fresh backup.',
		restoreTitle: 'Restore backup',
		restoreSummary: (date: string, current: string) =>
			`This replaces everything on this device (${current}) with the backup from ${date}.`,
		restoreConfirm: 'Replace my data',
		cancel: 'Cancel',
		notABackup: 'That file is not a backup from this app.',
		newerFormat:
			'That backup was made by a newer version of the app. Update the app, then try again.',
		dangerZone: 'Delete data',
		deleteAll: 'Delete all data',
		deleteTitle: 'Delete all data',
		deleteSummary: (current: string) =>
			`This permanently deletes everything on this device (${current}). It cannot be undone. Export a backup first if you might want it back.`,
		deleteConfirmWord: 'delete',
		deletePrompt: 'Type delete to confirm',
		deleteConfirm: 'Delete everything',
		recordCount: (weighIns: number) =>
			`${String(weighIns)} ${weighIns === 1 ? 'weigh-in' : 'weigh-ins'}`
	},
	welcome: {
		title: 'Welcome',
		privacy:
			'Everything you log stays on this device. There is no account and nothing is uploaded. Because of that, your backups are up to you: export one from Settings now and then.',
		optional: 'You can change all of this later in Settings.',
		start: 'Get started'
	},
	design: {
		close: 'Close',
		decimalSeparator: 'Decimal point',
		deleteDigit: 'Delete',
		decrease: (label: string) => `Decrease ${label}`,
		increase: (label: string) => `Increase ${label}`
	}
} as const;
