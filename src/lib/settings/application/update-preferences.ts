import type { Preferences, PreferencesWriter } from '../domain/preferences.ts';

/** Changes some preferences. */
export class UpdatePreferences {
	constructor(private readonly preferences: PreferencesWriter) {}

	/** @param changes - The preferences to change; the others stay as they are. */
	async execute(changes: Partial<Preferences>): Promise<void> {
		await this.preferences.write(changes);
	}
}
