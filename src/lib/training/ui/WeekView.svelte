<script lang="ts">
	import Card from '../../design/Card.svelte';
	import Icon from '../../design/Icon.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { LocalDate } from '../../shared/local-date.ts';
	import { formatDate, formatWeekday } from '../../ui/format.ts';
	import type { TrainingDay } from '../application/get-training-days.ts';

	/** Props for the last seven days as a strip of workouts and rest days. */
	interface Props {
		/** The days, newest first. */
		days: readonly TrainingDay[];
		/** Today, for "Today" and "Yesterday" labels. */
		today: LocalDate;
		/** Marks or unmarks a day without a workout as a rest day. */
		ontoggle: (day: TrainingDay) => void;
	}

	const { days, today, ontoggle }: Props = $props();

	const oldestFirst = $derived(days.toReversed());
	const workouts = $derived(days.filter((day) => day.trained).length);
	const restDays = $derived(days.filter((day) => !day.trained && day.rested).length);
</script>

<Card title={messages.training.lastSevenDays}>
	{#snippet trailing()}
		<span>{messages.training.weekSummary(workouts, restDays)}</span>
	{/snippet}
	<ol class="strip">
		{#each oldestFirst as day (day.date.toString())}
			{@const label = formatDate(day.date, today)}
			<li>
				<span class="weekday" class:today={day.date.equals(today)}>{formatWeekday(day.date)}</span>
				{#if day.trained}
					<span class="day trained" role="img" aria-label={messages.training.dayTrained(label)}>
						<Icon name="check" />
					</span>
				{:else}
					<button
						type="button"
						class="day"
						class:rested={day.rested}
						aria-pressed={day.rested}
						aria-label={messages.training.markRestDay(label)}
						onclick={() => {
							ontoggle(day);
						}}
					>
						{#if day.rested}<Icon name="moon" />{/if}
					</button>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="legend" aria-hidden="true">
		<span class="key trained-key">{messages.training.trained}</span>
		<span class="key rest-key">{messages.training.restDay}</span>
	</p>
</Card>

<style>
	.strip {
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
		align-items: stretch;
		gap: var(--space-1);
		text-align: center;
	}

	.day {
		display: grid;
		place-items: center;
		height: var(--tap-target);
		padding: 0;
		border: none;
		border-radius: var(--radius-small);
		background: var(--color-surface);
		color: var(--color-on-accent);
		cursor: pointer;
		--icon-size: 20px;
	}

	.trained {
		background: var(--color-accent);
		cursor: default;
	}

	.rested {
		background: var(--color-rest);
		color: var(--color-on-rest);
	}

	.weekday {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.weekday.today {
		color: var(--color-text);
		font-weight: var(--font-weight-semibold);
	}

	.legend {
		display: flex;
		gap: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.key::before {
		content: '';
		display: inline-block;
		width: var(--space-3);
		height: var(--space-3);
		margin-right: var(--space-2);
		vertical-align: middle;
		border-radius: var(--radius-small);
	}

	.trained-key::before {
		background: var(--color-accent);
	}

	.rest-key::before {
		background: var(--color-rest);
	}
</style>
