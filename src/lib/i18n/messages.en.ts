/**
 * Every user-facing English string in the app, grouped by where it appears.
 *
 * Components read text from here instead of using string literals, so wording
 * stays consistent and can be translated later.
 */
export const messages = {
	app: {
		name: 'Buffalog',
		tagline: 'A small, private tracker for workouts, food, and body weight.'
	},
	landing: {
		comingSoon: 'Coming soon.'
	}
} as const;
