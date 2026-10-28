<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import type { LocalDate } from '../../shared/local-date.ts';
	import { formatDate } from '../../ui/format.ts';
	import type { TrainingDay } from '../application/get-training-days.ts';

	/** Props for the last seven days, each marked trained, rested, or empty. */
	interface Props {
		/** The days, newest first. */
		days: readonly TrainingDay[];
		/** The streak line. */
		streak: string;
		/** Today, for "Today" and "Yesterday" labels. */
		today: LocalDate;
		/** Marks or unmarks a day without a workout as a rest day. */
		ontoggle: (day: TrainingDay) => void;
	}

	const { days, streak, today, ontoggle }: Props = $props();
</script>

<section>
	<h2>{messages.training.thisWeek}</h2>
	<p class="streak">{streak}</p>
	<ul>
		{#each days as day (day.date.toString())}
			{@const label = formatDate(day.date, today)}
			<li>
				<span>{label}</span>
				{#if day.trained}
					<span class="trained">{messages.training.trained}</span>
				{:else}
					<button
						type="button"
						class:rested={day.rested}
						aria-pressed={day.rested}
						aria-label={messages.training.markRestDay(label)}
						onclick={() => {
							ontoggle(day);
						}}
					>
						{messages.training.restDay}
					</button>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	h2 {
		font-size: var(--font-size-body);
	}

	.streak {
		margin-bottom: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: var(--tap-target);
	}

	li + li {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.trained {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	button {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	button.rested {
		border-color: var(--color-text-muted);
		background: var(--color-surface);
		color: var(--color-text);
	}
</style>
