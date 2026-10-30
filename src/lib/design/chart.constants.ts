/** How tall a chart is: 120, 100, 80, or 72 pixels. */
export const ChartSize = {
	tall: 'tall',
	medium: 'medium',
	short: 'short',
	bars: 'bars'
} as const;

/** One of the {@link ChartSize} values. */
export type ChartSize = (typeof ChartSize)[keyof typeof ChartSize];

/** The drawing height of each chart size, in SVG units, matching its CSS height. */
export const CHART_HEIGHTS: Readonly<Record<ChartSize, number>> = {
	tall: 120,
	medium: 100,
	short: 80,
	bars: 72
};

/** The drawing width of every chart, in SVG units; charts stretch to fill their row. */
export const CHART_WIDTH = 350;

/** The size of the square on a chart's newest point. */
export const CHART_MARKER = 7;
