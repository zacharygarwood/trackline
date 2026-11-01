import { describe, expect, it } from 'vitest';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import { directionToward } from './weight-progress.ts';

describe('directionToward', () => {
	it('loses toward a lower target, gains toward a higher one, and maintains at the same weight', () => {
		expect(directionToward(85, 80)).toBe(GoalDirection.lose);
		expect(directionToward(60, 64)).toBe(GoalDirection.gain);
		expect(directionToward(70, 70)).toBe(GoalDirection.maintain);
	});

	it('assumes losing before the first weigh-in', () => {
		expect(directionToward(undefined, 80)).toBe(GoalDirection.lose);
	});
});
