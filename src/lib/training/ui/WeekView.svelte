<script lang="ts">
	import Card from '../../design/Card.svelte';
	import Icon from '../../design/Icon.svelte';
	import { Tone } from '../../design/tone.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import type { LocalDate } from '../../shared/local-date.ts';
	import { formatDate, formatWeekday } from '../../ui/format.ts';
	import type { TrainingDay } from '../application/get-training-days.ts';
	import type { TrainingStreak } from '../domain/training-streak.ts';

	/** Props for the last seven days as a strip of workouts and rest days, with the streak. */
	interface Props {
		/** The days, newest first. */
		days: readonly TrainingDay[];
		streak: TrainingStreak;
		/** Today, for "Today" and "Yesterday" labels. */
		today: LocalDate;
		/** Marks or unmarks a day without a workout as a rest day. */
		ontoggle: (day: TrainingDay) => void;
	}

	const { days, streak, today, ontoggle }: Props = $props();

	const oldestFirst = $derived(days.toReversed());
</script>

<Card title={messages.training.thisWeek} icon="train" tone={Tone.carbs}>
	{#snippet trailing()}
		<span class="streak" aria-label={messages.training.streak(streak.current, streak.longest)}>
			<span class="flame"><Icon name="flame" /></span>
			<span class="current">{messages.training.streakNow(streak.current)}</span>
			<span class="best">{messages.training.best(streak.longest)}</span>
		</span>
	{/snippet}
	<ol class="strip">
		{#each oldestFirst as day (day.date.toString())}
			{@const label = formatDate(day.date, today)}
			<li>
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
				<span class="weekday" class:today={day.date.equals(today)}>{formatWeekday(day.date)}</span>
			</li>
		{/each}
	</ol>
	<p class="legend" aria-hidden="true">
		<span class="key trained-key">{messages.training.trained}</span>
		<span class="key rest-key">{messages.training.restDay}</span>
	</p>
</Card>

<style>
	.streak {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-variant-numeric: tabular-nums;
	}

	.flame {
		color: var(--color-accent);
		--icon-size: 20px;
	}

	.current {
		font-weight: var(--font-weight-semibold);
	}

	.best {
		margin-left: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

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
		align-items: center;
		gap: var(--space-1);
	}

	.day {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		padding: 0;
		border: var(--focus-ring-width) dashed var(--color-divider);
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--color-on-accent);
		cursor: pointer;
		--icon-size: 20px;
	}

	.trained {
		border: none;
		background: var(--color-accent);
		cursor: default;
	}

	.rested {
		border: none;
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
		border-radius: var(--radius-round);
	}

	.trained-key::before {
		background: var(--color-accent);
	}

	.rest-key::before {
		background: var(--color-rest);
	}
</style>
