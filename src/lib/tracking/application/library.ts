import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, type Result } from '../../shared/result.ts';
import type { FieldKey, FieldValue } from '../domain/field.ts';
import type { SubjectId, TrackerId } from '../domain/ids.ts';
import { createSubject, type InvalidSubject, type Subject } from '../domain/subject.ts';
import type {
	SubjectReader,
	SubjectWriter,
	TrackerReader
} from '../domain/tracking-repositories.ts';
import { SubjectNotFound, TrackerNotFound } from './tracking-errors.ts';

/** A thing's name, the fields its entries fill, and the values they start from. */
export interface SubjectDetails {
	readonly name: string;
	/** Empty for all of the tracker's fields. */
	readonly fieldKeys: readonly FieldKey[];
	readonly defaults: ReadonlyMap<FieldKey, FieldValue>;
}

/** What changing a library needs. */
export interface LibraryPorts {
	readonly trackers: TrackerReader;
	readonly subjects: SubjectReader & SubjectWriter;
	readonly ids: IdGenerator;
}

/** Adds a thing, such as an exercise, a food, or a plant, to a tracker's library. */
export class AddSubject {
	constructor(private readonly ports: LibraryPorts) {}

	/** @param command - The tracker and the thing. */
	async execute(
		command: SubjectDetails & { readonly trackerId: TrackerId }
	): Promise<Result<Subject, TrackerNotFound | InvalidSubject>> {
		const tracker = await this.ports.trackers.findById(command.trackerId);
		if (tracker === undefined) return err(new TrackerNotFound(command.trackerId));
		const subject = createSubject(tracker, { ...command, id: this.ports.ids.next<'Subject'>() });
		if (subject.ok) await this.ports.subjects.save([subject.value]);
		return subject;
	}
}

/** Renames a thing in a library or changes its fields and starting values. */
export class UpdateSubject {
	constructor(private readonly ports: Omit<LibraryPorts, 'ids'>) {}

	/** @param command - The thing and its new details. */
	async execute(
		command: SubjectDetails & { readonly id: SubjectId }
	): Promise<Result<Subject, SubjectNotFound | InvalidSubject>> {
		const { trackers, subjects } = this.ports;
		const current = await subjects.findById(command.id);
		const tracker = current === undefined ? undefined : await trackers.findById(current.trackerId);
		if (current === undefined || tracker === undefined) return err(new SubjectNotFound(command.id));
		const subject = createSubject(tracker, command);
		if (!subject.ok) return subject;
		const updated = { ...subject.value, archived: current.archived };
		await subjects.save([updated]);
		return { ok: true, value: updated };
	}
}

/** Names one thing in a library. */
export interface SubjectCommand {
	readonly id: SubjectId;
}

/** Deletes a thing from its library. It stays stored, so the entries about it keep working. */
export class ArchiveSubject {
	constructor(private readonly subjects: SubjectReader & SubjectWriter) {}

	/** @param command - The thing. */
	async execute(command: SubjectCommand): Promise<void> {
		const subject = await this.subjects.findById(command.id);
		if (subject !== undefined) await this.subjects.save([{ ...subject, archived: true }]);
	}
}

/** Reads one thing from a library, deleted or not, for its page or an entry about it. */
export class GetSubject {
	constructor(private readonly subjects: SubjectReader) {}

	/** @param command - The thing. */
	execute(command: SubjectCommand): Promise<Subject | undefined> {
		return this.subjects.findById(command.id);
	}
}

/** Which tracker's library to list, and whether to include deleted things. */
export interface ListSubjectsCommand {
	readonly trackerId: TrackerId;
	readonly archived?: boolean;
}

/** Lists a tracker's library by name, without deleted things unless asked. */
export class ListSubjects {
	constructor(private readonly subjects: SubjectReader) {}

	/** @param command - The tracker, and whether to include deleted things. */
	async execute(command: ListSubjectsCommand): Promise<readonly Subject[]> {
		const all = await this.subjects.findFor(command.trackerId);
		return command.archived === true ? all : all.filter((subject) => !subject.archived);
	}
}
