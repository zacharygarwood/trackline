import { describe, expect, it } from 'vitest';
import { InMemoryWeekStartPreference } from '../../../../tests/fakes/in-memory-week-start-preference.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { GetWeekStart } from '../application/get-week-start.ts';
import { SetWeekStart } from '../application/set-week-start.ts';
import { WeekStartSetting } from './week-start-setting.svelte.ts';

describe('WeekStartSetting', () => {
	it('loads and changes the first day of the week', async () => {
		const preference = new InMemoryWeekStartPreference();
		const setting = new WeekStartSetting({
			getWeekStart: new GetWeekStart(preference),
			setWeekStart: new SetWeekStart(preference)
		});
		await setting.load();
		expect(setting.weekStart).toBe(WeekStart.monday);

		await setting.choose(WeekStart.sunday);

		expect(await preference.read()).toBe(WeekStart.sunday);
	});
});
