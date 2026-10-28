import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import type { NutritionDay } from '../application/insights-queries.ts';
import { Nutrient } from './nutrient.constants.ts';
import { exerciseChartData, nutritionChartData, weightChartData } from './stats-charts.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const kg = (value: number) => expectOk(Mass.fromKg(value));

const nutritionDay = (
	day: string,
	calories: number,
	protein: number,
	goals?: { readonly calories: number; readonly protein: number }
): NutritionDay => ({
	date: date(day),
	calories,
	protein,
	calorieGoal: goals?.calories,
	proteinGoal: goals?.protein
});

describe('weightChartData', () => {
	it('has nothing to draw without weigh-ins', () => {
		expect(weightChartData([], MassUnit.kg)).toBeUndefined();
	});

	it('plots weigh-ins as dots and the moving average as the line, in the chosen unit', () => {
		const data = weightChartData(
			[
				{ date: date('2026-10-01'), weight: kg(80), average: kg(80) },
				{ date: date('2026-10-02'), weight: kg(79), average: kg(79.5) }
			],
			MassUnit.kg
		);

		expect(data?.points.map((point) => point.y)).toEqual([80, 79]);
		expect(data?.trend.map((point) => point.y)).toEqual([80, 79.5]);
		expect(data?.points.map((point) => point.x)).toEqual([
			date('2026-10-01').toEpochDay(),
			date('2026-10-02').toEpochDay()
		]);
		expect(data?.summary).toBe(
			'Weight chart with 2 weigh-ins. Latest 79.0 kg, 7-day average 79.5 kg.'
		);
	});
});

describe('nutritionChartData', () => {
	it('has nothing to draw without logged days', () => {
		expect(nutritionChartData([], Nutrient.calories)).toBeUndefined();
	});

	it('draws daily calories with each goal version as a step', () => {
		const data = nutritionChartData(
			[
				nutritionDay('2026-10-01', 1800, 90),
				nutritionDay('2026-10-02', 2200, 110, { calories: 2000, protein: 100 }),
				nutritionDay('2026-10-03', 2000, 100, { calories: 2000, protein: 100 }),
				nutritionDay('2026-10-04', 2500, 150, { calories: 2400, protein: 150 })
			],
			Nutrient.calories
		);

		expect(data?.trend.map((point) => point.y)).toEqual([1800, 2200, 2000, 2500]);
		expect(data?.goal.map((point) => point.y)).toEqual([2000, 2400]);
		expect(data?.summary).toBe(
			'Calories on 4 logged days, averaging 2,125 kcal. Latest goal 2,400 kcal.'
		);
	});

	it('draws protein in grams and leaves out the goal before any was set', () => {
		const data = nutritionChartData([nutritionDay('2026-10-01', 1800, 92.4)], Nutrient.protein);

		expect(data?.trend.map((point) => point.y)).toEqual([92.4]);
		expect(data?.goal).toEqual([]);
		expect(data?.summary).toBe('Protein on 1 logged day, averaging 92 g.');
	});
});

describe('exerciseChartData', () => {
	it('has nothing to draw without sessions', () => {
		expect(exerciseChartData([], 'Bench press', MassUnit.kg)).toBeUndefined();
	});

	it('plots heaviest sets as dots and the estimated one-rep max as the line', () => {
		const data = exerciseChartData(
			[
				{ date: date('2026-10-01'), heaviest: kg(100), estimatedOneRepMax: kg(116.7) },
				{ date: date('2026-10-08'), heaviest: kg(105), estimatedOneRepMax: kg(115) }
			],
			'Bench press',
			MassUnit.kg
		);

		expect(data?.points.map((point) => point.y)).toEqual([100, 105]);
		expect(data?.trend.map((point) => point.y)).toEqual([116.7, 115]);
		expect(data?.summary).toBe(
			'Bench press: 2 sessions. Heaviest set 105.0 kg, best estimated one-rep max 116.7 kg.'
		);
	});
});
