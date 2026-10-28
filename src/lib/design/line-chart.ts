/** A value to plot: `x` is usually an epoch day, `y` the measured amount. */
export interface ChartPoint {
	readonly x: number;
	readonly y: number;
}

/** Everything a line chart draws, in SVG user units. */
export interface ChartLayout {
	readonly dots: readonly { readonly cx: number; readonly cy: number }[];
	readonly trendPath: string;
	readonly goalY: number | undefined;
	readonly top: { readonly y: number; readonly value: number };
	readonly bottom: { readonly y: number; readonly value: number };
}

/** What to lay out and the drawing area. */
export interface ChartInput {
	readonly points: readonly ChartPoint[];
	readonly trend: readonly ChartPoint[];
	readonly goal: number | undefined;
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

/**
 * Positions a chart's dots, trend line, and goal line, leaving headroom so
 * nothing touches the edges.
 *
 * @param input - The data and the size of the drawing area.
 * @returns Coordinates with y growing downward, as in SVG.
 */
export function layoutLineChart(input: ChartInput): ChartLayout {
	const ys = [...input.points, ...input.trend].map((point) => point.y);
	const yRange = rangeOf(input.goal === undefined ? ys : [...ys, input.goal], HEADROOM);
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
		goalY: input.goal === undefined ? undefined : y(input.goal),
		top: { y: input.inset, value: yRange.max },
		bottom: { y: input.height - input.inset, value: yRange.min }
	};
}
