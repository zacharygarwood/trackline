import { BASICS, ONCE_A_DAY, PHOTO_FIELDS, THING_FIELDS, timesAWeek } from './basics.ts';
import { fieldKey } from './field.ts';
import type { CountGoal, FieldGoal } from './goal.ts';
import {
	StarterExercise,
	TemplateField,
	TemplateGroup,
	TemplateKey,
	TemplateUnit
} from './template.constants.ts';
import {
	note,
	optional,
	plain,
	required,
	type Template,
	type TemplateFieldDefinition
} from './template.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period,
	TrackerIcon,
	TrackerKind
} from './tracking.constants.ts';

const WORKOUTS_A_WEEK = 3;
const RUN_METRES_A_WEEK = 15_000;
const STEPS_A_DAY = 8000;
const CALORIES_A_DAY = 2000;
const GLASSES_A_DAY = 8;
const CUPS_A_DAY = 3;
const SLEEP_SECONDS = 28_800;
const MEDITATION_SECONDS = 600;
const READING_SECONDS = 1200;
const JOURNAL_DAYS_A_WEEK = 5;
const WATERINGS_A_WEEK = 2;

interface GoalShape {
	readonly period?: Period;
	readonly direction?: Direction;
}

function total(field: TemplateField, target: number, shape: GoalShape = {}): FieldGoal {
	return {
		type: GoalType.period,
		measure: Measure.total,
		field: fieldKey(field),
		target,
		direction: shape.direction ?? Direction.atLeast,
		period: shape.period ?? Period.day
	};
}

function count(
	measure: typeof Measure.days | typeof Measure.sessions,
	target: number,
	period: Period = Period.week
): CountGoal {
	return { type: GoalType.period, measure, target, direction: Direction.atLeast, period };
}

const lift = [TemplateField.reps, TemplateField.weight];
const bodyweight = [TemplateField.reps];
const held = [TemplateField.time];

const workouts: Template = {
	key: TemplateKey.workouts,
	group: TemplateGroup.move,
	kind: TrackerKind.workout,
	icon: TrackerIcon.dumbbell,
	fields: [
		plain(TemplateField.reps, TemplateUnit.reps),
		{ key: TemplateField.weight, type: FieldType.number, dimension: Dimension.mass, ...optional },
		{ key: TemplateField.time, type: FieldType.duration, ...optional },
		{
			key: TemplateField.distance,
			type: FieldType.number,
			dimension: Dimension.distance,
			...optional
		}
	],
	goal: count(Measure.sessions, WORKOUTS_A_WEEK),
	starters: [
		{ key: StarterExercise.squat, fields: lift },
		{ key: StarterExercise.benchPress, fields: lift },
		{ key: StarterExercise.deadlift, fields: lift },
		{ key: StarterExercise.overheadPress, fields: lift },
		{ key: StarterExercise.row, fields: lift },
		{ key: StarterExercise.pullUp, fields: bodyweight },
		{ key: StarterExercise.pushUp, fields: bodyweight },
		{ key: StarterExercise.plank, fields: held }
	]
};

function log(
	key: TemplateKey,
	look: Pick<Template, 'group' | 'icon' | 'goal'>,
	fields: readonly TemplateFieldDefinition[]
): Template {
	return { key, kind: TrackerKind.log, ...look, fields, starters: [] };
}

const move = { group: TemplateGroup.move } as const;
const body = { group: TemplateGroup.body } as const;
const eat = { group: TemplateGroup.eat } as const;
const mind = { group: TemplateGroup.mind } as const;
const life = { group: TemplateGroup.life } as const;

