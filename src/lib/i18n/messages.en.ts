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
		updateReady: 'A new version is ready.',
		reload: 'Reload',
		installHint: `Install ${APP_NAME}: tap Share, then Add to Home Screen.`,
		dismiss: 'Got it',
		storageUnavailable:
			'Your data could not be opened on this device. Try reloading, or use a browser that supports offline storage.'
	},
	landing: {
		openApp: 'Open the app',
		todayScreenshot: 'The Today screen: food goals, today’s weigh-in, and the training streak.',
		statsScreenshot: 'The Stats screen: streaks and heatmaps of the last 52 weeks.',
		promise: 'Everything you log stays on your device. No account, no tracking, no cloud.',
		installTitle: 'Install it like an app',
		installIphone: 'iPhone: open it in Safari, tap Share, then Add to Home Screen.',
		installAndroid: 'Android: open it in Chrome, open the menu, then tap Install app.',
		freeTitle: 'Free and open source',
		free: `${APP_NAME} is free, with no ads and no paid tier. If it helps you, you can support it on Ko-fi.`,
		source: 'Source on GitHub',
		donate: 'Support on Ko-fi'
	},
	site: {
		home: APP_NAME,
		footer: 'Site',
		privacy: 'Privacy',
		faq: 'FAQ',
		source: 'Source',
		donate: 'Donate',
		copyright: '© 2026 Zach Garwood'
	},
	privacy: {
		title: 'Privacy',
		summary: `${APP_NAME} keeps everything you log on your device. Nothing is sent anywhere.`,
		paragraphs: [
			'There is no account and no server. Workouts, food, weigh-ins, and progress photos are stored in your browser’s private storage for this site, on this device only.',
			'The app makes no network requests except to download updates of itself from this site. It has no analytics, crash reporting, ads, cookies, or third-party scripts, fonts, or images. Anyone can check this: the source is public, and an automated test fails if the app contacts any other site.',
			'Progress photos are redrawn when you add them, which removes their hidden details such as the location they were taken and the camera used.',
			'Backups are files you export yourself. The app never uploads them; where you keep them is up to you.',
			'The links to the source code and to Ko-fi are ordinary links. Nothing from those sites is loaded unless you tap them.',
			'Deleting all data in Settings removes everything from this device. Because nothing is stored anywhere else, there is nothing else to delete.'
		]
	},
	faq: {
		title: 'Frequently asked questions',
		entries: [
			{
				question: 'Where is my data stored?',
				answer:
					'Only on your device, in the browser’s private storage for this site. There is no account and no copy anywhere else.'
			},
			{
				question: 'What if I lose my phone or clear my browser data?',
				answer:
					'Then the data is gone, because it only ever lived there. Export a backup from Settings now and then and keep it somewhere safe. The app reminds you gently when the last backup is a month old.'
			},
			{
				question: 'How do I move to a new phone?',
				answer:
					'Export a backup on the old phone, move the file to the new one, open the app there, and restore it from Settings.'
			},
			{
				question: 'Does it work offline?',
				answer:
					'Yes. After the first visit, everything works without a connection, including installing it to your home screen.'
			},
			{
				question: 'Why is there no sync or account?',
				answer:
					'Keeping everything on your device is the whole point: nothing to sign up for, nothing to breach, nothing to sell. Backups cover moving between devices.'
			},
			{
				question: 'Is it really free?',
				answer:
					'Yes. There are no ads and no paid tier. It is open source under the GNU GPL v3, and supported only by voluntary donations on Ko-fi.'
			},
			{
				question: 'Can I host it myself?',
				answer:
					'Yes. It is a static site with no backend. The README in the source repository explains how to build it and serve it from any static host.'
			}
		]
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
		kcal: 'kcal',
		grams: 'g',
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
		maintain: 'Maintain',
		progressPhotos: 'Progress photos',
		addPhoto: 'Add photo',
		allPhotos: 'All photos',
		noPhotos: 'No progress photos yet. Add one to see your changes over time.',
		photoDate: 'Date',
		choosePose: 'Pose',
		front: 'Front',
		side: 'Side',
		back: 'Back',
		notAnImage: 'That file is not a photo this device can open.',
		enterDate: 'Choose a date no later than today.',
		photoOf: (pose: string, date: string) => `${pose}, ${date}`,
		compare: 'Compare',
		compareWith: 'Compare with',
		noOtherPhotos: (pose: string) => `No other ${pose.toLowerCase()} photos to compare with yet.`,
		sideBySide: 'Side by side',
		slider: 'Slider',
		compareMode: 'View',
		comparePosition: 'Slide between the photos',
		comparison: (before: string, after: string) => `${before} compared with ${after}`,
		deletePhoto: 'Delete photo'
	},
	settings: {
		preferences: 'Preferences',
		units: 'Units',
		weekStart: 'First day of week',
		monday: 'Monday',
		sunday: 'Sunday',
		about: 'About',
		version: (version: string) => `Version ${version}`,
		licensed: 'Free and open source under the',
		licenseName: 'GNU General Public License v3',
		sourceCode: 'Source code',
		donate: 'Support on Ko-fi',
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
			readonly photos: number;
		}) =>
			[
				countOf(counts.weighIns, 'weigh-in', 'weigh-ins'),
				countOf(counts.workouts, 'workout', 'workouts'),
				countOf(counts.foodEntries, 'food entry', 'food entries'),
				countOf(counts.photos, 'photo', 'photos')
			].join(', ')
	},
	training: {
		startWorkout: 'Start workout',
		templates: 'Templates',
		noTemplates: 'No templates yet. Finish a workout and save it as a template.',
		recent: 'Recent workouts',
		noWorkouts: 'No workouts yet. Start one to log your first sets.',
		lastSevenDays: 'Last 7 days',
		weekSummary: (workouts: number, restDays: number) =>
			`${countOf(workouts, 'workout', 'workouts')} · ${countOf(restDays, 'rest day', 'rest days')}`,
		streak: (current: number, longest: number) =>
			`Streak: ${countOf(current, 'day', 'days')}. Best: ${countOf(longest, 'day', 'days')}.`,
		restDay: 'Rest day',
		dayTrained: (date: string) => `${date}: workout`,
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
		day: 'Day',
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
		ofTarget: (eaten: string, target: string) => `${eaten} / ${target}`,
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
	stats: {
		streaks: 'Streaks',
		currentStreak: 'Current streak',
		longestStreak: 'Longest streak',
		days: (count: number) => countOf(count, 'day', 'days'),
		activity: 'Last 52 weeks',
		training: 'Training',
		foodLogged: 'Food logged',
		proteinGoalMet: 'Protein goal met',
		workout: 'Workout',
		restDay: 'Rest day',
		trainingHeatmap: (trained: number, rested: number) =>
			`Trained on ${countOf(trained, 'day', 'days')} and rested on ${countOf(rested, 'day', 'days')} in the last 52 weeks.`,
		foodHeatmap: (days: number) =>
			`Food logged on ${countOf(days, 'day', 'days')} in the last 52 weeks.`,
		proteinHeatmap: (days: number) =>
			`Protein goal met on ${countOf(days, 'day', 'days')} in the last 52 weeks.`,
		range: 'Range',
		fourWeeks: '4 weeks',
		threeMonths: '3 months',
		oneYear: '1 year',
		all: 'All',
		weight: 'Weight',
		calories: 'Calories',
		protein: 'Protein',
		dailyTotal: 'Daily total',
		goal: 'Goal',
		movingAverage: '7-day average',
		dailyAverage: 'Daily average',
		goalOf: (goal: string) => `Goal ${goal}`,
		mass: (amount: string, unit: string) => `${amount} ${unit}`,
		changeInRange: (change: string) => `${change} in this range`,
		noWeighIns: 'No weigh-ins in this range.',
		noFood: 'No food logged in this range.',
		nutritionSummary: (label: string, days: number, average: string) =>
			`${label} on ${countOf(days, 'logged day', 'logged days')}, averaging ${average}.`,
		latestGoal: (goal: string) => ` Latest goal ${goal}.`,
		exerciseProgress: 'Exercise progress',
		exercise: 'Exercise',
		heaviestSet: 'Heaviest set',
		estimatedOneRepMax: 'Estimated one-rep max',
		noExercises: 'Finish a workout with weighted sets to see exercise progress.',
		noSessions: 'No sets of this exercise in this range.',
		exerciseSummary: (summary: {
			readonly name: string;
			readonly sessions: number;
			readonly heaviest: string;
			readonly best: string;
		}) =>
			`${summary.name}: ${countOf(summary.sessions, 'session', 'sessions')}. Heaviest set ${summary.heaviest}, best estimated one-rep max ${summary.best}.`
	},
	today: {
		weighedInToday: 'Weighed in today',
		weighedIn: (weight: string) => `Weighed in: ${weight}`,
		notWeighedIn: 'Not weighed in yet.',
		workoutDone: 'Workout done.',
		restDayMarked: 'Rest day.',
		noTraining: 'No workout yet today.',
		food: 'Food',
		body: 'Body'
	},
	welcome: {
		title: 'Welcome',
		optional: (label: string) => `${label} (optional)`,
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
