import { last } from '../shared/collections.ts';

/** Space kept above the highest and below the lowest point, in SVG units. */
const VERTICAL_INSET = 6;
/** The insets above and below together. */
const VERTICAL_INSETS = 12;
const DECIMALS = 1;
const HALF = 0.5;

/** What a trend line draws and the box it fills. */
export interface TrendLineInput {
	/** Values, oldest first. */
	readonly values: readonly number[];
	/** Extra range added above and below the values, in their unit. */
	readonly padding: number;
	readonly width: number;
	readonly height: number;
	/** The size of the square on the newest value. */
	readonly marker: number;
}

/** A polyline and the top-left corner of the square on its newest point. */
export interface TrendLineLayout {
	readonly points: string;
	readonly markerX: number;
	readonly markerY: number;
}

/**
 * Lays out a line chart the way the design draws it: evenly spaced values,
 * scaled between their padded minimum and maximum.
 *
 * @param input - The values and the drawing box.
 */
export function layoutTrendLine(input: TrendLineInput): TrendLineLayout {
	const values = input.values.length === 1 ? [...input.values, ...input.values] : input.values;
	const low = Math.min(...values) - input.padding;
	const high = Math.max(...values) + input.padding;
	const span = high - low === 0 ? 1 : high - low;
	const steps = Math.max(values.length - 1, 1);
	const coordinates = values.map((value, index) => ({
		x: (index / steps) * input.width,
		y: VERTICAL_INSET + ((high - value) / span) * (input.height - VERTICAL_INSETS)
	}));
	const newest = last(coordinates) ?? { x: 0, y: 0 };
	return {
		points: coordinates
			.map((point) => `${point.x.toFixed(DECIMALS)},${point.y.toFixed(DECIMALS)}`)
			.join(' '),
		markerX: Number((newest.x - input.marker * HALF).toFixed(DECIMALS)),
		markerY: Number((newest.y - input.marker * HALF).toFixed(DECIMALS))
	};
}

/** What a bar chart draws and the box it fills. */
export interface BarsInput {
	/** Values, oldest first. */
	readonly values: readonly number[];
	/** The value that fills the full height. */
	readonly scale: number;
	readonly width: number;
	readonly height: number;
	/** Space between bars, in SVG units. */
	readonly gap: number;
}

/** One bar, in SVG units. */
export interface Bar {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	/** The newest bar is drawn fully opaque, the others dimmed. */
	readonly newest: boolean;
}

/**
 * Lays out equal-width bars along the bottom of a box.
 *
 * @param input - The values, their scale, and the drawing box.
 */
export function layoutBars(input: BarsInput): readonly Bar[] {
	const count = input.values.length;
	const width = (input.width - input.gap * (count - 1)) / count;
	return input.values.map((value, index) => {
		const share = input.scale > 0 ? Math.min(1, Math.max(0, value / input.scale)) : 0;
		const height = share * input.height;
		return {
			x: index * (width + input.gap),
			y: input.height - height,
			width,
			height,
			newest: index === count - 1
		};
	});
}
