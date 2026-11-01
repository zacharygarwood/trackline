/** The route ids of the public site around the app; pass them to `resolve`. */
export const SiteRoute = {
	home: '/(site)',
	privacy: '/(site)/privacy',
	faq: '/(site)/faq',
	install: '/(site)/install',
	trackers: '/(site)/track',
	template: '/(site)/track/[template]'
} as const;

/** The templates with their own page on the site, each at `/track/<template>`. */
export const TemplatePage = {
	workouts: 'workouts',
	food: 'food',
	water: 'water',
	sleep: 'sleep',
	weight: 'weight',
	steps: 'steps'
} as const;

/** One of the {@link TemplatePage} values. */
export type TemplatePage = (typeof TemplatePage)[keyof typeof TemplatePage];
