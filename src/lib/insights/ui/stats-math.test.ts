import { describe, expect, it } from 'vitest';
import { anExerciseId } from '../../../../tests/builders/training.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import type { ExerciseDay } from '../application/insights-queries.ts';
import { exerciseCards } from './exercise-cards.ts';
import { carriedForward, toBars, sum, weekOf, weeklyCalories } from './stats-math.ts';
import { CardMeasure } from './stats.constants.ts';

const today = expectOk(LocalDate.parse('2026-10-29'));
const daysAgo = (days: number) => today.addDays(-days);
const empty = {
	heaviest: undefined,
	mostReps: undefined,
	hardestGrade: undefined,
	meters: 0,
	seconds: 0,
	count: 0
};

describe('weekly buckets', () => {
	it('puts days in weeks ending today', () => {
		expect([
			weekOf(today, today, 4),
			weekOf(daysAgo(7), today, 4),
			weekOf(daysAgo(28), today, 4)
		]).toEqual([3, 2, undefined]);
	});

	it('averages the logged days of each week', () => {
		const day = (ago: number, calories: number) => ({
			date: daysAgo(ago),
			calories,
			protein: 0,
			calorieGoal: undefined,
			proteinGoal: undefined
		});
		expect(weeklyCalories([day(8, 1800), day(1, 2000), day(0, 2400)], { today, weeks: 2 })).toEqual(
			[1800, 2200]
		);
	});

	it('draws one bar per four weeks beyond six months, and carries bests forward', () => {
		expect(
			toBars(
				Array.from({ length: 28 }, () => 1),
				sum
			)
		).toEqual([4, 4, 4, 4, 4, 4, 4]);
		expect(toBars([1, 2], sum)).toEqual([1, 2]);
		expect(carriedForward([0, 5, 0, 7, 0])).toEqual([5, 5, 7, 7]);
	});
});

describe('exerciseCards', () => {
	const bench = anExerciseId();
	const run = anExerciseId();
	const boulder = anExerciseId();
	const exercises = [
		{ id: bench, name: 'Bench press', measure: CardMeasure.weight, grades: [], countLabel: '' },
		{ id: run, name: 'Run', measure: CardMeasure.distance, grades: [], countLabel: '' },
		{
			id: boulder,
			name: 'Bouldering',
			measure: CardMeasure.grade,
			grades: ['VB', 'V0', 'V1', 'V2'],
			countLabel: ''
		}
	];
	const days: ExerciseDay[] = [
		{ ...empty, exerciseId: bench, date: daysAgo(14), heaviest: expectOk(Mass.fromLb(135)) },
		{ ...empty, exerciseId: boulder, date: daysAgo(10), hardestGrade: 1 },
		{ ...empty, exerciseId: run, date: daysAgo(3), meters: 5000 },
		{ ...empty, exerciseId: bench, date: daysAgo(2), heaviest: expectOk(Mass.fromLb(155)) },
		{ ...empty, exerciseId: boulder, date: daysAgo(1), hardestGrade: 3 }
	];

	const cards = exerciseCards({
		days,
		exercises,
		today,
		weeks: 4,
		units: { mass: MassUnit.lb, distance: DistanceUnit.km },
		rangeWords: 'the past month'
	});

	it('lists the most recently done first', () => {
		expect(cards.map((card) => card.name)).toEqual(['Bouldering', 'Bench press', 'Run']);
	});

	it('shows the best weight and grade with their change, and totals distance', () => {
		expect(cards.map((card) => [card.big, card.unit, card.delta])).toEqual([
			['V2', '', '+2 grades'],
			['155', 'lb', '+20'],
			['5.0', 'km', '']
		]);
		expect(cards.at(1)?.line).toEqual([135, 135, 155]);
		expect(cards.at(2)?.bars).toEqual([0, 0, 0, 5]);
		expect(cards.at(0)?.summary).toBe('Bouldering best grade over the past month, from V0 to V2');
	});
});
