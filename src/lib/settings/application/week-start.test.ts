import { describe, expect, it } from 'vitest';
import { InMemoryWeekStartPreference } from '../../../../tests/fakes/in-memory-week-start-preference.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { GetWeekStart } from './get-week-start.ts';
import { SetWeekStart } from './set-week-start.ts';

describe('week start use cases', () => {
	it('starts weeks on Monday until the user chooses', async () => {
		expect(await new GetWeekStart(new InMemoryWeekStartPreference()).execute()).toBe(
			WeekStart.monday
		);
	});

	it('remembers the chosen first day', async () => {
		const preference = new InMemoryWeekStartPreference();

		await new SetWeekStart(preference).execute({ weekStart: WeekStart.sunday });

		expect(await new GetWeekStart(preference).execute()).toBe(WeekStart.sunday);
	});
});
