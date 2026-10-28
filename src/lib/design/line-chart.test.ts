import { describe, expect, it } from 'vitest';
import { layoutLineChart, type ChartInput } from './line-chart.ts';

const area = { width: 100, height: 100, inset: 10 } as const;

describe('layoutLineChart', () => {
	it('spreads points across the width and puts larger values higher', () => {
		const layout = layoutLineChart({
			...area,
			points: [
				{ x: 0, y: 80 },
				{ x: 10, y: 81 }
			],
			trend: [],
			goal: undefined
		});

		const [older, newer] = layout.dots;
		expect(layout.dots.map((dot) => dot.cx)).toEqual([10, 90]);
		expect(newer?.cy ?? 0).toBeLessThan(older?.cy ?? 0);
	});

	it('keeps headroom above and below the data', () => {
		const layout = layoutLineChart({
			...area,
			points: [
				{ x: 0, y: 80 },
				{ x: 1, y: 90 }
			],
			trend: [],
			goal: undefined
		});

		expect(layout.top.value).toBe(91);
		expect(layout.bottom.value).toBe(79);
	});

	it('draws the trend as one connected path', () => {
		const layout = layoutLineChart({
			...area,
			points: [],
			trend: [
				{ x: 0, y: 1 },
				{ x: 1, y: 2 },
				{ x: 2, y: 3 }
			],
			goal: undefined
		});

		expect(layout.trendPath.match(/[ML]/g)).toEqual(['M', 'L', 'L']);
	});

	it('includes the goal in the vertical range', () => {
		const input: ChartInput = { ...area, points: [{ x: 0, y: 80 }], trend: [], goal: 70 };

		const layout = layoutLineChart(input);

		expect(layout.goalY).toBeDefined();
		expect(layout.bottom.value).toBeLessThan(70);
	});

	it('centers a single point', () => {
		const layout = layoutLineChart({
			...area,
			points: [{ x: 5, y: 80 }],
			trend: [],
			goal: undefined
		});

		expect(layout.dots).toEqual([{ cx: 50, cy: 50 }]);
	});
});
