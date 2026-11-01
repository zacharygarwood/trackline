/** A named color theme; `system` follows the device's light or dark mode. */
export const Theme = {
	system: 'system',
	dark: 'dark',
	light: 'light',
	forest: 'forest',
	ocean: 'ocean',
	dusk: 'dusk',
	ember: 'ember',
	slate: 'slate',
	mocha: 'mocha',
	sand: 'sand',
	mint: 'mint',
	blossom: 'blossom',
	glacier: 'glacier'
} as const;

/** One of the {@link Theme} values. */
export type Theme = (typeof Theme)[keyof typeof Theme];

/** Something Home can show a progress bar for. */
export const HomeTracker = {
	calories: 'calories',
	protein: 'protein',
	carbs: 'carbs',
	fat: 'fat',
	workouts: 'workouts',
	weight: 'weight'
} as const;

/** One of the {@link HomeTracker} values. */
export type HomeTracker = (typeof HomeTracker)[keyof typeof HomeTracker];

/** Every {@link HomeTracker}, in the order Home and Settings list them. */
export const HOME_TRACKERS = [
	HomeTracker.calories,
	HomeTracker.protein,
	HomeTracker.carbs,
	HomeTracker.fat,
	HomeTracker.workouts,
	HomeTracker.weight
] as const;
