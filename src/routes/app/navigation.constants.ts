import type { IconName } from '#lib/design/icon.constants.ts';
import { messages } from '#lib/i18n/messages.en.ts';
import { AppRoute } from './app-route.constants.ts';

/** A page in the tab bar. */
export type TabRoute = typeof AppRoute.today | typeof AppRoute.stats;

/** A screen reachable from the app shell. */
export interface Section<Route extends AppRoute = AppRoute> {
	readonly route: Route;
	readonly title: string;
	readonly icon: IconName;
	/** The tab this screen belongs to, lit in the tab bar while it shows; none for Settings and Welcome. */
	readonly tab?: TabRoute;
}

/** Home: one row per tracker, and the only screen with the app header. */
export const HOME_SECTION: Section<typeof AppRoute.today> = {
	route: AppRoute.today,
	title: messages.navigation.home,
	icon: 'home',
	tab: AppRoute.today
};

/** The tab bar, in display order. */
export const TAB_SECTIONS: readonly Section<TabRoute>[] = [
	HOME_SECTION,
	{ route: AppRoute.stats, title: messages.navigation.stats, icon: 'stats', tab: AppRoute.stats }
];

const tracking = (route: AppRoute, title: string): Section => ({
	route,
	title,
	icon: 'home',
	tab: AppRoute.today
});
const setting = (route: AppRoute, title: string): Section => ({ route, title, icon: 'settings' });

/** Pages opened from Home or Settings, each with its own back link and title. */
export const SCREEN_SECTIONS: readonly Section[] = [
	tracking(AppRoute.tracker, messages.navigation.tracker),
	tracking(AppRoute.log, messages.tracking.page.log),
	tracking(AppRoute.entry, messages.tracking.page.entry),
	tracking(AppRoute.editTracker, messages.tracking.page.editTracker),
	tracking(AppRoute.library, messages.navigation.library),
	tracking(AppRoute.subject, messages.navigation.library),
	tracking(AppRoute.newSubject, messages.tracking.library.newThing),
	tracking(AppRoute.workout, messages.tracking.workout.title),
	tracking(AppRoute.addExercise, messages.tracking.workout.addExercise),
	tracking(AppRoute.session, messages.tracking.workout.title),
	tracking(AppRoute.addFood, messages.tracking.food.add),
	tracking(AppRoute.portion, messages.tracking.food.add),
	tracking(AppRoute.compare, messages.tracking.compare.title),
	setting(AppRoute.settingsTrackers, messages.navigation.trackers),
	setting(AppRoute.addTracker, messages.tracking.add.title),
	setting(AppRoute.nameTracker, messages.tracking.add.title),
	setting(AppRoute.settingsTheme, messages.preferences.theme),
	setting(AppRoute.settingsUnits, messages.preferences.units),
	setting(AppRoute.settingsData, messages.navigation.data),
	setting(AppRoute.settingsSupport, messages.navigation.support),
	setting(AppRoute.settingsAbout, messages.settings.about)
];

/** The first-run screen, shown once before anything else. */
export const WELCOME_SECTION: Section<typeof AppRoute.welcome> = {
	route: AppRoute.welcome,
	title: messages.navigation.welcome,
	icon: 'home'
};

/** Settings, reached from the gear on Home. */
export const SETTINGS_SECTION: Section<typeof AppRoute.settings> = {
	route: AppRoute.settings,
	title: messages.navigation.settings,
	icon: 'settings'
};
