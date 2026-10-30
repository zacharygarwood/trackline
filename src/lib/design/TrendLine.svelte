<script lang="ts">
	import { CHART_HEIGHTS, CHART_MARKER, CHART_WIDTH, ChartSize } from './chart.constants.ts';
	import { layoutTrendLine } from './trend-line.ts';

	/** Props for a line chart with a baseline and a square on the newest value. */
	interface Props {
		/** Values, oldest first; at least one. */
		values: readonly number[];
		/** Extra range above and below the values, in their unit. */
		padding: number;
		/** What the chart shows, in words, for screen readers. */
		summary: string;
		/** Defaults to `medium`. */
		size?: ChartSize;
	}

	const { values, padding, summary, size = ChartSize.medium }: Props = $props();

	const height = $derived(CHART_HEIGHTS[size]);
	const line = $derived(
		layoutTrendLine({ values, padding, width: CHART_WIDTH, height, marker: CHART_MARKER })
	);
	const BASELINE_OFFSET = 0.5;
</script>

<svg
	class={size}
	viewBox="0 0 {CHART_WIDTH} {height}"
	preserveAspectRatio="none"
	role="img"
	aria-label={summary}
>
	<line
		class="baseline"
		x1="0"
		x2={CHART_WIDTH}
		y1={height - BASELINE_OFFSET}
		y2={height - BASELINE_OFFSET}
	/>
	<polyline points={line.points} />
	<rect x={line.markerX} y={line.markerY} width={CHART_MARKER} height={CHART_MARKER} />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		overflow: visible;
	}

	.tall {
		height: var(--chart-height);
	}

	.medium {
		height: var(--chart-height-medium);
	}

	.short {
		height: var(--chart-height-small);
	}

	.baseline {
		stroke: var(--color-divider);
		vector-effect: non-scaling-stroke;
	}

	polyline {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 2;
		vector-effect: non-scaling-stroke;
	}

	rect {
		fill: var(--color-accent);
	}
</style>
