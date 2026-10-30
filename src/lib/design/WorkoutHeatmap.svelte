<script lang="ts">
	import type { LocalDate } from '../shared/local-date.ts';
	import type { WeekStart } from '../shared/week-start.constants.ts';
	import { IN_RANGE_OPACITY } from './heatmap.constants.ts';
	import { layoutWorkoutHeatmap } from './workout-heatmap.ts';

	/** Props for two years of workout days, scrolled to the current week. */
	interface Props {
		today: LocalDate;
		/** How many of the latest weeks the chosen range covers; earlier weeks are dimmed. */
		rangeWeeks: number;
		weekStart: WeekStart;
		minutesOf: (date: LocalDate) => number;
		/** The short month name of a date, for the labels above the columns. */
		monthLabel: (date: LocalDate) => string;
		/** One letter or nothing for each row, first day of the week first. */
		weekdayLetters: readonly string[];
		/** What the grid shows, in words, for screen readers. */
		summary: string;
	}

	const { today, rangeWeeks, weekStart, minutesOf, monthLabel, weekdayLetters, summary }: Props =
		$props();

	const WEEKS = 104;
	const CELL = 14;
	const STEP = 17;
	const DAYS = 7;
	const LABEL_HEIGHT = 20;
	const LABEL_BASELINE = 12;
	const RING = 1;
	const HALF_RING = 0.5;
	const TODAY_INSET = 2;
	const OUT_OF_RANGE_EMPTY = 0.45;
	const OUT_OF_RANGE_FILLED = 0.18;

	const layout = $derived(
		layoutWorkoutHeatmap({ today, weeks: WEEKS, rangeWeeks, weekStart, minutesOf })
	);
	const width = WEEKS * STEP;
	const height = LABEL_HEIGHT + DAYS * STEP;

	let scroller: HTMLDivElement | undefined = $state();

	/**
	 * Starts at the current week, and makes the scrolling area reachable by
	 * keyboard (WCAG 2.1.1) so earlier weeks can be scrolled to with the arrow keys.
	 */
	$effect(() => {
		if (scroller === undefined) return;
		scroller.scrollLeft = scroller.scrollWidth;
		scroller.tabIndex = 0;
	});

	function opacity(level: number, inRange: boolean): number {
		if (inRange) return IN_RANGE_OPACITY.at(level) ?? 1;
		return level === 0 ? OUT_OF_RANGE_EMPTY : OUT_OF_RANGE_FILLED;
	}
</script>

<div class="heatmap">
	<ol class="weekdays" aria-hidden="true">
		{#each weekdayLetters as letter, row (row)}
			<li>{letter}</li>
		{/each}
	</ol>
	<div class="scroller" bind:this={scroller} role="region" aria-label={summary}>
		<svg viewBox="0 0 {width} {height}" {width} {height} aria-hidden="true">
			{#each layout.months as month (month.column)}
				<text
					class:dim={month.column < WEEKS - rangeWeeks}
					x={month.column * STEP}
					y={LABEL_BASELINE}>{monthLabel(month.date)}</text
				>
			{/each}
			{#each layout.cells as cell (cell.date.toString())}
				{@const x = cell.column * STEP}
				{@const y = LABEL_HEIGHT + cell.row * STEP}
				{#if cell.future}
					<rect
						class="ahead"
						x={x + HALF_RING}
						y={y + HALF_RING}
						width={CELL - RING}
						height={CELL - RING}
					/>
				{:else}
					<rect
						class:done={cell.level > 0}
						{x}
						{y}
						width={CELL}
						height={CELL}
						fill-opacity={opacity(cell.level, cell.inRange)}
					/>
					{#if cell.today}
						<rect
							class="today"
							x={x + RING}
							y={y + RING}
							width={CELL - TODAY_INSET}
							height={CELL - TODAY_INSET}
						/>
					{/if}
				{/if}
			{/each}
		</svg>
	</div>
</div>

<style>
	.heatmap {
		display: flex;
		gap: var(--chip-gap);
		margin-top: var(--chip-gap);
	}

	.weekdays {
		display: grid;
		flex: none;
		grid-template-rows: repeat(7, var(--heat-cell));
		gap: var(--tick-gap);
		padding-top: var(--space-5);
		color: var(--color-text-muted);
		font-size: var(--font-size-10);
		line-height: var(--heat-cell);
	}

	.scroller {
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.scroller:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-text);
		outline-offset: var(--focus-ring-width);
	}

	svg {
		display: block;
	}

	text {
		fill: var(--color-text-muted);
		font-size: var(--font-size-12);
	}

	text.dim {
		fill: var(--color-field-line);
	}

	rect {
		fill: var(--color-empty);
	}

	rect.done {
		fill: var(--color-accent);
	}

	.ahead {
		fill: none;
		stroke: var(--color-empty);
	}

	.today {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 2;
	}
</style>
