import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Theme } from './preferences.constants.ts';

const ONE_MINUTE = 60;
const MINUTE_AND_A_HALF = 90;
const TWO_MINUTES = 120;
const THREE_MINUTES = 180;

/** The rest timer lengths a user can choose, in seconds. */
export const REST_TIMER_SECONDS = [
	ONE_MINUTE,
	MINUTE_AND_A_HALF,
	TWO_MINUTES,
	THREE_MINUTES
] as const;

/** One of the {@link REST_TIMER_SECONDS}. */
export type RestTimerSeconds = (typeof REST_TIMER_SECONDS)[number];

/** How the app looks and its workout rest timer, as the user set it. */
export interface Preferences {
	readonly theme: Theme;
	readonly distanceUnit: DistanceUnit;
	/** How long the rest timer runs after a set. */
	readonly restSeconds: RestTimerSeconds;
}

/** What a new user starts with. */
export const DEFAULT_PREFERENCES: Preferences = {
	theme: Theme.dark,
	distanceUnit: DistanceUnit.mi,
	restSeconds: MINUTE_AND_A_HALF
};

/** Reads the stored preferences. */
export interface PreferencesReader {
	/** The preferences the user has set; the rest are missing. */
	read(): Promise<Partial<Preferences>>;
}

/** Stores preferences. */
export interface PreferencesWriter {
	/** Remembers the given preferences, leaving the others as they are. */
	write(changes: Partial<Preferences>): Promise<void>;
}
