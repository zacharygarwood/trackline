import { isId } from '../../shared/id.ts';
import type { DeleteEntry, ListEntries, RestoreEntry } from '../application/entries.ts';
import type { GetSubject } from '../application/library.ts';
import type { GetTracker } from '../application/trackers.ts';
import type { Entry } from '../domain/entry.ts';
import { photosOf } from '../domain/entry.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';

/** The use cases an entry's page calls. */
export interface EntryScreenUseCases {
	readonly getTracker: GetTracker;
	readonly getSubject: GetSubject;
	readonly listEntries: ListEntries;
	readonly deleteEntry: DeleteEntry;
	readonly restoreEntry: RestoreEntry;
}

/** Which tracker and entry the page shows. */
export interface EntryTarget {
	readonly tracker: string | undefined;
	readonly entry: string | undefined;
}

/** State and actions of one entry's page: its values, and deleting it. */
export class EntryScreen {
	tracker: Tracker | undefined = $state();
	entry: Entry | undefined = $state();
	subject: Subject | undefined = $state();

	constructor(private readonly useCases: EntryScreenUseCases) {}

	/**
	 * Reads the entry and what it is about.
	 *
	 * @param target - The tracker and entry, from page state.
	 * @returns Whether the entry exists.
	 */
	async load(target: EntryTarget): Promise<boolean> {
		const { tracker: trackerId = '', entry: entryId } = target;
		if (!isId<'Tracker'>(trackerId)) return false;
		const [tracker, entries] = await Promise.all([
			this.useCases.getTracker.execute({ id: trackerId }),
			this.useCases.listEntries.execute({ trackerId })
		]);
		const entry = entries.find((candidate) => candidate.id === entryId);
		if (tracker === undefined || entry === undefined) return false;
		this.tracker = tracker;
		this.entry = entry;
		this.subject =
			entry.subjectId === undefined
				? undefined
				: await this.useCases.getSubject.execute({ id: entry.subjectId });
		return true;
	}

	/** Deletes the entry, returning how to undo it unless it held photos. */
	async delete(): Promise<(() => Promise<void>) | undefined> {
		const entry = this.entry;
		if (entry === undefined) return undefined;
		await this.useCases.deleteEntry.execute({ id: entry.id });
		if (photosOf(entry).length > 0) return undefined;
		return () => this.useCases.restoreEntry.execute({ entry });
	}
}
