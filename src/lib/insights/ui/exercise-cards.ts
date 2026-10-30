import { messages } from '../../i18n/messages.en.ts';
import type { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Distance } from '../../shared/distance.ts';
import { last } from '../../shared/collections.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import type { ExerciseDay, TrackedExerciseId } from '../application/insights-queries.ts';
import { carriedForward, isBestMeasure, sum, toBars, weeklyValues } from './stats-math.ts';
import { CardMeasure } from './stats.constants.ts';

/** What Stats needs to know about an exercise to chart it. */
export interface CardExercise {
	readonly id: TrackedExerciseId;
	readonly name: string;
	readonly measure: CardMeasure;
	/** The grade names, easiest first, for graded exercises. */
	readonly grades: readonly string[];
	/** What a count is of, lower case, such as "laps". */
	readonly countLabel: string;
}

/** One exercise's Stats card: a headline number and either a line or bars. */
export interface ExerciseCard {
	readonly id: TrackedExerciseId;
	readonly name: string;
	readonly big: string;
	readonly unit: string;
	/** The change over the range, such as "+20" or "+2 grades"; empty when none. */
	readonly delta: string;
	/** Weekly bests to draw as a line, or undefined for bars. */
	readonly line: readonly number[] | undefined;
	/** Extra range above and below the line, in its unit. */
	readonly padding: number;
	/** Weekly or four-weekly totals to draw as bars, or undefined for a line. */
	readonly bars: readonly number[] | undefined;
	readonly summary: string;
}

/** What the cards cover and how to show them. */
export interface CardContext {
	readonly days: readonly ExerciseDay[];
	readonly exercises: readonly CardExercise[];
	readonly today: ExerciseDay['date'];
	readonly weeks: number;
	readonly units: { readonly mass: MassUnit; readonly distance: DistanceUnit };
	/** The range in words, such as "the past 3 months". */
	readonly rangeWords: string;
}

const HALF_KILOGRAM_STEPS = 2;
const KG_PADDING = 2;
const LB_PADDING = 5;
const OTHER_PADDING = 0.5;
const MINUTES_PER_HOUR = 60;
const HOURS_FROM_MINUTES = 120;
const WHOLE_DISTANCE_FROM = 100;
const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

const signed = (change: number) => {
	if (change === 0) return '';
	const amount = whole.format(Math.abs(change));
	return change > 0 ? `+${amount}` : `−${amount}`;
};

function liftNumber(kilograms: number, unit: MassUnit): number {
	const mass = Mass.fromKg(kilograms);
	const amount = mass.ok ? mass.value.toUnit(unit) : 0;
	return unit === MassUnit.kg
		? Math.round(amount * HALF_KILOGRAM_STEPS) / HALF_KILOGRAM_STEPS
		: Math.round(amount);
}

function distanceIn(meters: number, unit: DistanceUnit): number {
	const distance = Distance.fromMeters(meters);
	return distance.ok ? distance.value.toUnit(unit) : 0;
}

type CardBody = Omit<ExerciseCard, 'id' | 'name'>;

const paddingFor = (measure: CardMeasure, unit: MassUnit) => {
	if (measure !== CardMeasure.weight) return OTHER_PADDING;
	return unit === MassUnit.kg ? KG_PADDING : LB_PADDING;
};

function gradeCard(
	exercise: CardExercise,
	weekly: readonly number[],
	context: CardContext
): CardBody | undefined {
	const points = carriedForward(weekly).map((value) => value - 1);
	const first = points.at(0);
	const latest = last(points);
	if (first === undefined || latest === undefined) return undefined;
	const label = (point: number) => exercise.grades.at(point) ?? '';
	const change = latest - first;
	return {
		big: label(latest),
		unit: '',
		delta: change === 0 ? '' : messages.trends.grades(signed(change), Math.abs(change)),
		line: points,
		padding: OTHER_PADDING,
		bars: undefined,
		summary: messages.trends.bestGradeOver({
			name: exercise.name,
			range: context.rangeWords,
			from: label(first),
			to: label(latest)
		})
	};
}

function bestCard(
	exercise: CardExercise,
	weekly: readonly number[],
	context: CardContext
): CardBody | undefined {
	const lifted = exercise.measure === CardMeasure.weight;
	const points = carriedForward(weekly).map((value) =>
		lifted ? liftNumber(value, context.units.mass) : value
	);
	const first = points.at(0);
	const latest = last(points);
	if (first === undefined || latest === undefined) return undefined;
	return {
		big: String(latest),
		unit: lifted ? context.units.mass : messages.trends.reps,
		delta: signed(latest - first),
		line: points,
		padding: paddingFor(exercise.measure, context.units.mass),
		bars: undefined,
		summary: messages.trends.bestOver({
			name: exercise.name,
			range: context.rangeWords,
			from: String(first),
			to: String(latest)
		})
	};
}

function totalText(measure: CardMeasure, total: number, context: CardContext) {
	if (measure === CardMeasure.time) {
		return total >= HOURS_FROM_MINUTES
			? { big: oneDecimal.format(total / MINUTES_PER_HOUR), unit: messages.trends.hours }
			: { big: whole.format(total), unit: messages.trends.minutes };
	}
	if (measure === CardMeasure.distance) {
		const format = total >= WHOLE_DISTANCE_FROM ? whole : oneDecimal;
		return { big: format.format(total), unit: context.units.distance };
	}
	return { big: whole.format(total), unit: '' };
}

function totalCard(
	exercise: CardExercise,
	weekly: readonly number[],
	context: CardContext
): CardBody | undefined {
	const shown = (value: number) =>
		exercise.measure === CardMeasure.distance ? distanceIn(value, context.units.distance) : value;
	const total = shown(sum(weekly));
	if (total <= 0) return undefined;
	const text = totalText(exercise.measure, total, context);
	const unit = exercise.measure === CardMeasure.count ? exercise.countLabel : text.unit;
	return {
		big: text.big,
		unit,
		delta: '',
		line: undefined,
		padding: 0,
		bars: toBars(weekly, sum).map(shown),
		summary: messages.trends.totalOver({
			name: exercise.name,
			total: text.big,
			unit,
			range: context.rangeWords
		})
	};
}

function cardFor(
	exercise: CardExercise,
	weekly: readonly number[],
	context: CardContext
): CardBody | undefined {
	if (exercise.measure === CardMeasure.grade) return gradeCard(exercise, weekly, context);
	return isBestMeasure(exercise.measure)
		? bestCard(exercise, weekly, context)
		: totalCard(exercise, weekly, context);
}

/**
 * The Stats cards of the exercises done in a range, most recently done first.
 *
 * @param context - The exercise days, the exercises, the range, and the units.
 */
export function exerciseCards(context: CardContext): readonly ExerciseCard[] {
	const latestFirst = [...new Set(context.days.toReversed().map((day) => day.exerciseId))];
	return latestFirst.flatMap((id) => {
		const exercise = context.exercises.find((known) => known.id === id);
		if (exercise === undefined) return [];
		const days = context.days.filter((day) => day.exerciseId === id);
		const weekly = weeklyValues(days, {
			measure: exercise.measure,
			today: context.today,
			weeks: context.weeks
		});
		const card = cardFor(exercise, weekly, context);
		return card === undefined ? [] : [{ id, name: exercise.name, ...card }];
	});
}
