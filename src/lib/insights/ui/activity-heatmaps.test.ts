import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../../tests/support/result.ts';
import { HeatmapShade } from '../../design/heatmap.constants.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { activityHeatmaps } from './activity-heatmaps.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));

describe('activityHeatmaps', () => {
	const [training, food, protein] = activityHeatmaps({
		trained: [date('2026-10-01'), date('2026-10-03')],
		rested: [date('2026-10-02')],
		foodLogged: [date('2026-10-01')],
		proteinGoalMet: []
	});

	it('fills trained days and shades rest days in the muted color', () => {
		expect(
			['2026-10-01', '2026-10-02', '2026-10-04'].map((day) => training?.shadeOf(date(day)))
		).toEqual([HeatmapShade.full, HeatmapShade.muted, HeatmapShade.empty]);
		expect(training?.summary).toBe('Trained on 2 days and rested on 1 day in the last 52 weeks.');
	});

	it('fills days with food logged', () => {
		expect(food?.shadeOf(date('2026-10-01'))).toBe(HeatmapShade.full);
		expect(food?.shadeOf(date('2026-10-02'))).toBe(HeatmapShade.empty);
		expect(food?.summary).toBe('Food logged on 1 day in the last 52 weeks.');
	});

	it('fills days the protein goal was met', () => {
		expect(protein?.shadeOf(date('2026-10-01'))).toBe(HeatmapShade.empty);
		expect(protein?.summary).toBe('Protein goal met on 0 days in the last 52 weeks.');
	});
});
