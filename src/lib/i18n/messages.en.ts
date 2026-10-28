const APP_NAME = 'Buffalog';

const countOf = (count: number, one: string, many: string) =>
	`${String(count)} ${count === 1 ? one : many}`;

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
		recordCount: (counts: {
			readonly weighIns: number;
			readonly workouts: number;
			readonly foodEntries: number;
		}) =>
			[
				countOf(counts.weighIns, 'weigh-in', 'weigh-ins'),
				countOf(counts.workouts, 'workout', 'workouts'),
				countOf(counts.foodEntries, 'food entry', 'food entries')
			].join(', ')
	},
	training: {
		startWorkout: 'Start workout',
		templates: 'Templates',
		noTemplates: 'No templates yet. Finish a workout and save it as a template.',
		recent: 'Recent workouts',
		noWorkouts: 'No workouts yet. Start one to log your first sets.',
		thisWeek: 'This week',
		streak: (current: number, longest: number) =>
			`Streak: ${countOf(current, 'day', 'days')}. Best: ${countOf(longest, 'day', 'days')}.`,
		restDay: 'Rest day',
		markRestDay: (date: string) => `Mark ${date} as a rest day`,
		trained: 'Workout',
		nothingLogged: 'Nothing logged',
		addExercise: 'Add exercise',
		exerciseName: 'Exercise name',
		addNamed: (name: string) => `Add “${name}”`,
		addSet: 'Add set',
		removeExercise: (name: string) => `Remove ${name}`,
		setNumber: (position: number) => `Set ${String(position)}`,
		reps: 'Reps',
		weight: (unit: string) => `Weight (${unit})`,
		completeSet: (position: number) => `Complete set ${String(position)}`,
		removeSet: (position: number) => `Remove set ${String(position)}`,
		lastTime: (sets: string) => `Last time: ${sets}`,
		firstTime: 'First time doing this exercise.',
		setSummary: (reps: number, weight: string) => `${String(reps)} × ${weight}`,
		bodyweight: 'bodyweight',
		note: 'Note',
		finishWorkout: 'Finish workout',
		discardWorkout: 'Discard workout',
		discardTitle: 'Discard workout',
		discardWarning: 'Everything logged in this workout will be lost.',
		keepWorkout: 'Keep going',
		nothingCompleted: 'No sets were completed, so the workout was discarded.',
		workoutSaved: 'Workout saved',
		saveAsTemplatePrompt: 'Save this workout as a template to repeat it in one tap.',
		templateName: 'Template name',
		saveTemplate: 'Save template',
		notNow: 'Not now',
		enterName: 'Enter a name of up to 60 characters.',
		exerciseAlreadyAdded: 'That exercise is already in this workout.',
		templateActions: (name: string) => `${name} options`,
		templateSummary: (exercises: number) => countOf(exercises, 'exercise', 'exercises'),
		rename: 'Rename',
		moveUp: 'Move up',
		moveDown: 'Move down',
		deleteTemplate: 'Delete template',
		workoutSummary: (exercises: string, sets: number) =>
			`${exercises} · ${countOf(sets, 'set', 'sets')}`
	},
	nutrition: {
		logFood: 'Log food',
		previousDay: 'Previous day',
		nextDay: 'Next day',
		breakfast: 'Breakfast',
		lunch: 'Lunch',
		dinner: 'Dinner',
		snacks: 'Snacks',
		meal: 'Meal',
		nothingLogged: 'Nothing logged.',
		search: 'Search foods',
		savedMeals: 'Saved meals',
		recentFoods: 'Foods',
		noFoods: 'No foods yet. Create one to log it.',
		newFood: 'New food',
		foodName: 'Name',
		referenceAmount: 'Amount',
		referenceUnit: 'Unit (g, ml, slice…)',
		macrosFor: 'Macros for that amount',
		calories: 'Calories',
		protein: 'Protein',
		carbs: 'Carbs',
		fat: 'Fat',
		saveFood: 'Save food',
		amountOf: (unit: string) => `Amount (${unit})`,
		log: 'Log',
		saveAmount: 'Save',
		deleteEntry: 'Remove from log',
		enterAmount: 'Enter an amount greater than zero.',
		checkFood:
			'Check the food: it needs a name, a positive amount, a unit, and macros of zero or more.',
		entry: (name: string, amount: string, calories: string) => `${name}, ${amount}, ${calories}`,
		amountWithUnit: (amount: string, unit: string) => `${amount} ${unit}`,
		entryDetail: (amount: string, calories: string) => `${amount} · ${calories}`,
		kcal: (calories: string) => `${calories} kcal`,
		grams: (grams: string) => `${grams} g`,
		macroLine: (amounts: {
			readonly calories: string;
			readonly protein: string;
			readonly carbs: string;
			readonly fat: string;
		}) =>
			`${amounts.calories} kcal · P ${amounts.protein} g · C ${amounts.carbs} g · F ${amounts.fat} g`,
		saveSlotAsMeal: (slot: string) => `Save ${slot.toLowerCase()} as a meal`,
		mealName: 'Meal name',
		saveMeal: 'Save meal',
		mealNameProblem: 'Enter a name of up to 60 characters.',
		progressOf: (label: string, eaten: string, target: string) => `${label}: ${eaten} of ${target}`,
		remaining: (amount: string) => `${amount} left`,
		over: (amount: string) => `${amount} over`,
		noGoals: 'No daily goals yet. Set them in Settings.',
		dailyGoals: 'Daily goals',
		saveGoals: 'Save goals',
		goalsSaved: 'Goals saved. Earlier days keep their old goals.',
		checkGoals: 'Enter numbers of zero or more for every goal.'
	},
	today: {
		weighedIn: (weight: string) => `Weighed in: ${weight}`,
		notWeighedIn: 'Not weighed in yet.',
		workoutDone: 'Workout done.',
		restDayMarked: 'Rest day.',
		noTraining: 'No workout yet today.',
		training: 'Training',
		food: 'Food',
		body: 'Body'
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
