import { messages } from '../../i18n/messages.en.ts';
import { err, type Result } from '../../shared/result.ts';
import type { Field, FieldKey } from '../domain/field.ts';
import type { Goal } from '../domain/goal.ts';
import {
	fieldsFor,
	goalFrom,
	measuresFor,
	partsOf,
	type GoalMeasure,
	type GoalParts
} from '../domain/goal-parts.ts';
import { Direction, Measure, Period, type TrackerKind } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import { draftOf, FormProblem, type FieldDraft } from './entry-drafts.ts';
import { startingTarget, targetField, targetValue, typedTarget } from './goal-entry.ts';

/** What a tracker's goal is set against: its fields, kind, and current goal. */
export interface GoalTracker {
	readonly fields: readonly Field[];
	readonly kind: TrackerKind;
	readonly goal: Goal;
}

/**
 * The state of a goal as the user builds it from simple choices: what counts
 * (days, times, a total, an average, or a target), of which field, every
 * day, week, or month, at least or at most, and the target. Changing what
 * counts starts the amount afresh, at a sensible starting amount, since its
 * numbers mean something else.
 */
export class GoalEditor {
	/** What this tracker's goal can count, in the order to offer them. */
	readonly measures: readonly GoalMeasure[];
	measure: GoalMeasure = $state(Measure.days);
	field: FieldKey | undefined = $state();
	period: Period = $state(Period.week);
	direction: Direction = $state(Direction.atLeast);
	draft: FieldDraft = $state({ type: 'note', text: '' });
	private readonly own: GoalParts;

	/**
	 * @param tracker - The tracker's fields, kind, and current goal.
	 * @param units - The user's units.
	 */
	constructor(
		readonly tracker: GoalTracker,
		private readonly units: DisplayUnits
	) {
		this.measures = measuresFor(tracker.fields, tracker.kind);
		this.own = partsOf(tracker.goal);
		this.measure = this.own.measure;
		this.field = this.own.field;
		this.period = this.own.period;
		this.direction = this.own.direction;
		this.resetTarget();
	}

	/** The input the target is typed into: the measured field, or a count. */
	get input(): Field {
		return targetField(this.tracker.fields, this);
	}

	/** The fields the chosen measure can be of; a choice shows when there is more than one. */
	get fields(): readonly Field[] {
		return fieldsFor(this.measure, this.tracker.fields);
	}

	/**
	 * Chooses what the goal counts, keeping the field when it still fits.
	 *
	 * @param measure - Days, times, workouts, a total, an average, or a target.
	 */
	chooseMeasure(measure: GoalMeasure): void {
		if (!this.measures.includes(measure) || measure === this.measure) return;
		this.measure = measure;
		const fields = this.fields;
		if (!fields.some((field) => field.key === this.field)) this.field = fields.at(0)?.key;
		this.resetTarget();
	}

	/**
	 * Chooses which field a total, average, or target is of.
	 *
	 * @param key - The field.
	 */
	chooseField(key: FieldKey): void {
		if (!this.fields.some((field) => field.key === key) || key === this.field) return;
		this.field = key;
		this.resetTarget();
	}

	/** The goal as built, or what to fix. */
	goal(): Result<Goal, FormProblem> {
		const target = typedTarget(this.input, this.draft, this.units);
		if (!target.ok) return target;
		const { measure, field, period, direction } = this;
		const parts = { measure, field, period, direction, target: target.value };
		const goal = goalFrom(parts, this.tracker.fields, this.tracker.kind);
		return goal.ok ? goal : err(new FormProblem(messages.tracking.page.fixProblem));
	}

	private resetTarget(): void {
		const own = this.measure === this.own.measure && this.field === this.own.field;
		const input = this.input;
		const target = own ? this.own.target : startingTarget(this, input);
		this.draft = draftOf(input, targetValue(target, input), this.units);
	}
}
