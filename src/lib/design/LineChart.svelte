<script lang="ts">
	import { layoutLineChart, type ChartPoint } from './line-chart.ts';

	/** Props for a small line chart: dots for raw values, a line for the trend. */
	interface Props {
		/** Raw values, drawn as dots. */
		points: readonly ChartPoint[];
		/** Smoothed values, drawn as a line. */
		trend: readonly ChartPoint[];
		/** A target value, drawn as a dashed line. */
		goal: number | undefined;
		/** What the chart shows, in words, for screen readers. */
		summary: string;
		/** Formats the values on the vertical axis. */
		formatValue: (value: number) => string;
	}

	const { points, trend, goal, summary, formatValue }: Props = $props();

	const WIDTH = 320;
	const HEIGHT = 180;
	const INSET = 16;
	const DOT_RADIUS = 3.5;
	const LABEL_OFFSET = 4;

	const layout = $derived(
		layoutLineChart({ points, trend, goal, width: WIDTH, height: HEIGHT, inset: INSET })
	);
</script>

<svg viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label={summary}>
	<line class="axis" x1="0" x2={WIDTH} y1={layout.bottom.y} y2={layout.bottom.y} />
	{#if layout.goalY !== undefined}
		<line class="goal" x1="0" x2={WIDTH} y1={layout.goalY} y2={layout.goalY} />
	{/if}
	<path class="trend" d={layout.trendPath} />
	{#each layout.dots as dot, position (position)}
		<circle class="dot" cx={dot.cx} cy={dot.cy} r={DOT_RADIUS} />
	{/each}
	<text x="0" y={layout.top.y - LABEL_OFFSET}>{formatValue(layout.top.value)}</text>
	<text x="0" y={layout.bottom.y - LABEL_OFFSET}>{formatValue(layout.bottom.value)}</text>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.axis {
		stroke: var(--color-divider);
		stroke-width: 1;
	}

	.goal {
		stroke: var(--color-text-muted);
		stroke-width: 1;
		stroke-dasharray: 4 4;
	}

	.trend {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.dot {
		fill: var(--color-text-muted);
	}

	text {
		fill: var(--color-text-muted);
		font-size: var(--font-size-chart-label);
		font-variant-numeric: tabular-nums;
	}
</style>
