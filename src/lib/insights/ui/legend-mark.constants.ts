/** How a chart legend entry is drawn: the solid line, the dashed goal line, or a dot. */
export const LegendMark = {
	line: 'line',
	dashed: 'dashed',
	dot: 'dot'
} as const;

/** One of the legend marks. */
export type LegendMark = (typeof LegendMark)[keyof typeof LegendMark];
