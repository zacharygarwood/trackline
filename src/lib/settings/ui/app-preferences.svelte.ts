import { createContext } from 'svelte';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import type { GetMassUnit } from '../application/get-mass-unit.ts';
import type { GetPreferences } from '../application/get-preferences.ts';
import type { GetWeekStart } from '../application/get-week-start.ts';
import type { SetMassUnit } from '../application/set-mass-unit.ts';
import type { SetWeekStart } from '../application/set-week-start.ts';
import type { UpdatePreferences } from '../application/update-preferences.ts';
import { DEFAULT_PREFERENCES, type Preferences } from '../domain/preferences.ts';

/** The use cases behind the app-wide preferences. */
export interface AppPreferencesUseCases {
	readonly getPreferences: GetPreferences;
	readonly updatePreferences: UpdatePreferences;
	readonly getMassUnit: GetMassUnit;
	readonly setMassUnit: SetMassUnit;
	readonly getWeekStart: GetWeekStart;
	readonly setWeekStart: SetWeekStart;
}

/** How the app looks, what it tracks, and its units, shared by every screen and kept up to date. */
export class AppPreferences {
	current: Preferences = $state(DEFAULT_PREFERENCES);
	massUnit: MassUnit = $state(MassUnit.kg);
	weekStart: WeekStart = $state(WeekStart.monday);
	/** Whether the stored preferences have been read. */
	loaded = $state(false);
	private readonly startup = Promise.withResolvers<AppPreferencesUseCases>();

	/**
	 * Reads the stored preferences.
	 *
	 * @param useCases - The settings use cases, once the app has started.
	 */
	async load(useCases: AppPreferencesUseCases): Promise<void> {
		[this.current, this.massUnit, this.weekStart] = await Promise.all([
			useCases.getPreferences.execute(),
			useCases.getMassUnit.execute(),
			useCases.getWeekStart.execute()
		]);
		this.loaded = true;
		this.startup.resolve(useCases);
	}

	/**
	 * Changes some preferences and stores them, once the stored ones have been read.
	 *
	 * @param changes - The preferences to change.
	 * @returns Whether they were valid and saved.
	 */
	async change(changes: Partial<Preferences>): Promise<boolean> {
		const useCases = await this.startup.promise;
		const result = await useCases.updatePreferences.execute(changes);
		if (!result.ok) return false;
		this.current = { ...this.current, ...changes };
		return true;
	}

	/** Switches the weight unit. */
	async chooseMassUnit(unit: MassUnit): Promise<void> {
		const useCases = await this.startup.promise;
		this.massUnit = unit;
		await useCases.setMassUnit.execute({ unit });
	}

	/** Switches the first day of the week. */
	async chooseWeekStart(weekStart: WeekStart): Promise<void> {
		const useCases = await this.startup.promise;
		this.weekStart = weekStart;
		await useCases.setWeekStart.execute({ weekStart });
	}
}

/** Shares the app's preferences with every screen. */
export const [getPreferences, setPreferences] = createContext<AppPreferences>();
