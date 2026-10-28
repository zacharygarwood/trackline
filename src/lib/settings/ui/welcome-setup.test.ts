import { describe, expect, it } from 'vitest';
import { InMemoryAppState } from '../../../../tests/fakes/in-memory-app-state.ts';
import { CompleteSetup } from '../application/complete-setup.ts';
import { WelcomeSetup } from './welcome-setup.svelte.ts';

describe('WelcomeSetup', () => {
	it('saves every step, then finishes setup', async () => {
		const state = new InMemoryAppState();
		const saved: string[] = [];
		const setup = new WelcomeSetup(new CompleteSetup(state));

		const finished = await setup.finish([
			() => {
				saved.push('goal');
				return Promise.resolve(undefined);
			},
			() => {
				saved.push('daily goals');
				return Promise.resolve(undefined);
			}
		]);

		expect(finished).toBe(true);
		expect(saved).toEqual(['goal', 'daily goals']);
		expect(await state.isComplete()).toBe(true);
	});

	it('stops at the first problem and stays on the welcome screen', async () => {
		const state = new InMemoryAppState();
		const setup = new WelcomeSetup(new CompleteSetup(state));
		let reachedSecond = false;

		const finished = await setup.finish([
			() => Promise.resolve('Enter your weight.'),
			() => {
				reachedSecond = true;
				return Promise.resolve(undefined);
			}
		]);

		expect(finished).toBe(false);
		expect(setup.problem).toBe('Enter your weight.');
		expect(reachedSecond).toBe(false);
		expect(await state.isComplete()).toBe(false);
	});
});
