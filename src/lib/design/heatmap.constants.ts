/** How strongly a heatmap day is filled: nothing, a muted shade, or the accent. */
export const HeatmapShade = {
	empty: 'empty',
	muted: 'muted',
	full: 'full'
} as const;

/** One of the heatmap fills. */
export type HeatmapShade = (typeof HeatmapShade)[keyof typeof HeatmapShade];
