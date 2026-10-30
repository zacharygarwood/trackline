import { describe, expect, it } from 'vitest';
import { layoutBars, layoutTrendLine } from './trend-line.ts';

describe('layoutTrendLine', () => {
	it('spreads values across the width with headroom and marks the newest', () => {
		const line = layoutTrendLine({
			values: [10, 20, 15],
			padding: 0,
			width: 100,
			height: 52,
			marker: 6
		});

		expect(line.points).toBe('0.0,46.0 50.0,6.0 100.0,26.0');
		expect([line.markerX, line.markerY]).toEqual([97, 23]);
	});

	it('draws one value as a flat line', () => {
		expect(
			layoutTrendLine({ values: [5], padding: 1, width: 10, height: 52, marker: 2 }).points
		).toBe('0.0,26.0 10.0,26.0');
	});
});

describe('layoutBars', () => {
	it('scales bars to the tallest, keeps the newest fully opaque, and dims the others', () => {
		const bars = layoutBars({ values: [50, 100, 25], scale: 200, width: 100, height: 100, gap: 4 });

		expect(bars.map((bar) => [bar.height, bar.newest])).toEqual([
			[25, false],
			[50, false],
			[12.5, true]
		]);
		expect(bars.at(1)?.width).toBeCloseTo(30.67, 2);
		expect(bars.at(1)?.x).toBeCloseTo(34.67, 2);
		expect(bars.at(1)?.y).toBe(50);
	});

	it('draws nothing above the scale', () => {
		expect(
			layoutBars({ values: [300], scale: 200, width: 10, height: 10, gap: 0 }).at(0)?.height
		).toBe(10);
	});
});
