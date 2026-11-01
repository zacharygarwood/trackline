import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import {
	aKey,
	anEntry,
	aTracker,
	aWorkoutTracker
} from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { templateOf, draftFromTemplate } from '../domain/from-template.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { createTracker } from '../domain/tracker.ts';
import { Direction, FieldType, GoalType, Measure, Period } from '../domain/tracking.constants.ts';
import { homeLine } from './home-line.ts';
import { templateText } from './template-text.ts';
import {
	entrySummary,
	formatDuration,
	goalDetail,
	goalText,
	progressText
} from './value-format.ts';

const km = { mass: MassUnit.kg, distance: DistanceUnit.km };
const lb = { mass: MassUnit.lb, distance: DistanceUnit.mi };

function fromTemplate(key: TemplateKey) {
	const template = templateOf(key);
	const placement = { id: anId<'Tracker'>(), position: 0 };
	return expectOk(createTracker(draftFromTemplate(template, placement, templateText(template))));
}

describe('formatDuration', () => {
	it.each([
		[45, '45 s'],
		[1500, '25 min'],
		[3600, '1 h'],
		[27_000, '7 h 30 min']
	])('shows %d seconds as %s', (seconds, text) => {
		expect(formatDuration(seconds)).toBe(text);
	});
});

describe('goalText', () => {
	it('reads each kind of goal', () => {
		expect(goalText(fromTemplate(TemplateKey.water), km)).toBe('8 glasses a day');
		expect(goalText(fromTemplate(TemplateKey.coffee), km)).toBe('3 cups max a day');
		expect(goalText(fromTemplate(TemplateKey.workouts), km)).toBe('3 workouts a week');
		expect(goalText(fromTemplate(TemplateKey.sleep), km)).toBe('8 h a day');
		expect(goalText(fromTemplate(TemplateKey.running), lb)).toBe('9.32 mi a week');
		expect(goalText(fromTemplate(TemplateKey.mood), km)).toBe('7 days a week');
	});

	it('shows a target goal in the user’s units, and a period goal as “out of”', () => {
		const weight = {
			...fromTemplate(TemplateKey.weight),
			goal: { type: GoalType.target, field: aKey('weight'), target: 75 }
		} as const;

		expect(goalDetail(weight, lb)).toBe('Goal 165.3 lb');
		expect(goalDetail(fromTemplate(TemplateKey.water), km)).toBe('/ 8 glasses a day');
	});

	it('counts days and entries', () => {
		const days = {
			...aTracker(),
			goal: {
				type: GoalType.period,
				measure: Measure.days,
				target: 5,
				direction: Direction.atLeast,
				period: Period.week
			}
		} as const;

		expect(progressText(days, 1, km)).toBe('1 day');
		expect(progressText({ ...days, goal: { ...days.goal, measure: Measure.entries } }, 2, km)).toBe(
			'2 times'
		);
	});
});

describe('entrySummary', () => {
	it('joins the values in field order and adds the pace of a run', () => {
		const run = fromTemplate(TemplateKey.running);
		const entry = anEntry({
			values: [
				[aKey('time'), { type: FieldType.duration, seconds: 1500 }],
				[aKey('distance'), { type: FieldType.number, amount: 5000 }]
			]
		});

		expect(entrySummary(run, entry.values, km)).toBe('5 km · 25 min · 5:00 /km');
	});

	it('shows a note only when nothing else is filled', () => {
		const mood = fromTemplate(TemplateKey.mood);
		const noted = anEntry({ values: [[aKey('note'), { type: FieldType.note, text: 'Calm' }]] });
		const rated = anEntry({
			values: [
				[aKey('mood'), { type: FieldType.rating, stars: 4 }],
				[aKey('note'), { type: FieldType.note, text: 'Calm' }]
			]
		});

		expect(entrySummary(mood, noted.values, km)).toBe('Calm');
		expect(entrySummary(mood, rated.values, km)).toBe('4/5');
	});

	it('shows a held exercise’s time in minutes', () => {
		const workouts = aWorkoutTracker();
		const values = new Map([[aKey('time'), { type: FieldType.duration, seconds: 60 } as const]]);

		expect(entrySummary(workouts, values, km)).toBe('1 min');
	});
});

describe('homeLine', () => {
	it('shows progress toward a goal', () => {
		const water = fromTemplate(TemplateKey.water);
		const line = homeLine(
			{
				tracker: water,
				progress: { value: 4, fill: 0.5, met: false },
				active: undefined
			},
			km
		);

		expect(line).toEqual({ value: '4 glasses', detail: '/ 8 glasses a day', fraction: 0.5 });
	});

	it('fills a bar for a tracker whose goal is days logged, like mood', () => {
		const mood = fromTemplate(TemplateKey.mood);
		const progress = { value: 2, fill: 2 / 7, met: false };

		expect(homeLine({ tracker: mood, progress, active: undefined }, km)).toEqual({
			value: '2 days',
			detail: '/ 7 days a week',
			fraction: 2 / 7
		});
	});
});
