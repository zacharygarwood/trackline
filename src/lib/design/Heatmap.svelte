<script lang="ts">
	import type { LocalDate } from '../shared/local-date.ts';
	import type { WeekStart } from '../shared/week-start.constants.ts';
	import type { HeatmapShade } from './heatmap.constants.ts';
	import { layoutHeatmap } from './heatmap.ts';

	/** Props for a GitHub-style grid of days, one column per week. */
	interface Props {
		/** The last day drawn. */
		today: LocalDate;
		/** How many week columns to draw. */
		weeks: number;
		/** The day at the top of each column. */
		weekStart: WeekStart;
		/** How each day is filled. */
		shadeOf: (date: LocalDate) => HeatmapShade;
		/** What the grid shows, in words, for screen readers. */
		summary: string;
	}

	const { today, weeks, weekStart, shadeOf, summary }: Props = $props();

	const CELL = 10;
	const GAP = 2;
	const STEP = CELL + GAP;
	const DAYS_PER_WEEK = 7;
	const RADIUS = 2;

	const cells = $derived(layoutHeatmap({ today, weeks, weekStart, shadeOf }));
</script>

<svg
	viewBox="0 0 {weeks * STEP - GAP} {DAYS_PER_WEEK * STEP - GAP}"
	role="img"
	aria-label={summary}
>
	{#each cells as cell (cell.date.toString())}
		<rect
			class={cell.shade}
			x={cell.column * STEP}
			y={cell.row * STEP}
			width={CELL}
			height={CELL}
			rx={RADIUS}
		/>
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.empty {
		fill: var(--color-heat-empty);
	}

	.muted {
		fill: var(--color-heat-muted);
	}

	.full {
		fill: var(--color-accent);
	}
</style>
