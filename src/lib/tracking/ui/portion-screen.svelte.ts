import { isId } from '../../shared/id.ts';
import type { Result } from '../../shared/result.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { ListEntries, LogEntry } from '../application/entries.ts';
import type { GetSubject } from '../application/library.ts';
import type { GetTracker } from '../application/trackers.ts';
import type { Entry } from '../domain/entry.ts';
import { numberOf, type FieldKey, type FieldValue } from '../domain/field.ts';
import { portionValues, servingsFieldOf } from '../domain/portion.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { shownText } from './entry-drafts.ts';
import type { LogTarget } from './log-screen.svelte.ts';

const HALF_SERVING = 0.5;

function lastServings(tracker: Tracker, eaten: readonly Entry[]): string | undefined {
	const key = servingsFieldOf(tracker.fields)?.key;
	const last = key === undefined ? undefined : numberOf(eaten.at(0)?.values.get(key));
	return last === undefined ? undefined : shownText(last);
}

/** The use cases the portion page calls. */
export interface PortionUseCases {
	readonly getTracker: GetTracker;
	readonly getSubject: GetSubject;
	readonly listEntries: ListEntries;
	readonly logEntry: LogEntry;
}

/** State and actions of the page that logs a portion of a food, in servings. */
export class PortionScreen {
	tracker: Tracker | undefined = $state();
	food: Subject | undefined = $state();
	servings = $state('1');

	constructor(private readonly useCases: PortionUseCases) {}

	/**
	 * Reads the tracker and the food, starting from the servings eaten last time.
	 *
	 * @param target - The tracker and food, from page state.
	 * @returns Whether both exist.
	 */
	async load(target: LogTarget): Promise<boolean> {
		const { tracker: trackerId = '', subject: foodId = '' } = target;
		if (!isId<'Tracker'>(trackerId) || !isId<'Subject'>(foodId)) return false;
		const [tracker, food, eaten] = await Promise.all([
			this.useCases.getTracker.execute({ id: trackerId }),
			this.useCases.getSubject.execute({ id: foodId }),
			this.useCases.listEntries.execute({ trackerId, subjectId: foodId })
		]);
		if (tracker === undefined || food === undefined) return false;
		this.tracker = tracker;
		this.food = food;
		this.servings = lastServings(tracker, eaten) ?? this.servings;
		return true;
	}

	/**
	 * Changes the servings by half a serving, never below half.
	 *
	 * @param direction - 1 for more, -1 for less.
	 */
	step(direction: number): void {
		const current = parseDecimal(this.servings) ?? 1;
		this.servings = shownText(Math.max(HALF_SERVING, current + direction * HALF_SERVING));
	}

	/** What the portion logs: the food's numbers times the servings. */
	get values(): Result<ReadonlyMap<FieldKey, FieldValue>, undefined> {
		const servings = parseDecimal(this.servings);
		const field = this.tracker === undefined ? undefined : servingsFieldOf(this.tracker.fields);
		if (this.food === undefined || field === undefined || servings === undefined || servings <= 0)
			return { ok: false, error: undefined };
		return { ok: true, value: portionValues(this.food, field.key, servings) };
	}

	/** Logs the portion today. */
	async save(): Promise<boolean> {
		const { tracker, food, values } = this;
		if (tracker === undefined || food === undefined || !values.ok) return false;
		const logged = await this.useCases.logEntry.execute({
			trackerId: tracker.id,
			subjectId: food.id,
			values: values.value
		});
		return logged.ok;
	}
}
