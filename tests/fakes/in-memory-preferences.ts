import type {
	Preferences,
	PreferencesReader,
	PreferencesWriter
} from '../../src/lib/settings/domain/preferences.ts';

/** Preferences kept in a field. */
export class InMemoryPreferences implements PreferencesReader, PreferencesWriter {
	private stored: Partial<Preferences> = {};

	read(): Promise<Partial<Preferences>> {
		return Promise.resolve(this.stored);
	}

	write(changes: Partial<Preferences>): Promise<void> {
		this.stored = { ...this.stored, ...changes };
		return Promise.resolve();
	}
}
