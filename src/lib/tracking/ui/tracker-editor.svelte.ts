import { messages } from '../../i18n/messages.en.ts';
import { isId } from '../../shared/id.ts';
import type { DeleteTracker, GetTracker, UpdateTracker } from '../application/trackers.ts';
import type { Tracker } from '../domain/tracker.ts';
import type { DisplayUnits } from './display-units.ts';
import { GoalEditor } from './goal-editor.svelte.ts';

/** The use cases the edit page calls. */
export interface TrackerEditorUseCases {
	readonly getTracker: GetTracker;
	readonly updateTracker: UpdateTracker;
	readonly deleteTracker: DeleteTracker;
}

/** State and actions of a tracker's edit page: its name, its goal, and deleting it. */
export class TrackerEditor {
	tracker: Tracker | undefined = $state();
	name = $state('');
	goal: GoalEditor | undefined = $state();
	problem: string | undefined = $state();

	constructor(
		private readonly useCases: TrackerEditorUseCases,
		private readonly units: DisplayUnits
	) {}

	/**
	 * Reads the tracker.
	 *
	 * @param id - The tracker's id, from page state.
	 * @returns Whether the tracker exists.
	 */
	async load(id: string | undefined): Promise<boolean> {
		if (id === undefined || !isId<'Tracker'>(id)) return false;
		const tracker = await this.useCases.getTracker.execute({ id });
		if (tracker === undefined) return false;
		this.tracker = tracker;
		this.name = tracker.name;
		this.goal = new GoalEditor(tracker, this.units);
		return true;
	}

	/** Saves the name and goal, or explains what to fix. */
	async save(): Promise<Tracker | undefined> {
		if (this.tracker === undefined || this.goal === undefined) return undefined;
		const goal = this.goal.goal();
		if (!goal.ok) {
			this.problem = goal.error.message;
			return undefined;
		}
		const saved = await this.useCases.updateTracker.execute({
			id: this.tracker.id,
			name: this.name,
			goal: goal.value
		});
		this.problem = saved.ok ? undefined : messages.tracking.page.fixProblem;
		return saved.ok ? saved.value : undefined;
	}

	/** Deletes the tracker and everything logged to it. */
	async delete(): Promise<void> {
		if (this.tracker !== undefined)
			await this.useCases.deleteTracker.execute({ id: this.tracker.id });
	}
}
