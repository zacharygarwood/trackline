import { messages } from '../../i18n/messages.en.ts';
import { isId } from '../../shared/id.ts';
import { parseDecimal } from '../../ui/format.ts';
import type {
	AddSubject,
	ArchiveSubject,
	GetSubject,
	ListSubjects,
	UpdateSubject
} from '../application/library.ts';
import type { GetTracker } from '../application/trackers.ts';
import { numberOf, type FieldKey, type NumberField } from '../domain/field.ts';
import type { SubjectId } from '../domain/ids.ts';
import { servingsFieldOf } from '../domain/portion.ts';
import { perServingOf, type Recipe } from '../domain/recipe.ts';
import type { Subject } from '../domain/subject.ts';
import type { Tracker } from '../domain/tracker.ts';
import { FieldType } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import type { SubjectTarget } from './subject-editor.svelte.ts';
import { shownText } from './entry-drafts.ts';
import { formatAmount } from './value-format.ts';

const STEP_SERVINGS = 0.5;

/** The use cases the recipe page calls. */
export interface RecipeEditorUseCases {
	readonly getTracker: GetTracker;
	readonly getSubject: GetSubject;
	readonly listSubjects: ListSubjects;
	readonly addSubject: AddSubject;
	readonly updateSubject: UpdateSubject;
	readonly archiveSubject: ArchiveSubject;
}

/** One food in the recipe and the servings of it that go in. */
export interface RecipeLine {
	readonly food: Subject;
	readonly servings: number;
}

/** One of the recipe's numbers per serving, such as "Calories 162.5 kcal". */
export interface PerServingLine {
	readonly key: FieldKey;
	readonly label: string;
	readonly value: string;
}

/**
 * State and actions of the page that makes or edits a recipe: its name, the
 * servings it makes, foods from the library with their servings, and its
 * numbers per serving as they change.
 */
export class RecipeEditor {
	tracker: Tracker | undefined = $state();
	recipe: Subject | undefined = $state();
	foods: readonly Subject[] = $state([]);
	name = $state('');
	makes = $state('1');
	lines: readonly RecipeLine[] = $state([]);
	search = $state('');
	problem: string | undefined = $state();

	constructor(
		private readonly useCases: RecipeEditorUseCases,
		private readonly units: DisplayUnits
	) {}

	/**
	 * Reads the tracker, its foods, and the recipe, if editing one.
	 *
	 * @param target - The tracker and recipe, from page state.
	 * @returns Whether they exist.
	 */
	async load(target: SubjectTarget): Promise<boolean> {
		const { tracker: trackerId = '', subject: recipeId } = target;
		if (!isId<'Tracker'>(trackerId)) return false;
		const tracker = await this.useCases.getTracker.execute({ id: trackerId });
		const recipe =
			recipeId !== undefined && isId<'Subject'>(recipeId)
				? await this.useCases.getSubject.execute({ id: recipeId })
				: undefined;
		if (tracker === undefined || (recipeId !== undefined && recipe === undefined)) return false;
		const library = await this.useCases.listSubjects.execute({ trackerId, archived: true });
		this.start(tracker, library, recipe);
		return true;
	}

	private start(tracker: Tracker, library: readonly Subject[], recipe: Subject | undefined): void {
		this.tracker = tracker;
		this.recipe = recipe;
		this.foods = library.filter((food) => food.id !== recipe?.id);
		this.name = recipe?.name ?? '';
		this.makes = shownText(recipe?.recipe?.servings ?? 1);
		this.lines = this.linesOf(recipe?.recipe);
	}

	private linesOf(recipe: Recipe | undefined): readonly RecipeLine[] {
		return (recipe?.ingredients ?? []).flatMap(({ foodId, servings }) => {
			const food = this.foods.find((candidate) => candidate.id === foodId);
			return food === undefined ? [] : [{ food, servings }];
		});
	}

	/** Foods in the library whose name has the typed text, not deleted and not in the recipe yet. */
	get matches(): readonly Subject[] {
		const typed = this.search.trim().toLowerCase();
		if (typed === '') return [];
		return this.foods.filter(
			(food) =>
				!food.archived &&
				food.name.toLowerCase().includes(typed) &&
				!this.lines.some((line) => line.food.id === food.id)
		);
	}

	/**
	 * Puts one serving of a food in the recipe and clears the search.
	 *
	 * @param food - The food.
	 */
	add(food: Subject): void {
		this.lines = [...this.lines, { food, servings: 1 }];
		this.search = '';
	}

	/**
	 * Adds or takes away half a serving of an ingredient, taking it out at none.
	 *
	 * @param foodId - The ingredient's food.
	 * @param direction - 1 for more, -1 for less.
	 */
	step(foodId: SubjectId, direction: number): void {
		this.lines = this.lines.flatMap((line) => {
			if (line.food.id !== foodId) return [line];
			const servings = line.servings + direction * STEP_SERVINGS;
			return servings > 0 ? [{ ...line, servings }] : [];
		});
	}

	private draft(): Recipe {
		return {
			ingredients: this.lines.map(({ food, servings }) => ({ foodId: food.id, servings })),
			servings: parseDecimal(this.makes) ?? 0
		};
	}

	/** The recipe's numbers per serving, in the tracker's field order; none until it can be worked out. */
	get perServing(): readonly PerServingLine[] {
		const { tracker } = this;
		const worked = perServingOf(this.draft(), this.foods);
		if (tracker === undefined || !worked.ok) return [];
		const servings = servingsFieldOf(tracker.fields);
		return tracker.fields
			.filter(
				(field): field is NumberField =>
					field.type === FieldType.number && field.key !== servings?.key
			)
			.map((field) => ({
				key: field.key,
				label: field.label,
				value: formatAmount(field, numberOf(worked.value.get(field.key)) ?? 0, this.units)
			}));
	}

	/** Adds or saves the recipe, or explains what to fix. */
	async save(): Promise<Subject | undefined> {
		const { tracker, recipe } = this;
		if (tracker === undefined) return undefined;
		const details = { name: this.name, fieldKeys: [], recipe: this.draft() };
		const saved =
			recipe === undefined
				? await this.useCases.addSubject.execute({ ...details, trackerId: tracker.id })
				: await this.useCases.updateSubject.execute({ ...details, id: recipe.id });
		this.problem = saved.ok ? undefined : messages.tracking.page.fixProblem;
		return saved.ok ? saved.value : undefined;
	}

	/** Deletes the recipe from the library; its entries stay. */
	async archive(): Promise<void> {
		if (this.recipe !== undefined)
			await this.useCases.archiveSubject.execute({ id: this.recipe.id });
	}
}
