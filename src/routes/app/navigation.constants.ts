import type { IconName } from '#lib/design/icon.constants.ts';
import { messages } from '#lib/i18n/messages.en.ts';
import { AppRoute } from './app-route.constants.ts';

/** A page in the tab bar. */
export type TabRoute =
	| typeof AppRoute.today
	| typeof AppRoute.eat
	| typeof AppRoute.train
	| typeof AppRoute.body
	| typeof AppRoute.stats;

/** A screen reachable from the app shell. */
export interface Section<Route extends AppRoute = AppRoute> {
	readonly route: Route;
	readonly title: string;
	readonly icon: IconName;
	/** The tab this screen belongs to, lit in the tab bar while it shows; none for Settings and Welcome. */
	readonly tab?: TabRoute;
}

/** Home: the progress bars, and the only screen with the app header. */
export const HOME_SECTION: Section<typeof AppRoute.today> = {
	route: AppRoute.today,
	title: messages.navigation.today,
	icon: 'today',
	tab: AppRoute.today
};

/** The tab bar, in display order. */
export const TAB_SECTIONS: readonly Section<TabRoute>[] = [
	{ ...HOME_SECTION, title: messages.navigation.home, icon: 'home' },
	{ route: AppRoute.eat, title: messages.navigation.eat, icon: 'eat', tab: AppRoute.eat },
	{ route: AppRoute.train, title: messages.home.workouts, icon: 'train', tab: AppRoute.train },
	{ route: AppRoute.body, title: messages.home.weight, icon: 'body', tab: AppRoute.body },
	{ route: AppRoute.stats, title: messages.navigation.stats, icon: 'stats', tab: AppRoute.stats }
];

const food = (route: AppRoute, title: string): Section => ({
	route,
	title,
	icon: 'eat',
	tab: AppRoute.eat
});
const training = (route: AppRoute, title: string): Section => ({
	route,
	title,
	icon: 'train',
	tab: AppRoute.train
});
const body = (route: AppRoute, title: string): Section => ({
	route,
	title,
	icon: 'body',
	tab: AppRoute.body
});
const setting = (route: AppRoute, title: string): Section => ({ route, title, icon: 'settings' });

/** Pages opened from a tab or from Settings, each with its own back link and title. */
export const SCREEN_SECTIONS: readonly Section[] = [
	food(AppRoute.addFood, messages.navigation.addFood),
	food(AppRoute.food, messages.navigation.food),
	food(AppRoute.newFood, messages.navigation.newFood),
	food(AppRoute.eaten, messages.navigation.today),
	food(AppRoute.eatenEntry, messages.navigation.eaten),
	food(AppRoute.pastDays, messages.navigation.pastDays),
	food(AppRoute.pastDay, messages.navigation.pastDays),
	food(AppRoute.myFoods, messages.navigation.myFoods),
	food(AppRoute.editFood, messages.navigation.editFood),
	training(AppRoute.startWorkout, messages.navigation.startWorkout),
	training(AppRoute.pastWorkouts, messages.navigation.pastWorkouts),
	training(AppRoute.pastWorkout, messages.navigation.finishedWorkout),
	training(AppRoute.myWorkouts, messages.navigation.myWorkouts),
	training(AppRoute.savedWorkout, messages.navigation.savedWorkout),
	training(AppRoute.newWorkout, messages.train.newWorkout),
	training(AppRoute.editWorkout, messages.navigation.editWorkout),
	training(AppRoute.exercises, messages.navigation.exercises),
	training(AppRoute.newExercise, messages.navigation.newExercise),
	training(AppRoute.editExercise, messages.navigation.editExercise),
	training(AppRoute.workout, messages.navigation.workout),
	training(AppRoute.addExercise, messages.navigation.addExercise),
	body(AppRoute.photos, messages.navigation.photos),
	body(AppRoute.compare, messages.navigation.compare),
	setting(AppRoute.tracker, messages.navigation.newTracker),
	setting(AppRoute.addTracker, messages.trackers.addTracker),
	{ route: AppRoute.trackerLog, title: messages.trackers.log, icon: 'today', tab: AppRoute.today },
	setting(AppRoute.settingsHome, messages.navigation.homeScreen),
	setting(AppRoute.settingsTheme, messages.preferences.theme),
	setting(AppRoute.settingsTracking, messages.navigation.tracking),
	setting(AppRoute.settingsData, messages.navigation.data),
	setting(AppRoute.settingsSupport, messages.navigation.support),
	setting(AppRoute.settingsAbout, messages.settings.about)
];

/** The first-run screen, shown once before anything else. */
export const WELCOME_SECTION: Section<typeof AppRoute.welcome> = {
	route: AppRoute.welcome,
	title: messages.navigation.welcome,
	icon: 'today'
};

/** Settings, reached from the gear on Home. */
export const SETTINGS_SECTION: Section<typeof AppRoute.settings> = {
	route: AppRoute.settings,
	title: messages.navigation.settings,
	icon: 'settings'
};
