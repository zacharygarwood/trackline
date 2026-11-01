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
		todayScreenshot:
			'The Today screen: calories and protein against the goals, this week’s workouts, and weight.',
		statsScreenshot:
			'The Stats screen: workout days, weight, calories, and progress for each exercise.',
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
		today: 'Today',
		startWorkout: 'Start workout',
		pastWorkouts: 'Past workouts',
		myWorkouts: 'My workouts',
		editWorkout: 'Edit workout',
		editExercise: 'Edit exercise',
		addFood: 'Add food',
		myFoods: 'My foods',
		editFood: 'Edit food',
		pastDays: 'Past days',
		stats: 'Stats',
		newTracker: 'New tracker',
		editTracker: 'Edit tracker',
		home: 'Home',
		tabs: 'Sections',
		homeScreen: 'Home screen',
		tracking: 'Units and tracking',
		data: 'Backup and data',
		support: 'Support the app',
		eat: 'Food',
		settings: 'Settings',
		workout: 'Workout',
		welcome: 'Welcome',
		food: 'Food',
		newFood: 'New food',
		eaten: 'Eaten',
		savedWorkout: 'Saved workout',
		newExercise: 'New exercise',
		addExercise: 'Add exercise',
		photos: 'Photos',
		compare: 'Compare',
		weight: 'Weight',
		exercises: 'Exercises',
		exercise: 'Exercise',
		finishedWorkout: 'Finished workout'
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
		enterWeight: 'Enter your weight.',
		weightOutOfRange: (min: string, max: string) => `Enter a weight between ${min} and ${max}.`,
		editWeighIn: (date: string, weight: string) => `${date}, ${weight}. Edit`,
		chartTitle: 'Weight',
		chartSummary: (count: number, latest: string, average: string) =>
			`Weight chart with ${String(count)} ${count === 1 ? 'weigh-in' : 'weigh-ins'}. Latest ${latest}, 7-day average ${average}.`,
		chartGoal: (goal: string) => ` Goal ${goal}.`,
		goalWeight: 'Goal weight',
		noGoal: 'No goal set.',
		goalSummary: (target: string, direction: string) => `${target}, ${direction}`,
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
		sourceCode: 'Source code',
		donate: 'Support on Ko-fi',
		supportPitch: `${APP_NAME} is free, has no ads, and never sees your data. If it helps you, a small tip on Ko-fi keeps it going.`,
		supportThanks: 'Thank you!',
		backup: 'Backup',
		exportBackup: 'Export backup',
		restoreBackup: 'Restore from backup',
		lastBackup: 'Last backup',
		never: 'Never',
		overdue: 'Overdue',
		goals: 'Goals',
		versionLabel: 'Version',
		license: 'License',
		licenseShort: 'GPL-3.0',
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
		recent: 'Recent workouts',
		streak: (current: number, longest: number) =>
			`Streak: ${countOf(current, 'day', 'days')}. Best: ${countOf(longest, 'day', 'days')}.`,
		restDay: 'Rest day',
		nothingLogged: 'Nothing logged',
		addExercise: 'Add exercise',
		exerciseName: 'Exercise name',
		addNamed: (name: string) => `Add “${name}”`,
		addSet: 'Add set',
		removeExercise: (name: string) => `Remove ${name}`,
		setNumber: (position: number) => `Set ${String(position)}`,
		reps: 'Reps',
		setColumn: 'Set',
		previousColumn: 'Prev',
		previous: (weight: string, reps: number) => `${weight} × ${String(reps)}`,
		exerciseOptions: (name: string) => `${name} options`,
		weight: (unit: string) => `Weight (${unit})`,
		completeSet: (position: number) => `Complete set ${String(position)}`,
		removeSet: (position: number) => `Remove set ${String(position)}`,
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
		kcal: (calories: string) => `${calories} kcal`,
		ofTarget: (eaten: string, target: string) => `${eaten} / ${target}`,
		outOf: (target: string) => `/ ${target}`,
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
		trackers: {
			calories: 'Calories',
			protein: 'Protein',
			carbs: 'Carbs',
			fat: 'Fat',
			workouts: 'Workouts this week',
			weight: 'Weight'
		},
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
		goal: 'Goal',
		movingAverage: '7-day average',
		dailyAverage: 'Daily average',
		change: 'Change',
		mass: (amount: string, unit: string) => `${amount} ${unit}`,
		noWeighIns: 'No weigh-ins in this range.',
		noFood: 'No food logged in this range.',
		nutritionSummary: (label: string, days: number, average: string) =>
			`${label} on ${countOf(days, 'logged day', 'logged days')}, averaging ${average}.`,
		latestGoal: (goal: string) => ` Latest goal ${goal}.`,
		exerciseProgress: 'Exercise progress',
		exercise: 'Exercise',
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
		none: '—',
		weighedIn: (weight: string) => `Weighed in: ${weight}`,
		workoutDone: 'Workout done.',
		restDayMarked: 'Rest day.',
		noTraining: 'No workout yet today.'
	},
	home: {
		workouts: 'Workouts',
		weight: 'Weight',
		empty: 'Nothing tracked yet. Add a tracker in Settings, Home screen.'
	},
	welcome: {
		title: 'Welcome',
		optional: (label: string) => `${label} (optional)`,
		start: 'Get started'
	},
	shell: {
		resume: (name: string, time: string) => `Resume ${name}, ${time}`,
		resumeTime: (time: string) => `${time} →`,
		back: (section: string) => `← ${section}`,
		undo: 'Undo',
		undone: 'Undone'
	},
	food: {
		entries: 'What you ate',
		per100: (calories: string, portion: string) => `${calories} kcal per ${portion}`,
		noFoods: 'No foods yet. Add one from Add food.',
		noPastDays: 'Nothing logged on earlier days yet.',
		deleted: (name: string) => `Deleted ${name}`,
		name: 'Name',
		search: 'Search or add food',
		recent: 'Recent foods',
		results: 'Results',
		chooseAmount: (name: string) => `${name}. Choose amount`,
		less: 'Less',
		more: 'More',
		amountOf: (name: string, unit: string) => `Amount of ${name} in ${unit}`,
		add: 'Add',
		remove: 'Remove',
		preview: (calories: string, protein: string) => `${calories} kcal, ${protein} g protein`,
		createTitle: (name: string) => `Add “${name}”`,
		per: 'Per',
		amount: 'Amount',
		calories: 'Calories',
		proteinGrams: 'Protein, g',
		carbsGrams: 'Carbs, g',
		fatGrams: 'Fat, g',
		computedCalories: 'kcal',
		nothingYet: 'Nothing yet',
		entryLabel: (name: string, amount: string, unit: string) => `${name}, ${amount} ${unit}`,
		added: (name: string, amount: string) =>
			amount === '' ? `${name} added` : `${name} ${amount} added`,
		removed: (name: string) => `${name} removed`,
		times: (amount: string) => `×${amount}`,
		goal: (amount: string) => `/ ${amount}`,
		unitNames: {
			serving: { one: 'serving', many: 'servings' },
			piece: { one: 'piece', many: 'pieces' },
			cup: { one: 'cup', many: 'cups' }
		}
	},
	train: {
		yourWorkouts: 'Your workouts',
		addNewWorkout: '+ New workout',
		addNewExercise: (name: string) => `+ Add “${name}”`,
		edit: 'Edit',
		delete: 'Delete',
		deleted: (name: string) => `Deleted ${name}`,
		startOne: (name: string) => `Start the ${name} workout`,
		count: (count: number) => String(count),
		search: 'Search or add exercise',
		newWorkout: 'New workout',
		start: 'Start',
		add: 'Add',
		addTo: (workout: string) => `Add to ${workout}`,
		exercises: 'Exercises',
		startExercise: (name: string) => `Start ${name}`,
		addExercise: (name: string) => `Add ${name}`,
		addExerciseTo: (name: string, workout: string) => `Add ${name} to ${workout}`,
		saved: (name: string) => `${name} saved`,
		save: 'Save',
		name: 'Name',
		namePlaceholder: 'Push day',
		inThisWorkout: 'Exercises in this workout',
		toAdd: 'Exercises to add',
		addToThisWorkout: (name: string) => `Add ${name} to this workout`,
		remove: (name: string) => `Remove ${name}`
	},
	exercise: {
		createTitle: (name: string) => `Add “${name}”`,
		track: 'Track',
		fields: {
			weight: 'Weight',
			reps: 'Reps',
			time: 'Time',
			distance: 'Distance',
			grade: 'Grade',
			count: 'Number'
		},
		grades: 'Grades',
		scales: {
			v: 'V scale',
			yds: 'YDS',
			font: 'Font',
			one_to_ten: '1 to 10',
			custom: 'Custom'
		},
		scalePreview: (easiest: string, hardest: string) => `${easiest} to ${hardest}`,
		customGrades: 'Your grades, easiest first',
		customPlaceholder: 'White, Yellow, Orange, Green',
		countLabel: 'What you’re counting',
		countPlaceholder: 'Laps, rounds, floors',
		defaultCountLabel: 'Count',
		gradeSeparator: ',',
		saveToWorkout: 'Add to workout',
		saveToBuilder: 'Add to this workout',
		saveToLibrary: 'Save exercise',
		exists: (name: string) => `There’s already an exercise called ${name}.`,
		invalidName: 'Give it a name of up to 60 characters.',
		inUse: (workouts: string) =>
			`It’s in ${workouts}. Take it out of those workouts first, then delete it.`,
		listSeparator: ', '
	},
	workout: {
		backToTrain: 'Back to Train',
		time: 'Workout time',
		finish: 'Finish',
		chipDone: (name: string) => `${name}, done`,
		addExercise: 'Add exercise',
		grade: 'Grade',
		clockOf: (name: string) => `${name} time`,
		startClock: 'Start',
		pause: 'Pause',
		resume: 'Resume',
		pace: (time: string, unit: string) => `${time} per ${unit}`,
		reps: 'reps',
		less: (step: string, unit: string) => `${step} ${unit} less`,
		more: (step: string, unit: string) => `${step} ${unit} more`,
		oneRepLess: '1 rep less',
		oneRepMore: '1 rep more',
		oneLess: '1 less',
		oneMore: '1 more',
		sets: 'Sets',
		setLogged: (number: number, text: string) => `Set ${String(number)}, ${text}. Remove`,
		setOpen: (number: number) => `Set ${String(number)} not logged`,
		logged: 'Logged',
		removeEntry: (text: string) => `Remove ${text}`,
		logSet: 'Log set',
		done: 'Done',
		log: 'Log',
		rest: (time: string) => `Rest ${time}`,
		skip: 'Skip',
		doneWith: (name: string) => `Done with ${name}`,
		allDone: 'All done',
		finishWorkout: 'Finish workout',
		discard: 'Discard workout',
		saved: 'Workout saved',
		nothingLogged: 'Nothing logged',
		discarded: 'Workout discarded',
		loggedAnnouncement: (text: string) => `${text} logged`,
		restOver: 'Rest over',
		exerciseDone: (name: string) => `${name} done`,
		repsText: (reps: number) => `${String(reps)} reps`,
		weightTimesReps: (weight: string, reps: number) => `${weight} × ${String(reps)}`,
		compactWeightTimesReps: (weight: string, reps: number) => `${weight}×${String(reps)}`,
		withUnit: (amount: string, unit: string) => `${amount} ${unit}`,
		setsAt: ({
			sets,
			reps,
			weight,
			unit
		}: {
			sets: number;
			reps: number;
			weight: string;
			unit: string;
		}) => `${String(sets)} × ${String(reps)} at ${weight} ${unit}`,
		setsTop: (sets: number, weight: string, unit: string) =>
			`${String(sets)} sets, top ${weight} ${unit}`,
		topGrade: (grade: string, logged: number) => `Top ${grade}, ${String(logged)} logged`,
		partsSeparator: ', ',
		durationLabel: 'Time'
	},
	checkIn: {
		allPhotos: 'All photos',
		weightIn: (unit: string) => `Weight, ${unit}`,
		tenthMore: '0.1 more',
		tenthLess: '0.1 less',
		checkNumber: 'Check the number',
		takePhoto: 'Take photo',
		changePhoto: 'Change photo',
		checkIn: 'Check in',
		update: 'Update',
		checkedIn: 'Checked in',
		updated: 'Updated',
		photos: 'Photos',
		noPhotos: 'No photos yet. Add one with your next check-in.',
		photoAlt: (date: string, weight: string) => `Photo from ${date}, ${weight}`,
		comparePhotoAlt: (date: string) => `Photo from ${date}`
	},
	trends: {
		timeRange: 'Time range',
		ranges: {
			'one-month': '1M',
			'three-months': '3M',
			'six-months': '6M',
			'one-year': '1Y',
			all: 'All'
		},
		rangeWords: {
			'one-month': 'the past month',
			'three-months': 'the past 3 months',
			'six-months': 'the past 6 months',
			'one-year': 'the past year',
			all: 'all time'
		},
		workoutDays: 'Workout days',
		noWeight: 'No weigh-ins in this range.',
		noWorkouts: 'No workouts yet.',
		heatmap: (days: number, range: string) =>
			`${String(days)} workout days in ${range}. Brighter squares mean longer workouts`,
		weekdayLetters: ['', 'M', '', 'W', '', 'F', ''],
		weightChart: ({
			range,
			direction,
			change,
			unit
		}: {
			range: string;
			direction: 'down' | 'up';
			change: string;
			unit: string;
		}) => `Weight over ${range}, ${direction} ${change} ${unit}`,
		goal: (calories: string) => `goal ${calories}`,
		average: 'avg',
		caloriesChart: (range: string, goal: string, weeks: string) =>
			`Average daily calories over ${range}, goal ${goal}: ${weeks}`,
		bestOver: ({
			name,
			range,
			from,
			to
		}: {
			name: string;
			range: string;
			from: string;
			to: string;
		}) => `${name} best over ${range}, from ${from} to ${to}`,
		bestGradeOver: ({
			name,
			range,
			from,
			to
		}: {
			name: string;
			range: string;
			from: string;
			to: string;
		}) => `${name} best grade over ${range}, from ${from} to ${to}`,
		totalOver: ({
			name,
			total,
			unit,
			range
		}: {
			name: string;
			total: string;
			unit: string;
			range: string;
		}) => `${name}, ${total} ${unit} over ${range}`,
		grades: (change: string, count: number) => `${change} ${count === 1 ? 'grade' : 'grades'}`,
		hours: 'h',
		minutes: 'min',
		reps: 'reps',
		saveToWorkouts: 'Save to Workouts',
		savedToWorkouts: 'Saved to Workouts'
	},
	preferences: {
		theme: 'Theme',
		themes: {
			system: 'System',
			dark: 'Dark',
			light: 'Light',
			forest: 'Forest',
			ocean: 'Ocean',
			dusk: 'Dusk',
			ember: 'Ember',
			slate: 'Slate',
			mocha: 'Mocha',
			sand: 'Sand',
			mint: 'Mint',
			blossom: 'Blossom',
			glacier: 'Glacier'
		},
		tracking: 'Tracking',
		carbsAndFat: 'Carbs and fat',
		units: 'Units',
		weight: 'Weight',
		distance: 'Distance',
		newFoods: 'New foods',
		workouts: 'Workouts',
		restTimer: 'Rest timer',
		weekStarts: 'Week starts',
		monday: 'Mon',
		sunday: 'Sun',
		unitNames: { kcal: 'kcal', grams: 'g' }
	},
	trackers: {
		none: '—',
		units: {
			calories: 'kcal',
			protein: 'g',
			carbs: 'g',
			fat: 'g',
			workouts: '',
			sessions: 'sessions',
			time: 'min',
			reps: 'reps',
			sets: 'sets',
			duration: 'min',
			rating: 'of 5',
			done: 'days'
		},
		toward: (goal: string, unit: string) => `to ${goal} ${unit}`,
		atLeast: (goal: string, unit: string) => (unit === '' ? `/ ${goal}` : `/ ${goal} ${unit}`),
		atMost: (goal: string, unit: string) =>
			unit === '' ? `/ ${goal} max` : `/ ${goal} ${unit} max`,
		sources: { food: 'Food', workouts: 'Workouts', weight: 'Weight', log: 'Your log' },
		measures: {
			calories: 'Calories',
			protein: 'Protein',
			carbs: 'Carbs',
			fat: 'Fat',
			food: 'A food',
			workouts: 'Workouts',
			sessions: 'Sessions of an exercise',
			distance: 'Distance of an exercise',
			time: 'Time of an exercise',
			reps: 'Reps of an exercise',
			sets: 'Sets of an exercise',
			weight: 'Weight',
			number: 'A number',
			duration: 'Minutes',
			rating: 'A rating, 1 to 5',
			done: 'Done or not'
		},
		directions: { at_least: 'At least', at_most: 'At most' },
		periods: { day: 'A day', week: 'A week' },
		combines: { total: 'Add up', average: 'Average', days: 'Days' },
		presets: {
			calories: 'Calories',
			protein: 'Protein',
			carbs: 'Carbs',
			fat: 'Fat',
			workouts: 'Workouts',
			weight: 'Weight',
			run: 'Run',
			climb: 'Climb',
			water: 'Water',
			sleep: 'Sleep',
			steps: 'Steps',
			meditate: 'Meditate',
			mood: 'Mood',
			vitamins: 'Vitamins',
			coffee: 'Coffee'
		},
		presetSummary: (goal: string, unit: string, period: string) =>
			unit === '' ? `${goal} ${period}` : `${goal} ${unit} ${period}`,
		perPeriod: { day: 'a day', week: 'a week' },
		presetUnits: { water: 'glasses', sleep: 'h', steps: 'steps', coffee: 'cups' },
		noUnit: '',
		weightPreset: 'toward a goal weight',
		addTracker: 'Add tracker',
		presetsHeading: 'Presets',
		buildYourOwn: 'Build your own',
		from: 'From',
		what: 'What',
		which: (source: string) => (source === 'food' ? 'Which food' : 'Which exercise'),
		choose: 'Choose…',
		name: 'Name',
		unit: 'Unit',
		unitPlaceholder: 'glasses',
		goal: 'Goal',
		goalIn: (unit: string) => `Goal, ${unit}`,
		direction: 'Goal is',
		every: 'Every',
		combine: 'Counting',
		invalid: 'Check the name and goal, and pick a food or exercise if asked.',
		saved: (name: string) => `${name} saved`,
		deleted: (name: string) => `Deleted ${name}`,
		delete: 'Delete tracker',
		edit: 'Edit tracker',
		moveUp: (name: string) => `Move ${name} up`,
		moveDown: (name: string) => `Move ${name} down`,
		log: 'Log',
		logged: (name: string, value: string) => `${name}: ${value}`,
		doneToday: 'Done today',
		markDone: 'Mark done for today',
		rate: (value: number) => `Rate ${String(value)}`,
		history: 'Latest',
		nothingLogged: 'Nothing logged yet.',
		removeEntry: (date: string) => `Remove ${date}`,
		removed: 'Entry removed',
		yourTrackers: 'Your trackers',
		weeklyChart: (name: string, values: string) => `${name}, week by week: ${values}`
	},

	design: {
		close: 'Close',
		decimalSeparator: 'Decimal point',
		deleteDigit: 'Delete'
	}
} as const;
