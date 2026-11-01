import { messages } from '../../i18n/messages.en.ts';
import { isId } from '../../shared/id.ts';
import type { ListEntries, LogEntry } from '../application/entries.ts';
import type { GetSubject } from '../application/library.ts';
import type { DiscardPhoto, SavePhoto } from '../application/photos.ts';
import type { GetTracker } from '../application/trackers.ts';
import type { Entry } from '../domain/entry.ts';
import type { Field, PhotoId } from '../domain/field.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { FieldType, TrackerKind } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import { EntryForm } from './entry-form.svelte.ts';

/** The use cases the log page calls. */
export interface LogScreenUseCases {
	readonly getTracker: GetTracker;
	readonly getSubject: GetSubject;
	readonly listEntries: ListEntries;
	readonly logEntry: LogEntry;
	readonly savePhoto: SavePhoto;
	readonly discardPhoto: DiscardPhoto;
}

/** Which tracker the page logs to, and the thing in its library the entry is about. */
export interface LogTarget {
	readonly tracker: string | undefined;
	readonly subject?: string | undefined;
}

function fieldsFor(tracker: Tracker, subject: Subject | undefined): readonly Field[] {
	if (subject === undefined || subject.fieldKeys.length === 0) return tracker.fields;
	return tracker.fields.filter((field) => subject.fieldKeys.includes(field.key));
}

/**
 * State and actions of the page that logs one entry: a form for the tracker's
 * fields, starting from the last entry, and the photos taken for it.
 */
export class LogScreen {
	tracker: Tracker | undefined = $state();
	subject: Subject | undefined = $state();
	form: EntryForm | undefined = $state();
	problem: string | undefined = $state();
	private unsaved: readonly PhotoId[] = [];

	constructor(
		private readonly useCases: LogScreenUseCases,
		private readonly units: DisplayUnits
	) {}

	/**
	 * Reads the tracker and its last entry.
	 *
	 * @param target - The tracker and thing, from page state.
	 * @returns Whether the tracker exists.
	 */
	async load(target: LogTarget): Promise<boolean> {
		const { tracker: trackerId, subject: subjectId } = target;
		if (trackerId === undefined || !isId<'Tracker'>(trackerId)) return false;
		const tracker = await this.useCases.getTracker.execute({ id: trackerId });
		if (tracker === undefined) return false;
		const subject = await this.subjectOf(subjectId);
		const entries = await this.useCases.listEntries.execute({ trackerId, subjectId: subject?.id });
		const quickFood = tracker.kind === TrackerKind.food && subject === undefined;
		const last = quickFood ? undefined : entries.at(0);
		this.tracker = tracker;
		this.subject = subject;
		this.form = new EntryForm(fieldsFor(tracker, subject), this.units, last?.values);
		return true;
	}

	private async subjectOf(id: string | undefined): Promise<Subject | undefined> {
		return id !== undefined && isId<'Subject'>(id)
			? this.useCases.getSubject.execute({ id })
			: undefined;
	}

	/**
	 * Stores a chosen photo for a photo field, replacing one chosen before.
	 *
	 * @param field - The photo field.
	 * @param image - The chosen file's bytes.
	 */
	async attach(field: Field, image: Uint8Array): Promise<void> {
		const draft = this.form?.drafts[field.key];
		if (draft === undefined || !('picked' in draft)) return;
		const saved = await this.useCases.savePhoto.execute({ image });
		if (!saved.ok) {
			this.problem = messages.tracking.inputs.unreadablePhoto;
			return;
		}
		if (draft.picked?.type === FieldType.photo) await this.discard(draft.picked.photoId);
		this.unsaved = [...this.unsaved, saved.value];
		draft.picked = { type: FieldType.photo, photoId: saved.value };
		this.problem = undefined;
	}

	private async discard(id: PhotoId): Promise<void> {
		this.unsaved = this.unsaved.filter((other) => other !== id);
		await this.useCases.discardPhoto.execute({ id });
	}

	/** Logs the entry, or explains what to fix. */
	async save(): Promise<Entry | undefined> {
		const { tracker, form } = this;
		if (tracker === undefined || form === undefined) return undefined;
		const values = form.values();
		if (!values.ok) {
			this.problem = values.error.message;
			return undefined;
		}
		const logged = await this.useCases.logEntry.execute({
			trackerId: tracker.id,
			subjectId: this.subject?.id,
			values: values.value
		});
		if (!logged.ok) {
			this.problem = messages.tracking.page.fixProblem;
			return undefined;
		}
		this.unsaved = [];
		return logged.value;
	}

	/** Removes photos chosen for an entry that was never logged. */
	async leave(): Promise<void> {
		await Promise.all([...this.unsaved].map((id) => this.discard(id)));
	}
}
