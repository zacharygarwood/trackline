/** The landing page screenshots, made in the light theme with `pnpm screenshots`. */
export const Screenshot = {
	today: 'screenshots/today.jpg',
	stats: 'screenshots/stats.jpg'
} as const;

/** Each template page's screenshots: the tracker's page, and one screen it opens. */
export const TrackerScreenshot = {
	workouts: { page: 'screenshots/workouts.jpg', detail: 'screenshots/workouts-detail.jpg' },
	food: { page: 'screenshots/food.jpg', detail: 'screenshots/food-detail.jpg' },
	water: { page: 'screenshots/water.jpg', detail: 'screenshots/water-detail.jpg' },
	sleep: { page: 'screenshots/sleep.jpg', detail: 'screenshots/sleep-detail.jpg' },
	weight: { page: 'screenshots/weight.jpg', detail: 'screenshots/weight-detail.jpg' },
	steps: { page: 'screenshots/steps.jpg', detail: 'screenshots/steps-detail.jpg' }
} as const;

/** Any one of the site's screenshot files. */
export type ScreenshotFile =
	| (typeof Screenshot)[keyof typeof Screenshot]
	| (typeof TrackerScreenshot)[keyof typeof TrackerScreenshot][keyof (typeof TrackerScreenshot)[keyof typeof TrackerScreenshot]];
