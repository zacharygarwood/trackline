import { messages } from '../../i18n/messages.en.ts';
import { isId } from '../../shared/id.ts';
import type { Result } from '../../shared/result.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { ListEntries, LogEntry } from '../application/entries.ts';
import type { GetDatabaseFood, SaveDatabaseFood } from '../application/food-database.ts';
import type { GetSubject } from '../application/library.ts';
import type { GetTracker } from '../application/trackers.ts';
import type { Entry } from '../domain/entry.ts';
import { numberOf, type FieldKey, type FieldValue } from '../domain/field.ts';
import { servingValues, type DatabaseFood, type Portion } from '../domain/food-database.ts';
import { portionValues, servingsFieldOf } from '../domain/portion.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { shownText } from './entry-drafts.ts';
import type { LogTarget } from './log-screen.svelte.ts';

const HALF_SERVING = 0.5;
const LISTED_GRAMS = 100;

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
	readonly getDatabaseFood: GetDatabaseFood;
	readonly saveDatabaseFood: SaveDatabaseFood;
}

/** Which tracker, and the food to log: one of My foods, or one from the food database. */
export type PortionTarget = LogTarget & {
	/** The id of a food in the built-in food database. */
	readonly food?: string | undefined;
};

/**
 * State and actions of the page that logs a portion of a food, in servings:
 * one of My foods, or a food from the food database, whose serving is chosen
 * here and which joins My foods when logged.
 */
export class PortionScreen {
	tracker: Tracker | undefined = $state();
	food: Subject | undefined = $state();
	databaseFood: DatabaseFood | undefined = $state();
	serving: Portion = $state({ label: messages.tracking.food.hundredGrams, grams: LISTED_GRAMS });
	servings = $state('1');

	constructor(private readonly useCases: PortionUseCases) {}

	/**
	 * Reads the tracker and the food, starting from the servings eaten last time.
	 *
	 * @param target - The tracker and food, from page state.
	 * @returns Whether both exist.
	 */
	async load(target: PortionTarget): Promise<boolean> {
		const { tracker: trackerId = '', subject: foodId = '', food: databaseId } = target;
		if (!isId<'Tracker'>(trackerId)) return false;
		const tracker = await this.useCases.getTracker.execute({ id: trackerId });
		if (tracker === undefined) return false;
		this.tracker = tracker;
		if (databaseId !== undefined) return this.loadDatabaseFood(databaseId);
		if (!isId<'Subject'>(foodId)) return false;
		const [food, eaten] = await Promise.all([
			this.useCases.getSubject.execute({ id: foodId }),
			this.useCases.listEntries.execute({ trackerId, subjectId: foodId })
		]);
		this.food = food;
		this.servings = lastServings(tracker, eaten) ?? this.servings;
		return food !== undefined;
	}

	private async loadDatabaseFood(id: string): Promise<boolean> {
		this.databaseFood = await this.useCases.getDatabaseFood.execute({ id });
		return this.databaseFood !== undefined;
	}

	/** The food's name, for the page title. */
	get name(): string {
		return this.food?.name ?? this.databaseFood?.name ?? '';
	}

	/** The servings a database food can be logged in: 100 g, then its own portions, such as "1 cup". */
	get servingChoices(): readonly Portion[] {
		return [
			{ label: messages.tracking.food.hundredGrams, grams: LISTED_GRAMS },
			...(this.databaseFood?.portions ?? [])
		];
	}

	/**
	 * Chooses what one serving of a database food is.
	 *
	 * @param label - The serving's label, such as "1 cup".
	 */
	chooseServing(label: string): void {
		this.serving = this.servingChoices.find((choice) => choice.label === label) ?? this.serving;
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

	private perServing(tracker: Tracker): ReadonlyMap<FieldKey, FieldValue> | undefined {
		if (this.databaseFood === undefined) return this.food?.defaults;
		return servingValues(this.databaseFood, this.serving.grams, tracker.fields);
	}

	/** What the portion logs: the food's numbers per serving times the servings. */
	get values(): Result<ReadonlyMap<FieldKey, FieldValue>, undefined> {
		const { tracker } = this;
		const servings = parseDecimal(this.servings);
		const field = tracker === undefined ? undefined : servingsFieldOf(tracker.fields);
		const defaults = tracker === undefined ? undefined : this.perServing(tracker);
		if (defaults === undefined || field === undefined || servings === undefined || servings <= 0)
			return { ok: false, error: undefined };
		return { ok: true, value: portionValues({ defaults }, field.key, servings) };
	}

	private async savedFood(tracker: Tracker): Promise<Subject | undefined> {
		const { databaseFood, serving } = this;
		if (databaseFood === undefined) return this.food;
		const saved = await this.useCases.saveDatabaseFood.execute({
			trackerId: tracker.id,
			foodId: databaseFood.id,
			name: messages.tracking.food.savedName(databaseFood.name, serving.label),
			grams: serving.grams
		});
		return saved.ok ? saved.value : undefined;
	}

	/** Logs the portion today, first saving a database food to My foods. */
	async save(): Promise<boolean> {
		const { tracker, values } = this;
		const servings = parseDecimal(this.servings);
		if (tracker === undefined || !values.ok || servings === undefined) return false;
		const food = await this.savedFood(tracker);
		const field = servingsFieldOf(tracker.fields);
		if (food === undefined || field === undefined) return false;
		const logged = await this.useCases.logEntry.execute({
			trackerId: tracker.id,
			subjectId: food.id,
			values: portionValues(food, field.key, servings)
		});
		return logged.ok;
	}
}
