import { describe, expect, it } from 'vitest';
import { aWeighIn } from '../../../../tests/builders/weigh-in.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import { Mass } from '../../shared/mass.ts';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import { weighInMapper } from './weigh-in.mapper.ts';
import { weightGoalMapper } from './weight-goal.mapper.ts';

describe('weighInMapper', () => {
	it('round-trips a weigh-in', () => {
		const weighIn = aWeighIn().on('2026-10-27').weighing(80.4).build();

		expect(expectOk(weighInMapper.toDomain(weighInMapper.toRow(weighIn)))).toEqual(weighIn);
	});

	it.each([
		{ id: 1, date: '2026-10-27', weight_kg: 80 },
		{ id: '0192f3a1-7c4e-7b2a-9d3f-1a2b3c4d5e6f', date: 'yesterday', weight_kg: 80 },
		{ id: '0192f3a1-7c4e-7b2a-9d3f-1a2b3c4d5e6f', date: '2026-10-27', weight_kg: 5 }
	])('rejects corrupt row %j', (row) => {
		expect(expectErr(weighInMapper.toDomain(row))).toBeInstanceOf(CorruptRow);
	});
});

describe('weightGoalMapper', () => {
	it('round-trips a goal', () => {
		const goal = { target: expectOk(Mass.fromKg(72.5)), direction: GoalDirection.lose };

		expect(expectOk(weightGoalMapper.toDomain(weightGoalMapper.toRow(goal)))).toEqual(goal);
	});

	it.each([
		{ target_kg: '72', direction: 'lose' },
		{ target_kg: 72, direction: 'sideways' },
		{ target_kg: 2, direction: 'lose' }
	])('rejects corrupt row %j', (row) => {
		expect(expectErr(weightGoalMapper.toDomain(row))).toBeInstanceOf(CorruptRow);
	});
});
