import {
	DEFAULT_PREFERENCES,
	type Preferences,
	type PreferencesReader
} from '../domain/preferences.ts';

/** Reads how the app looks and what it tracks. */
export class GetPreferences {
	constructor(private readonly preferences: PreferencesReader) {}

	/** @returns The user's preferences, with defaults for any not set yet. */
	async execute(): Promise<Preferences> {
		return { ...DEFAULT_PREFERENCES, ...(await this.preferences.read()) };
	}
}
