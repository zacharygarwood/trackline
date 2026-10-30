<script lang="ts">
	import { formatWeekdayLetter } from '../../ui/format.ts';
	import type { WeekStripDay } from './week-strip.ts';

	/** Props for the current week as seven squares, each labeled with its weekday's letter. Decorative: describe the week in nearby text. */
	interface Props {
		days: readonly WeekStripDay[];
	}

	const { days }: Props = $props();
</script>

<ol class="week" aria-hidden="true">
	{#each days as day (day.date.toString())}
		<li class={day.state}>
			<span class="square"></span>
			<span class="letter">{formatWeekdayLetter(day.date)}</span>
		</li>
	{/each}
</ol>

<style>
	.week {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.square {
		aspect-ratio: 1;
		background: var(--color-empty);
	}

	.letter {
		color: var(--color-text-muted);
		font-size: var(--font-size-12);
		font-weight: var(--font-weight-medium);
		text-align: center;
	}

	.trained .square {
		background: var(--color-accent);
	}

	.rested .square {
		background: var(--color-surface-strong);
	}

	.today .square {
		box-shadow: inset 0 0 0 var(--focus-ring-width) var(--color-text);
	}

	.today .letter {
		color: var(--color-text);
		font-weight: var(--font-weight-bold);
	}

	.upcoming .square {
		background: transparent;
		box-shadow: inset 0 0 0 var(--border-hairline) var(--color-empty);
	}
</style>
