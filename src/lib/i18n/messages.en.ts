const APP_NAME = 'Trackline';

/** The singular of each unit label templates give a number field, for an amount of exactly one. */
const SINGULAR_UNITS: ReadonlyMap<string, string> = new Map([
	['reps', 'rep'],
	['steps', 'step'],
	['servings', 'serving'],
	['glasses', 'glass'],
	['cups', 'cup']
]);

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
		tagline:
			'A small, private, local tracker for workouts, food, sleep, and anything else you want to keep track of.',
		updateReady: 'A new version is ready.',
		reload: 'Reload',
		installHint: `Install ${APP_NAME}: tap Share, then Add to Home Screen.`,
		dismiss: 'Got it',
		storageUnavailable:
			'Your data could not be opened on this device. Try reloading, or use a browser that supports offline storage.'
	},
	landing: {
		openApp: 'Open the app',
		todayScreenshot: 'Home, with a row for each thing you track.',
		statsScreenshot: 'Stats, showing the last few weeks of each tracker.',
		installTitle: 'Add it to your phone',
		installIphone: 'iPhone: open this page in Safari, tap Share, then Add to Home Screen.',
		installAndroid: 'Android: open this page in Chrome, tap the menu, then Install app.',
		installMore: 'Using another browser? See every way to install it.',
		trackersTitle: 'Things you can track'
	},
	templatePages: {
		otherTitle: 'Other trackers',
		more: 'More',
		allTitle: 'Everything you can track',
		allTagline: 'Start from a ready-made tracker, or build your own.',
		readyTitle: 'Ready-made trackers',
		buildTitle: 'Build your own',
		buildSummary:
			'Pick a building block and give it a name. Practice hours, photos of your dog, books you’ve read: if you can count it, rate it, or take a picture of it, you can track it.',
		featuresTitle: 'What you get',
		pages: {
			workouts: {
				link: 'Workouts',
				title: 'Workout tracker',
				tagline: 'Log your sets and watch your lifts go up.',
				features: [
					'Sets, reps, and weight',
					'A rest timer between sets',
					'Your own exercises, or ours',
					'A goal for workouts each week'
				],
				screenshots: {
					page: 'A workout tracker with past workouts.',
					detail: 'The sets of one workout.'
				}
			},
			food: {
				link: 'Food',
				title: 'Food tracker',
				tagline: 'Keep an eye on what you eat.',
				features: [
					'Calories, protein, carbs, and fat',
					'Your own list of foods',
					'Quick add when you’re busy',
					'A daily calorie goal'
				],
				screenshots: {
					page: 'A food tracker with today’s meals.',
					detail: 'A list of saved foods.'
				}
			},
			water: {
				link: 'Water',
				title: 'Water tracker',
				tagline: 'Drink more water.',
				features: [
					'One tap for each glass',
					'A daily goal you pick',
					'The last few weeks in Stats'
				],
				screenshots: {
					page: 'A water tracker with today’s glasses.',
					detail: 'Logging a glass of water.'
				}
			},
			sleep: {
				link: 'Sleep',
				title: 'Sleep tracker',
				tagline: 'See how much you really sleep.',
				features: [
					'Hours and minutes slept',
					'Rate how well you slept',
					'A nightly goal you pick',
					'The last few weeks in Stats'
				],
				screenshots: {
					page: 'A sleep tracker with recent nights.',
					detail: 'Logging a night’s sleep.'
				}
			},
			weight: {
				link: 'Weight',
				title: 'Weight tracker',
				tagline: 'Follow your weight over time.',
				features: ['Kilograms or pounds', 'A goal weight', 'Weigh in as often as you like'],
				screenshots: {
					page: 'A weight tracker with recent weigh-ins.',
					detail: 'Logging a weigh-in.'
				}
			},
			steps: {
				link: 'Steps',
				title: 'Step log',
				tagline: 'Keep a daily record of your steps.',
				features: ['One number a day', 'A daily step goal you pick', 'The last few weeks in Stats'],
				screenshots: { page: 'A steps tracker with recent days.', detail: 'Logging a day’s steps.' }
			}
		}
	},
	site: {
		home: APP_NAME,
		footer: 'Site',
		privacy: 'Privacy',
		faq: 'FAQ',
		install: 'Install',
		source: 'Source',
		donate: 'Donate'
	},
	install: {
		title: 'Install Trackline',
		summary:
			'Add Trackline to your home screen and it opens like any other app, even offline. It’s free and there’s nothing to download from an app store.',
		iphoneTitle: 'iPhone and iPad',
		androidTitle: 'Android',
		iphone: [
			{
				browser: 'Safari',
				steps:
					'Tap Share, then Add to Home Screen. If you don’t see Share, tap the three dots first.'
			},
			{ browser: 'Chrome', steps: 'Tap Share in the address bar, then Add to Home Screen.' },
			{ browser: 'Edge', steps: 'Tap the menu, then Share, then Add to Home Screen.' },
			{ browser: 'Firefox', steps: 'Tap the menu, then Share, then Add to Home Screen.' }
		],
		android: [
			{ browser: 'Chrome', steps: 'Tap the three dots, then Add to home screen, then Install.' },
			{
				browser: 'Samsung Internet',
				steps: 'Tap the menu, then Add page to, then Home screen.'
			},
			{ browser: 'Firefox', steps: 'Tap the three dots, then Add to Home screen.' },
			{ browser: 'Edge', steps: 'Tap the menu, then Add to phone.' }
		],
		after:
			'Then open Trackline from your home screen. Everything you track stays on that phone, so export a backup from Settings now and then.'
	},
	privacy: {
		title: 'Privacy',
		summary: `${APP_NAME} keeps what you log on your device. It doesn’t send it anywhere.`,
		paragraphs: [
			'There’s no account and no server. Everything you track, photos included, is saved in your browser’s storage for this site, on this device.',
			'The app only goes online to download its own updates from this site. There are no analytics, crash reports, ads, or cookies, and it doesn’t load scripts, fonts, or images from anywhere else. The source is public, and an automated test fails if the app ever contacts another site.',
			'When you add a photo, the app redraws it. That removes the hidden details photos carry, like where it was taken and which camera took it.',
			'Backups are files you save yourself. The app never uploads them.',
			'The links to the source code and to Ko-fi are plain links. Nothing from those sites loads unless you tap one.',
			'Deleting all data in Settings removes everything from this device. There’s no other copy to delete.'
		]
	},
	faq: {
		title: 'FAQ',
		entries: [
			{
				question: 'How do I install it?',
				answer:
					'Open it in your phone’s browser and add it to your home screen. The Install page has the steps for each browser.'
			},
			{
				question: 'Where is my data stored?',
				answer:
					'On your device, in your browser’s storage for this site. There’s no account and no copy anywhere else.'
			},
			{
				question: 'What if I lose my phone or clear my browser data?',
				answer:
					'Then your data is gone, since it only lived there. Export a backup from Settings every so often and keep it somewhere safe. The app reminds you when your last backup is a month old.'
			},
			{
				question: 'How do I move to a new phone?',
				answer:
					'Export a backup on the old phone, copy the file to the new one, open the app there, and restore it from Settings.'
			},
			{
				question: 'Does it work offline?',
				answer: 'Yes. After your first visit, it works without a connection.'
			},
			{
				question: 'Why is there no sync or account?',
				answer:
					'Because then your data would have to live on a server. Keeping it on your phone is simpler and safer. Backups take care of moving to a new device.'
			},
			{
				question: 'Is it free?',
				answer:
					'Yes. No ads, no paid version. It’s open source under the GNU GPL v3. If you’d like to chip in, there’s a Ko-fi page.'
			},
			{
				question: 'Can I host it myself?',
				answer:
					'Yes. It’s a static site with no backend. The README in the source repository shows how to build it and put it on any static host.'
			}
		]
	},
	navigation: {
		home: 'Home',
		stats: 'Stats',
		tabs: 'Sections',
		settings: 'Settings',
		welcome: 'Welcome',
		tracker: 'Tracker',
		library: 'Library',
		trackers: 'Trackers',
		data: 'Data',
		support: 'Support the app'
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
	settings: {
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
			readonly trackers: number;
			readonly entries: number;
			readonly photos: number;
		}) =>
			[
				countOf(counts.trackers, 'tracker', 'trackers'),
				countOf(counts.entries, 'entry', 'entries'),
				countOf(counts.photos, 'photo', 'photos')
			].join(', ')
	},
	shell: {
		resume: (name: string, time: string) => `Resume ${name}, ${time}`,
		resumeTime: (time: string) => `${time} →`,
		back: (section: string) => `← ${section}`,
		undo: 'Undo',
		undone: 'Undone'
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
		units: 'Units',
		weight: 'Weight',
		distance: 'Distance',
		restTimer: 'Rest timer',
		weekStarts: 'Week starts',
		monday: 'Mon',
		sunday: 'Sun'
	},

	tracking: {
		templates: {
			photos: 'Photos',
			number: 'Number',
			done: 'Check off',
			time: 'Time',
			rating: 'Rating',
			notes: 'Notes',
			collection: 'Collection',
			workouts: 'Workouts',
			running: 'Running',
			steps: 'Steps',
			weight: 'Weight',
			body_photos: 'Body photos',
			food: 'Food',
			water: 'Water',
			coffee: 'Coffee',
			sleep: 'Sleep',
			mood: 'Mood',
			meditation: 'Meditation',
			journal: 'Journal',
			reading: 'Reading',
			plants: 'Plants',
			vitamins: 'Vitamins'
		},
		templateHints: {
			photos: 'Photos of anything, to compare over time',
			number: 'Any amount, like pages or push-ups',
			done: 'One tap when it’s done for the day',
			time: 'Time spent on anything',
			rating: 'Rate it 1 to 5, with a note',
			notes: 'A few lines whenever you like',
			collection: 'A list of things, each with its own photos and notes',
			workouts: 'Sets, reps, and weight, with a rest timer',
			running: 'Distance, time, and pace',
			steps: 'Steps a day',
			weight: 'Weigh-ins toward a goal weight',
			body_photos: 'Progress photos to compare',
			food: 'Calories and macros',
			water: 'Glasses a day',
			coffee: 'Cups a day',
			sleep: 'Hours and how well',
			mood: 'How you feel, with a note',
			meditation: 'Minutes a day',
			journal: 'A few lines a day',
			reading: 'Minutes a day',
			plants: 'Watering and photos of each plant',
			vitamins: 'Taken today or not'
		},
		groups: {
			basic: 'Basics',
			move: 'Fitness',
			body: 'Body',
			eat: 'Food & Drink',
			mind: 'Mind & Sleep',
			life: 'Habits & Hobbies'
		},
		fields: {
			reps: 'Reps',
			weight: 'Weight',
			time: 'Time',
			distance: 'Distance',
			steps: 'Steps',
			photo: 'Photo',
			note: 'Note',
			servings: 'Servings',
			calories: 'Calories',
			protein: 'Protein',
			carbs: 'Carbs',
			fat: 'Fat',
			glasses: 'Glasses',
			cups: 'Cups',
			quality: 'How well',
			mood: 'Mood',
			watered: 'Watered',
			taken: 'Taken',
			amount: 'Amount',
			done: 'Done',
			rating: 'Rating'
		},
		units: {
			reps: 'reps',
			steps: 'steps',
			servings: 'servings',
			kcal: 'kcal',
			g: 'g',
			glasses: 'glasses',
			cups: 'cups'
		},
		starters: {
			squat: 'Squat',
			bench_press: 'Bench press',
			deadlift: 'Deadlift',
			overhead_press: 'Overhead press',
			row: 'Row',
			pull_up: 'Pull-up',
			push_up: 'Push-up',
			plank: 'Plank'
		},
		periods: { day: 'a day', week: 'a week', month: 'a month' },
		goal: {
			atLeast: (amount: string, period: string) => `${amount} ${period}`,
			atMost: (amount: string, period: string) => `${amount} max ${period}`,
			target: (amount: string) => `Goal ${amount}`,
			of: (amount: string) => `/ ${amount}`
		},
		countUnits: { entries: 'times', days: 'days', sessions: 'workouts' },
		counts: {
			entries: (count: number) => countOf(count, 'time', 'times'),
			days: (count: number) => countOf(count, 'day', 'days'),
			sessions: (count: number) => countOf(count, 'workout', 'workouts')
		},
		values: {
			done: 'Done',
			stars: (stars: number) => `${String(stars)}/5`,
			starsLabel: (stars: number) => `${String(stars)} out of 5`,
			hours: (hours: number, minutes: number) =>
				minutes === 0 ? `${String(hours)} h` : `${String(hours)} h ${String(minutes)} min`,
			minutes: (minutes: number) => `${String(minutes)} min`,
			seconds: (seconds: number) => `${String(seconds)} s`,
			amount: (amount: string, unit: string) => (unit === '' ? amount : `${amount} ${unit}`),
			singularUnit: (unit: string) => SINGULAR_UNITS.get(unit) ?? unit,
			photo: 'Photo',
			pace: (pace: string, unit: string) => `${pace} /${unit}`,
			join: (parts: readonly string[]) => parts.join(' · ')
		},
		inputs: {
			hours: 'Hours',
			minutes: 'Minutes',
			seconds: 'Seconds',
			less: (label: string) => `Less ${label.toLowerCase()}`,
			more: (label: string) => `More ${label.toLowerCase()}`,
			optional: (label: string) => `${label} (optional)`,
			notePlaceholder: 'Add a note',
			takePhoto: 'Take or choose a photo',
			retakePhoto: 'Choose another photo',
			unreadablePhoto: 'That file is not a photo this device can open.',
			done: 'Done today'
		},
		home: {
			empty: 'Nothing tracked yet. Add a tracker in Settings, under Trackers.',
			addTracker: 'Add tracker'
		},
		page: {
			history: 'History',
			nothingLogged: 'Nothing logged yet.',
			edit: 'Edit',
			editTracker: 'Edit tracker',
			log: 'Log',
			save: 'Save',
			addPhoto: 'Add photo',
			compare: 'Compare',
			photos: 'Photos',
			logged: (name: string) => `${name} logged`,
			deleted: 'Entry deleted',
			deleteEntry: 'Delete entry',
			entry: 'Entry',
			fixProblem: 'Check the values and try again.',
			fillRequired: (label: string) => `Fill in ${label.toLowerCase()}.`
		},
		library: {
			exercises: 'Exercises',
			foods: 'My foods',
			newExercise: 'New exercise',
			newFood: 'New food',
			newThing: 'Add new',
			name: 'Name',
			emptyExercises: 'No exercises yet.',
			emptyFoods: 'No foods yet. Foods you add appear here.',
			emptyThings: 'Nothing here yet.',
			delete: 'Delete',
			deleted: (name: string) => `${name} deleted`,
			save: 'Save',
			tracks: 'Tracks',
			perServing: 'Per serving',
			lastLogged: (when: string) => `Last ${when.toLowerCase()}`,
			never: 'Not logged yet',
			wateredToday: 'Watered today'
		},
		exerciseFields: {
			lift: 'Reps and weight',
			reps: 'Reps only',
			time: 'Time',
			cardio: 'Distance and time'
		},
		workout: {
			start: 'Start workout',
			resume: 'Resume workout',
			title: 'Workout',
			finish: 'Finish',
			discard: 'Discard workout',
			discardConfirm: 'Discard this workout and its sets?',
			addExercise: 'Add exercise',
			addSet: 'Add set',
			set: (number: number) => `Set ${String(number)}`,
			deleteSet: (number: number) => `Delete set ${String(number)}`,
			lastTime: (sets: string) => `Last time: ${sets}`,
			restLeft: (time: string) => `Rest ${time}`,
			restDone: 'Rest done',
			skipRest: 'Skip',
			past: 'Past workouts',
			noneYet: 'No workouts yet.',
			finished: 'Workout saved',
			empty: 'Nothing logged, so the workout was not saved.',
			elapsed: (time: string) => `${time} so far`,
			summary: (exercises: number, sets: number) =>
				`${countOf(exercises, 'exercise', 'exercises')}, ${countOf(sets, 'set', 'sets')}`,
			duration: (time: string) => `Took ${time}`,
			chooseExercise: 'Choose an exercise',
			deleteWorkout: 'Delete workout',
			workoutDeleted: 'Workout deleted'
		},
		food: {
			add: 'Add food',
			search: 'Search or add food',
			today: 'Today',
			quickAdd: 'Quick add calories',
			create: (name: string) => `New food “${name}”`,
			servings: 'Servings',
			add_portion: 'Add',
			quickEntry: 'Quick add'
		},
		compare: {
			title: 'Compare',
			before: 'Before',
			after: 'After',
			choose: 'Choose two photos to compare.',
			photoOf: (date: string) => `Photo from ${date}`
		},
		edit: {
			name: 'Name',
			goalAmount: 'Amount',
			goalType: 'Goal',
			goalUnit: 'Unit',
			goalEvery: 'Every',
			goalTarget: 'Target',
			goalNeeded: 'Enter a goal, so the bar has something to fill.',
			goalKinds: {
				days: 'Days',
				entries: 'Times',
				sessions: 'Workouts',
				total: 'Total',
				average: 'Average',
				target: 'Reach a number'
			},
			goalPeriods: { day: 'Day', week: 'Week', month: 'Month' },
			goalDirections: { at_least: 'At least', at_most: 'At most' },
			delete: 'Delete tracker',
			deleteConfirm: (name: string) =>
				`Delete ${name} and everything logged to it? This cannot be undone.`,
			deleted: (name: string) => `${name} deleted`,
			moveUp: (name: string) => `Move ${name} up`,
			moveDown: (name: string) => `Move ${name} down`,
			saved: 'Saved'
		},
		add: {
			title: 'Add tracker',
			added: (name: string) => `${name} added`,
			name: 'What are you tracking?',
			nameNeeded: 'Give it a name.',
			create: 'Add tracker',
			examples: {
				photos: 'Dog',
				number: 'Push-ups',
				done: 'Floss',
				time: 'Piano practice',
				rating: 'Energy',
				notes: 'Ideas',
				collection: 'Pets'
			}
		},
		onboarding: {
			title: 'What do you want to track?',
			intro: 'Pick a few. You can add more, or change anything, later.',
			next: 'Next',
			back: 'Back',
			unitsTitle: 'Your units',
			goalsTitle: 'Your goals',
			goalsIntro: 'These are good places to start. Change them any time.',
			start: 'Start tracking',
			pickOne: 'Pick at least one thing to track.',
			nextWith: (count: number) => `Next · ${countOf(count, 'tracker', 'trackers')}`
		},
		stats: {
			title: 'Stats',
			empty: 'Trackers with a goal show their history here.',
			summary: (name: string, values: string) => `${name}: ${values}`
		}
	},
	design: {
		close: 'Close',
		decimalSeparator: 'Decimal point',
		deleteDigit: 'Delete'
	}
} as const;
