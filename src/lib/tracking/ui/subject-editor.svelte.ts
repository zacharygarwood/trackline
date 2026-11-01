import { messages } from '../../i18n/messages.en.ts';
import { isId } from '../../shared/id.ts';
import type {
	AddSubject,
	ArchiveSubject,
	GetSubject,
	UpdateSubject
} from '../application/library.ts';
import type { GetTracker } from '../application/trackers.ts';
import { fieldKey, type Field, type FieldKey, type FieldValue } from '../domain/field.ts';
import { servingsFieldOf } from '../domain/portion.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { TrackerKind } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import { EntryForm } from './entry-form.svelte.ts';
import { EXERCISE_PRESET_FIELDS, ExercisePreset } from './exercise-presets.constants.ts';

/** The use cases that add, change, and delete things in a library. */
export interface SubjectEditorUseCases {
	readonly getTracker: GetTracker;
	readonly getSubject: GetSubject;
	readonly addSubject: AddSubject;
	readonly updateSubject: UpdateSubject;
	readonly archiveSubject: ArchiveSubject;
}

/** Which tracker's library, and which thing in it; none for a new thing. */
export interface SubjectTarget {
	readonly tracker: string | undefined;
	readonly subject?: string | undefined;
	/** A name typed before, such as a food searched for. */
	readonly name?: string | undefined;
}

const NO_DEFAULTS: ReadonlyMap<FieldKey, FieldValue> = new Map();

function presetKeys(preset: ExercisePreset): readonly FieldKey[] {
	return EXERCISE_PRESET_FIELDS[preset].map(fieldKey);
}

function presetOf(keys: readonly FieldKey[]): ExercisePreset {
	const matches = (preset: ExercisePreset) => {
		const wanted = presetKeys(preset);
		return wanted.length === keys.length && wanted.every((key) => keys.includes(key));
	};
	return Object.values(ExercisePreset).find(matches) ?? ExercisePreset.lift;
}

/**
 * State and actions of the page that adds or edits a thing in a library: its
 * name, what an exercise tracks, and a food's numbers per serving.
 */
export class SubjectEditor {
	tracker: Tracker | undefined = $state();
	subject: Subject | undefined = $state();
	name = $state('');
	preset: ExercisePreset = $state(ExercisePreset.lift);
	perServing: EntryForm | undefined = $state();
	problem: string | undefined = $state();

	constructor(
		private readonly useCases: SubjectEditorUseCases,
		private readonly units: DisplayUnits
	) {}

	/**
	 * Reads the tracker and the thing, if editing one.
	 *
	 * @param target - The tracker and thing, from page state.
	 * @returns Whether they exist.
	 */
	async load(target: SubjectTarget): Promise<boolean> {
		const tracker = await this.trackerOf(target.tracker);
		const subject = await this.subjectOf(target.subject);
		if (tracker === undefined || (target.subject !== undefined && subject === undefined))
			return false;
		this.start(tracker, subject, target.name);
		return true;
	}

	private start(tracker: Tracker, subject: Subject | undefined, name: string | undefined): void {
		this.tracker = tracker;
		this.subject = subject;
		this.name = subject?.name ?? name ?? '';
		this.preset = presetOf(subject?.fieldKeys ?? []);
		if (tracker.kind === TrackerKind.food)
			this.perServing = new EntryForm(
				this.perServingFields(tracker),
				this.units,
				subject?.defaults
			);
	}

	private async trackerOf(id: string | undefined): Promise<Tracker | undefined> {
		return id !== undefined && isId<'Tracker'>(id)
			? this.useCases.getTracker.execute({ id })
			: undefined;
	}

	private async subjectOf(id: string | undefined): Promise<Subject | undefined> {
		return id !== undefined && isId<'Subject'>(id)
			? this.useCases.getSubject.execute({ id })
			: undefined;
	}

	/** Whether the page asks what an exercise tracks. */
	get isExercise(): boolean {
		return this.tracker?.kind === TrackerKind.workout;
	}

	/** The presets that fit the tracker's fields. */
	get presets(): readonly ExercisePreset[] {
		const keys = this.tracker?.fields.map((field) => field.key) ?? [];
		return Object.values(ExercisePreset).filter((preset) =>
			presetKeys(preset).every((key) => keys.includes(key))
		);
	}

	private perServingFields(tracker: Tracker): readonly Field[] {
		const servings = servingsFieldOf(tracker.fields);
		return tracker.fields
			.filter((field) => field.key !== servings?.key)
			.map((field) => ({ ...field, required: false }));
	}

	private details() {
		const defaults = this.perServing?.values();
		return {
			name: this.name,
			fieldKeys: this.isExercise ? presetKeys(this.preset) : [],
			defaults: defaults?.ok === true ? defaults.value : NO_DEFAULTS
		};
	}

	/** Adds or saves the thing, or explains what to fix. */
	async save(): Promise<Subject | undefined> {
		const { tracker, subject } = this;
		if (tracker === undefined) return undefined;
		const details = this.details();
		const saved =
			subject === undefined
				? await this.useCases.addSubject.execute({ ...details, trackerId: tracker.id })
				: await this.useCases.updateSubject.execute({ ...details, id: subject.id });
		this.problem = saved.ok ? undefined : messages.tracking.page.fixProblem;
		return saved.ok ? saved.value : undefined;
	}

	/** Deletes the thing from the library; its entries stay. */
	async archive(): Promise<void> {
		if (this.subject !== undefined)
			await this.useCases.archiveSubject.execute({ id: this.subject.id });
	}
}
