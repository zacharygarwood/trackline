import { describe, expect, it } from 'vitest';
import { aWeighIn } from '../../../../tests/builders/weigh-in.builder.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { recentWeights } from './weight-chart.ts';

const weighIns = [
	aWeighIn().on('2026-10-03').weighing(79).build(),
	aWeighIn().on('2026-10-01').weighing(81).build(),
	aWeighIn().on('2026-10-02').weighing(80).build()
];

describe('recentWeights', () => {
	it('keeps the latest weigh-ins, oldest first, in the chosen unit', () => {
		expect(recentWeights(weighIns, MassUnit.kg, 2)).toEqual([80, 79]);
	});
});
