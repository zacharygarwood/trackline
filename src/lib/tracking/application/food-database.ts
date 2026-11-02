import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { servingValues, type DatabaseFood, type FoodDatabase } from '../domain/food-database.ts';
import type { TrackerId } from '../domain/ids.ts';
import { createSubject, type InvalidSubject, type Subject } from '../domain/subject.ts';
import type {
	SubjectReader,
	SubjectWriter,
	TrackerReader
} from '../domain/tracking-repositories.ts';
import { DatabaseFoodNotFound, TrackerNotFound } from './tracking-errors.ts';

/** What was typed in food search. */
export interface SearchFoodsCommand {
	readonly text: string;
}

/** Finds foods in the built-in food database by the words typed. */
export class SearchFoods {
	constructor(private readonly foods: FoodDatabase) {}

	/** @param command - What was typed. */
	execute(command: SearchFoodsCommand): Promise<readonly DatabaseFood[]> {
		return this.foods.search(command.text);
	}
}

/** Names one food in the built-in food database. */
export interface DatabaseFoodCommand {
	readonly id: string;
}

/** Reads one food from the built-in food database, for its portion page. */
export class GetDatabaseFood {
	constructor(private readonly foods: FoodDatabase) {}

	/** @param command - The food. */
	execute(command: DatabaseFoodCommand): Promise<DatabaseFood | undefined> {
		return this.foods.findById(command.id);
	}
}

/** A database food to save to a food tracker's library, with a serving and the name to save it under. */
export interface SaveDatabaseFoodCommand {
	readonly trackerId: TrackerId;
	readonly foodId: string;
	/** Such as "Oats, dry, 1 cup". */
	readonly name: string;
	/** How much one serving weighs. */
	readonly grams: number;
}

/** What saving a database food needs. */
export interface SaveDatabaseFoodPorts {
	readonly trackers: TrackerReader;
	readonly subjects: SubjectReader & SubjectWriter;
	readonly foods: FoodDatabase;
	readonly ids: IdGenerator;
}

/**
 * Saves a food from the built-in database to My foods, with its numbers for
 * one serving, so it logs like any other food. A food already saved under
 * the same name is used instead of saving it twice.
 */
export class SaveDatabaseFood {
	constructor(private readonly ports: SaveDatabaseFoodPorts) {}

	/** @param command - The tracker, the food, its serving, and its name. */
	async execute(
		command: SaveDatabaseFoodCommand
	): Promise<Result<Subject, TrackerNotFound | DatabaseFoodNotFound | InvalidSubject>> {
		const { trackers, subjects, foods, ids } = this.ports;
		const tracker = await trackers.findById(command.trackerId);
		if (tracker === undefined) return err(new TrackerNotFound(command.trackerId));
		const food = await foods.findById(command.foodId);
		if (food === undefined) return err(new DatabaseFoodNotFound(command.foodId));
		const saved = (await subjects.findFor(tracker.id)).find(
			(subject) => !subject.archived && subject.name === command.name
		);
		if (saved !== undefined) return ok(saved);
		const subject = createSubject(tracker, {
			id: ids.next<'Subject'>(),
			name: command.name,
			fieldKeys: [],
			defaults: servingValues(food, command.grams, tracker.fields)
		});
		if (subject.ok) await subjects.save([subject.value]);
		return subject;
	}
}
