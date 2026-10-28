import { first } from '../shared/collections.ts';

/** A value to plot: `x` is usually an epoch day, `y` the measured amount. */
export interface ChartPoint {
	readonly x: number;
	readonly y: number;
}

/** Everything a line chart draws, in SVG user units. */
export interface ChartLayout {
	readonly dots: readonly { readonly cx: number; readonly cy: number }[];
	readonly trendPath: string;
	/** A dashed step line from the left edge to the right; undefined without a goal. */
	readonly goalPath: string | undefined;
	readonly top: { readonly y: number; readonly value: number };
	readonly bottom: { readonly y: number; readonly value: number };
}

/** What to lay out and the drawing area. */
export interface ChartInput {
	readonly points: readonly ChartPoint[];
	readonly trend: readonly ChartPoint[];
	/** Goal values, each in effect from its `x` on; one point for a constant goal. */
	readonly goal: readonly ChartPoint[];
	readonly width: number;
	readonly height: number;
	readonly inset: number;
}

const HEADROOM = 0.1;
const MIN_SPAN = 1;
const HALF = 0.5;

interface Range {
	readonly min: number;
	readonly max: number;
}

function rangeOf(values: readonly number[], padding: number): Range {
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = Math.max(max - min, MIN_SPAN);
	return { min: min - span * padding, max: max + span * padding };
}

function scale(range: Range, from: number, to: number): (value: number) => number {
	const span = range.max - range.min;
	return (value) =>
		span === 0 ? (from + to) * HALF : from + ((value - range.min) / span) * (to - from);
}

interface Scales {
	readonly x: (value: number) => number;
	readonly y: (value: number) => number;
}

function goalPath(goal: readonly ChartPoint[], width: number, scales: Scales): string | undefined {
	const start = first(goal);
	if (start === undefined) return undefined;
	const steps = goal
		.slice(1)
		.map((point) => `H${String(scales.x(point.x))} V${String(scales.y(point.y))}`);
	return [`M0,${String(scales.y(start.y))}`, ...steps, `H${String(width)}`].join(' ');
}

/**
 * Positions a chart's dots, trend line, and goal line, leaving headroom so
 * nothing touches the edges.
 *
 * @param input - The data and the size of the drawing area.
 * @returns Coordinates with y growing downward, as in SVG.
 */
export function layoutLineChart(input: ChartInput): ChartLayout {
	const ys = [...input.points, ...input.trend, ...input.goal].map((point) => point.y);
	const yRange = rangeOf(ys, HEADROOM);
	const xs = [...input.points, ...input.trend].map((point) => point.x);
	const xRange = { min: Math.min(...xs), max: Math.max(...xs) };
	const x = scale(xRange, input.inset, input.width - input.inset);
	const y = scale(yRange, input.height - input.inset, input.inset);
	return {
		dots: input.points.map((point) => ({ cx: x(point.x), cy: y(point.y) })),
		trendPath: input.trend
			.map(
				(point, index) => `${index === 0 ? 'M' : 'L'}${String(x(point.x))},${String(y(point.y))}`
			)
			.join(' '),
		goalPath: goalPath(input.goal, input.width, { x, y }),
		top: { y: input.inset, value: yRange.max },
		bottom: { y: input.height - input.inset, value: yRange.min }
	};
}
