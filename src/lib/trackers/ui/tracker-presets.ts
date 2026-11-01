import { messages } from '../../i18n/messages.en.ts';
import { Combine, Direction, Measure, Period } from '../domain/tracker.constants.ts';
import type { Tracker } from '../domain/tracker.ts';

/** A ready-made tracker offered by Add tracker. Its goal is in the units the user reads. */
export type PresetFields = Pick<
	Tracker,
	'measure' | 'unit' | 'direction' | 'period' | 'combine'
> & {
	readonly goal: number;
};

const CALORIES_A_DAY = 2200;
const PROTEIN_GRAMS = 150;
const CARBS_GRAMS = 250;
const FAT_GRAMS = 70;
const WORKOUTS_A_WEEK = 4;
const RUN_A_WEEK = 15;
const CLIMBS_A_WEEK = 3;
const GLASSES_OF_WATER = 8;
const HOURS_OF_SLEEP = 8;
const STEPS_A_DAY = 8000;
const MINUTES_OF_MEDITATION = 10;
const GOOD_MOOD = 4;
const DAYS_A_WEEK = 7;
const CUPS_OF_COFFEE = 2;

const preset = (
	measure: Measure,
	goal: number,
	changes: Partial<PresetFields> = {}
): PresetFields => ({
	measure,
	goal,
	unit: messages.trackers.noUnit,
	direction: Direction.atLeast,
	period: Period.day,
	combine: Combine.total,
	...changes
});

/** Every preset, in the order Add tracker lists them. Weight's goal is chosen when it is added. */
export const PRESETS = {
	calories: preset(Measure.calories, CALORIES_A_DAY),
	protein: preset(Measure.protein, PROTEIN_GRAMS),
	carbs: preset(Measure.carbs, CARBS_GRAMS),
	fat: preset(Measure.fat, FAT_GRAMS),
	workouts: preset(Measure.workouts, WORKOUTS_A_WEEK, { period: Period.week }),
	weight: preset(Measure.weight, 0),
	run: preset(Measure.distance, RUN_A_WEEK, { period: Period.week }),
	climb: preset(Measure.sessions, CLIMBS_A_WEEK, { period: Period.week }),
	water: preset(Measure.number, GLASSES_OF_WATER, { unit: messages.trackers.presetUnits.water }),
	sleep: preset(Measure.number, HOURS_OF_SLEEP, {
		unit: messages.trackers.presetUnits.sleep,
		combine: Combine.average,
		period: Period.week
	}),
	steps: preset(Measure.number, STEPS_A_DAY, { unit: messages.trackers.presetUnits.steps }),
	meditate: preset(Measure.duration, MINUTES_OF_MEDITATION),
	mood: preset(Measure.rating, GOOD_MOOD, { period: Period.week }),
	vitamins: preset(Measure.done, DAYS_A_WEEK, { period: Period.week }),
	coffee: preset(Measure.number, CUPS_OF_COFFEE, {
		unit: messages.trackers.presetUnits.coffee,
		direction: Direction.atMost
	})
} as const satisfies Record<string, PresetFields>;

/** The name of a preset. */
export type PresetName = keyof typeof PRESETS;

/**
 * Whether text names a preset.
 *
 * @param name - Any text, such as page state.
 */
export function isPresetName(name: string | undefined): name is PresetName {
	return name !== undefined && Object.keys(PRESETS).includes(name);
}
