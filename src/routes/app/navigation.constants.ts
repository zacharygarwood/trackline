import type { IconName } from '#lib/design/icon.constants.ts';
import { messages } from '#lib/i18n/messages.en.ts';
import { AppRoute } from './app-route.constants.ts';

/** A screen reachable from the app shell. */
export interface Section {
	readonly route: AppRoute;
	readonly title: string;
	readonly icon: IconName;
}

/** The five tabs of the bottom bar, in order. */
export const TAB_SECTIONS: readonly Section[] = [
	{ route: AppRoute.today, title: messages.navigation.today, icon: 'today' },
	{ route: AppRoute.eat, title: messages.navigation.eat, icon: 'eat' },
	{ route: AppRoute.train, title: messages.navigation.train, icon: 'train' },
	{ route: AppRoute.body, title: messages.navigation.body, icon: 'body' },
	{ route: AppRoute.stats, title: messages.navigation.stats, icon: 'stats' }
];

/** Screens without a tab or a header of their own: the workout, the workout builder, and photo comparison. */
export const SCREEN_SECTIONS: readonly Section[] = [
	{ route: AppRoute.workout, title: messages.navigation.workout, icon: 'train' },
	{ route: AppRoute.newWorkout, title: messages.train.newWorkout, icon: 'train' },
	{ route: AppRoute.photos, title: messages.body.progressPhotos, icon: 'body' }
];

/** The first-run screen, shown once before anything else. */
export const WELCOME_SECTION: Section = {
	route: AppRoute.welcome,
	title: messages.navigation.welcome,
	icon: 'today'
};

/** Settings, reached from the gear in the header rather than a tab. */
export const SETTINGS_SECTION: Section = {
	route: AppRoute.settings,
	title: messages.navigation.settings,
	icon: 'settings'
};