/** Every template, basics first, in the order onboarding and Add tracker offer them. */
export const TEMPLATES: readonly Template[] = [
	...BASICS,
	workouts,
	log(
		TemplateKey.running,
		{
			...move,
			icon: TrackerIcon.run,
			goal: total(TemplateField.distance, RUN_METRES_A_WEEK, { period: Period.week })
		},
		[
			{
				key: TemplateField.distance,
				type: FieldType.number,
				dimension: Dimension.distance,
				...required
			},
			{ key: TemplateField.time, type: FieldType.duration, ...optional },
			note
		]
	),
	log(
		TemplateKey.steps,
		{ ...move, icon: TrackerIcon.steps, goal: total(TemplateField.steps, STEPS_A_DAY) },
		[plain(TemplateField.steps, TemplateUnit.steps, true)]
	),
	log(TemplateKey.weight, { ...body, icon: TrackerIcon.scale, goal: ONCE_A_DAY }, [
		{ key: TemplateField.weight, type: FieldType.number, dimension: Dimension.mass, ...required }
	]),
	{
		key: TemplateKey.bodyPhotos,
		...body,
		kind: TrackerKind.photos,
		icon: TrackerIcon.camera,
		fields: PHOTO_FIELDS,
		goal: timesAWeek(1),
		starters: []
	},
	{
		key: TemplateKey.food,
		...eat,
		kind: TrackerKind.food,
		icon: TrackerIcon.food,
		fields: [
			plain(TemplateField.servings, TemplateUnit.servings),
			plain(TemplateField.calories, TemplateUnit.kcal, true),
			plain(TemplateField.protein, TemplateUnit.grams),
			plain(TemplateField.carbs, TemplateUnit.grams),
			plain(TemplateField.fat, TemplateUnit.grams),
			plain(TemplateField.fiber, TemplateUnit.grams),
			plain(TemplateField.sugar, TemplateUnit.grams),
			plain(TemplateField.sodium, TemplateUnit.milligrams)
		],
		goal: total(TemplateField.calories, CALORIES_A_DAY, { direction: Direction.atMost }),
		starters: []
	},
	log(
		TemplateKey.water,
		{ ...eat, icon: TrackerIcon.water, goal: total(TemplateField.glasses, GLASSES_A_DAY) },
		[plain(TemplateField.glasses, TemplateUnit.glasses, true)]
	),
	log(
		TemplateKey.coffee,
		{
			...eat,
			icon: TrackerIcon.coffee,
			goal: total(TemplateField.cups, CUPS_A_DAY, { direction: Direction.atMost })
		},
		[plain(TemplateField.cups, TemplateUnit.cups, true)]
	),
	log(
		TemplateKey.sleep,
		{ ...mind, icon: TrackerIcon.moon, goal: total(TemplateField.time, SLEEP_SECONDS) },
		[
			{ key: TemplateField.time, type: FieldType.duration, ...required },
			{ key: TemplateField.quality, type: FieldType.rating, ...optional }
		]
	),
	log(TemplateKey.mood, { ...mind, icon: TrackerIcon.smile, goal: ONCE_A_DAY }, [
		{ key: TemplateField.mood, type: FieldType.rating, ...required },
		note
	]),
	log(
		TemplateKey.meditation,
		{ ...mind, icon: TrackerIcon.mind, goal: total(TemplateField.time, MEDITATION_SECONDS) },
		[{ key: TemplateField.time, type: FieldType.duration, ...required }]
	),
	log(
		TemplateKey.journal,
		{ ...mind, icon: TrackerIcon.pen, goal: count(Measure.days, JOURNAL_DAYS_A_WEEK) },
		[{ ...note, ...required }]
	),
	log(
		TemplateKey.reading,
		{ ...life, icon: TrackerIcon.book, goal: total(TemplateField.time, READING_SECONDS) },
		[{ key: TemplateField.time, type: FieldType.duration, ...required }]
	),
	{
		key: TemplateKey.plants,
		...life,
		kind: TrackerKind.collection,
		icon: TrackerIcon.leaf,
		fields: [{ key: TemplateField.watered, type: FieldType.check, ...optional }, ...THING_FIELDS],
		goal: count(Measure.days, WATERINGS_A_WEEK),
		starters: []
	},
	log(TemplateKey.vitamins, { ...life, icon: TrackerIcon.pill, goal: ONCE_A_DAY }, [
		{ key: TemplateField.taken, type: FieldType.check, ...required }
	])
];
