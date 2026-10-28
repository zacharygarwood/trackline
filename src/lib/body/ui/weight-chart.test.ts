import { describe, expect, it } from 'vitest';
import { aWeighIn } from '../../../../tests/builders/weigh-in.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import { weightChartData } from './weight-chart.ts';

const weighIns = [
	aWeighIn().on('2026-10-03').weighing(79).build(),
	aWeighIn().on('2026-10-01').weighing(81).build(),
	aWeighIn().on('2026-10-02').weighing(80).build()
];

describe('weightChartData', () => {
	it('plots one dot per weigh-in and the moving average', () => {
		const data = weightChartData(weighIns, undefined, MassUnit.kg);

		expect(data.points).toHaveLength(3);
		expect(data.trend.map((point) => point.y)).toEqual([81, 80.5, 80]);
	});

	it('describes the chart in words', () => {
		const data = weightChartData(weighIns, undefined, MassUnit.kg);

		expect(data.summary).toBe(
			'Weight chart with 3 weigh-ins. Latest 79.0 kg, 7-day average 80.0 kg.'
		);
	});

	it('plots and mentions the goal in the chosen unit', () => {
		const goal = { target: expectOk(Mass.fromLb(160)), direction: GoalDirection.lose };

		const data = weightChartData(weighIns, goal, MassUnit.lb);

		expect(data.goal.map((point) => point.y)).toEqual([expect.closeTo(160)]);
		expect(data.summary).toContain('Goal 160.0 lb.');
	});
});
