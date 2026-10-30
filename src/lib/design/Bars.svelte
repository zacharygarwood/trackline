<script lang="ts">
	import { CHART_HEIGHTS, CHART_WIDTH, ChartSize } from './chart.constants.ts';
	import { layoutBars } from './trend-line.ts';

	/** Props for a bar chart, newest bar brightest, with an optional dashed goal line. */
	interface Props {
		/** Values, oldest first; at least one. */
		values: readonly number[];
		/** The value that fills the full height. */
		scale: number;
		/** What the chart shows, in words, for screen readers. */
		summary: string;
		/** A value drawn as a dashed line across, if any. */
		goal?: number | undefined;
		/** Defaults to `bars`. */
		size?: ChartSize;
	}

	const { values, scale, summary, goal, size = ChartSize.bars }: Props = $props();

	/** Bars this many or fewer get the wider gap. */
	const FEW_BARS = 20;
	const WIDE_GAP = 4;
	const NARROW_GAP = 2;

	const height = $derived(CHART_HEIGHTS[size]);
	const bars = $derived(
		layoutBars({
			values,
			scale,
			width: CHART_WIDTH,
			height,
			gap: values.length > FEW_BARS ? NARROW_GAP : WIDE_GAP
		})
	);
	const goalY = $derived(
		goal === undefined || scale <= 0 ? undefined : height - Math.min(1, goal / scale) * height
	);
</script>

<svg
	class={size}
	viewBox="0 0 {CHART_WIDTH} {height}"
	preserveAspectRatio="none"
	role="img"
	aria-label={summary}
>
	{#if size === ChartSize.bars}
		<line class="baseline" x1="0" x2={CHART_WIDTH} y1={height} y2={height} />
	{/if}
	{#each bars as bar, position (position)}
		<rect class:newest={bar.newest} x={bar.x} y={bar.y} width={bar.width} height={bar.height} />
	{/each}
	{#if goalY !== undefined}
		<line class="goal" x1="0" x2={CHART_WIDTH} y1={goalY} y2={goalY} />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		overflow: visible;
	}

	.medium {
		height: var(--chart-height-medium);
	}

	.bars {
		height: var(--bars-height);
	}

	rect {
		fill: var(--color-accent);
		fill-opacity: 0.45;
	}

	rect.newest {
		fill-opacity: 1;
	}

	.baseline {
		stroke: var(--color-divider);
		vector-effect: non-scaling-stroke;
	}

	.goal {
		stroke: var(--color-text);
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
		vector-effect: non-scaling-stroke;
	}
</style>
