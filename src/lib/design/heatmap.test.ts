import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../tests/support/result.ts';
import { LocalDate } from '../shared/local-date.ts';
import { HeatmapShade } from './heatmap.constants.ts';
import { layoutHeatmap } from './heatmap.ts';

const wednesday = expectOk(LocalDate.parse('2026-10-28'));

describe('layoutHeatmap', () => {
	it('starts on a Monday 51 weeks before the current week and stops at today', () => {
		const cells = layoutHeatmap({ today: wednesday, weeks: 52, shadeOf: () => HeatmapShade.empty });

		expect(cells.at(0)).toMatchObject({ column: 0, row: 0 });
		expect(cells.at(0)?.date.toString()).toBe('2025-11-03');
		expect(cells.at(-1)).toMatchObject({ column: 51, row: 2 });
		expect(cells.at(-1)?.date.toString()).toBe('2026-10-28');
		expect(cells).toHaveLength(51 * 7 + 3);
	});

	it('puts Sunday at the bottom of its week', () => {
		const sunday = expectOk(LocalDate.parse('2026-11-01'));

		const cells = layoutHeatmap({ today: sunday, weeks: 1, shadeOf: () => HeatmapShade.empty });

		expect(cells.map((cell) => cell.row)).toEqual([0, 1, 2, 3, 4, 5, 6]);
		expect(cells.at(0)?.date.toString()).toBe('2026-10-26');
	});

	it('shades each day as asked', () => {
		const cells = layoutHeatmap({
			today: wednesday,
			weeks: 1,
			shadeOf: (date) => (date.equals(wednesday) ? HeatmapShade.full : HeatmapShade.muted)
		});

		expect(cells.map((cell) => cell.shade)).toEqual([
			HeatmapShade.muted,
			HeatmapShade.muted,
			HeatmapShade.full
		]);
	});
});
