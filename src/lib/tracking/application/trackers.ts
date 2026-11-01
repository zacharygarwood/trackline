import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { photosOf } from '../domain/entry.ts';
import { fieldKey, renameFields, type FieldRename } from '../domain/field.ts';
import { draftFromTemplate, type TemplateText } from '../domain/from-template.ts';
import type { Goal } from '../domain/goal.ts';
import type { TrackerId } from '../domain/ids.ts';
import { createSubject, type Subject } from '../domain/subject.ts';
import type { Template } from '../domain/template.ts';
import { createTracker, type InvalidTracker, type Tracker } from '../domain/tracker.ts';
import type {
	EntryReader,
	SubjectWriter,
	TrackerReader,
	TrackerWriter
} from '../domain/tracking-repositories.ts';
import type { PhotoStore } from './photo-ports.ts';
import { MoveDirection } from './move-direction.constants.ts';
import { TrackerNotFound } from './tracking-errors.ts';

/** One template the user picked, in their words, with the goal they chose. */
export interface TemplatePick {
	readonly template: Template;
	readonly text: TemplateText;
	readonly goal: Goal;
	/** The names of the template's starting library, in the template's order. */
	readonly starterNames: readonly string[];
	/** New labels and units the user gave its plain number fields, if any. */
	readonly renames?: readonly FieldRename[];
}

/** The templates to add as trackers, in order. */
export interface AddTrackersCommand {
	readonly picks: readonly TemplatePick[];
}

/** What adding trackers needs. */
export interface AddTrackersPorts {
	readonly trackers: TrackerReader & TrackerWriter;
	readonly subjects: SubjectWriter;
	readonly ids: IdGenerator;
}

/** Adds trackers from templates after the existing ones on Home, each with its starting library. */
export class AddTrackers {
	constructor(private readonly ports: AddTrackersPorts) {}

	/** @param command - The picked templates. */
	async execute(command: AddTrackersCommand): Promise<Result<readonly Tracker[], InvalidTracker>> {
		const { trackers, subjects, ids } = this.ports;
		const start = (await trackers.findAll()).length;
		const added: Tracker[] = [];
		for (const [offset, pick] of command.picks.entries()) {
			const placement = { id: ids.next<'Tracker'>(), position: start + offset };
			const draft = draftFromTemplate(pick.template, placement, pick.text);
			const fields = renameFields(draft.fields, pick.renames ?? []);
			const tracker = createTracker({ ...draft, fields, goal: pick.goal });
			if (!tracker.ok) return tracker;
			added.push(tracker.value);
		}
		await trackers.save(added);
		await subjects.save(
			added.flatMap((tracker, index) => this.starters(tracker, command.picks.at(index)))
		);
		return ok(added);
	}

	private starters(tracker: Tracker, pick: TemplatePick | undefined): Subject[] {
		return (pick?.template.starters ?? []).flatMap((starter, index) => {
			const subject = createSubject(tracker, {
				id: this.ports.ids.next<'Subject'>(),
				name: pick?.starterNames.at(index) ?? '',
				fieldKeys: starter.fields.map(fieldKey),
				defaults: new Map()
			});
			return subject.ok ? [subject.value] : [];
		});
	}
}

/** A tracker's new name and goal, and new labels and units for its plain number fields. */
export interface UpdateTrackerCommand {
	readonly id: TrackerId;
	readonly name: string;
	readonly goal: Goal;
	readonly renames?: readonly FieldRename[];
}

/** Renames a tracker, changes its goal, or renames its number fields and their units. */
export class UpdateTracker {
	constructor(private readonly trackers: TrackerReader & TrackerWriter) {}

	/** @param command - The tracker, its name, and its goal. */
	async execute(
		command: UpdateTrackerCommand
	): Promise<Result<Tracker, TrackerNotFound | InvalidTracker>> {
		const tracker = await this.trackers.findById(command.id);
		if (tracker === undefined) return err(new TrackerNotFound(command.id));
		const updated = createTracker({
			...tracker,
			name: command.name,
			goal: command.goal,
			fields: renameFields(tracker.fields, command.renames ?? [])
		});
		if (updated.ok) await this.trackers.save([updated.value]);
		return updated;
	}
}

/** Which tracker to move, and whether up or down on Home. */
export interface MoveTrackerCommand {
	readonly id: TrackerId;
	readonly direction: MoveDirection;
}

/** Moves a tracker one place up or down on Home. */
export class MoveTracker {
	constructor(private readonly trackers: TrackerReader & TrackerWriter) {}

	/** @param command - The tracker and the direction. */
	async execute(command: MoveTrackerCommand): Promise<readonly Tracker[]> {
		const ordered = [...(await this.trackers.findAll())];
		const from = ordered.findIndex((tracker) => tracker.id === command.id);
		const to = command.direction === MoveDirection.up ? from - 1 : from + 1;
		const moving = ordered.at(from);
		if (from < 0 || to < 0 || to >= ordered.length || moving === undefined) return ordered;
		ordered.splice(from, 1);
		ordered.splice(to, 0, moving);
		const placed = ordered.map((tracker, position) => ({ ...tracker, position }));
		await this.trackers.save(placed);
		return placed;
	}
}

/** Names one tracker. */
export interface TrackerCommand {
	readonly id: TrackerId;
}

/** What deleting a tracker needs. */
export interface DeleteTrackerPorts {
	readonly trackers: TrackerReader & TrackerWriter;
	readonly entries: EntryReader;
	readonly photos: PhotoStore;
}

/** Deletes a tracker with everything logged to it, its photos included. */
export class DeleteTracker {
	constructor(private readonly ports: DeleteTrackerPorts) {}

	/** @param command - The tracker. */
	async execute(command: TrackerCommand): Promise<void> {
		const { trackers, entries, photos } = this.ports;
		const photoIds = (await entries.findFor(command.id)).flatMap(photosOf);
		await trackers.delete(command.id);
		const placed = (await trackers.findAll()).map((tracker, position) => ({
			...tracker,
			position
		}));
		await trackers.save(placed);
		await Promise.all(photoIds.map((id) => photos.delete(id)));
	}
}

/** Lists every tracker in Home order, for Settings and Add tracker. */
export class ListTrackers {
	constructor(private readonly trackers: TrackerReader) {}

	/** Every tracker. */
	execute(): Promise<readonly Tracker[]> {
		return this.trackers.findAll();
	}
}

/** Reads one tracker, for its page. */
export class GetTracker {
	constructor(private readonly trackers: TrackerReader) {}

	/** @param command - The tracker. */
	execute(command: TrackerCommand): Promise<Tracker | undefined> {
		return this.trackers.findById(command.id);
	}
}
