<script lang="ts">
	import type { LocalDate } from '../shared/local-date.ts';
	import type { WeekStart } from '../shared/week-start.constants.ts';
	import { IN_RANGE_OPACITY } from './heatmap.constants.ts';
	import { layoutWorkoutHeatmap } from './workout-heatmap.ts';

	/** Props for the workout days of the chosen range, drawn as week columns that fill the width. */
	interface Props {
		today: LocalDate;
		/** How many weeks to draw, ending with the current week. */
		weeks: number;
		weekStart: WeekStart;
		minutesOf: (date: LocalDate) => number;
		/** The short month name of a date, for the labels above the columns. */
		monthLabel: (date: LocalDate) => string;
		/** One letter or nothing for each row, first day of the week first. */
		weekdayLetters: readonly string[];
		/** What the grid shows, in words, for screen readers. */
		summary: string;
	}

	const { today, weeks, weekStart, minutesOf, monthLabel, weekdayLetters, summary }: Props =
		$props();

	const CELL = 14;
	const STEP = 17;
	const DAYS = 7;
	const RING = 1;
	const HALF_RING = 0.5;
	const TODAY_INSET = 2;
	/** How far a short range's cells may grow past their natural size. */
	const MAX_SCALE = 2.5;

	const layout = $derived(
		layoutWorkoutHeatmap({ today, weeks, rangeWeeks: weeks, weekStart, minutesOf })
	);
	const width = $derived(weeks * STEP - (STEP - CELL));
	const height = DAYS * STEP - (STEP - CELL);
</script>

<div class="heatmap" role="img" aria-label={summary} style:--max-width={width * MAX_SCALE}>
	<ol class="months" aria-hidden="true">
		{#each layout.months as month (month.column)}
			<li style:--at={month.column / weeks}>{monthLabel(month.date)}</li>
		{/each}
	</ol>
	<ol class="weekdays" aria-hidden="true">
		{#each weekdayLetters as letter, row (row)}
			<li>{letter}</li>
		{/each}
	</ol>
	<svg viewBox="0 0 {width} {height}" aria-hidden="true">
		{#each layout.cells as cell (cell.date.toString())}
			{@const x = cell.column * STEP}
			{@const y = cell.row * STEP}
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
					fill-opacity={IN_RANGE_OPACITY.at(cell.level) ?? 1}
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

<style>
	.heatmap {
		display: grid;
		grid-template-columns: auto minmax(0, calc(var(--max-width) * 1px));
		grid-template-rows: auto auto;
		justify-content: start;
		gap: var(--chip-gap);
		margin-top: var(--chip-gap);
	}

	.months {
		position: relative;
		grid-column: 2;
		height: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-12);
	}

	.months li {
		position: absolute;
		left: min(calc(var(--at) * 100%), calc(100% - var(--space-6)));
	}

	.weekdays {
		display: grid;
		grid-row: 2;
		grid-template-rows: repeat(7, 1fr);
		color: var(--color-text-muted);
		font-size: var(--font-size-10);
		align-items: center;
	}

	svg {
		display: block;
		grid-row: 2;
		grid-column: 2;
		width: 100%;
		height: auto;
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
