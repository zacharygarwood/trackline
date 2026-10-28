<script lang="ts">
	import EmptyState from '../../design/EmptyState.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { LocalDate } from '../../shared/local-date.ts';
	import { formatDate } from '../../ui/format.ts';
	import type { FinishedWorkout } from '../domain/workout.ts';

	/** Props for the list of recent finished workouts. */
	interface Props {
		/** Workouts, newest first. */
		workouts: readonly FinishedWorkout[];
		/** Describes a workout in a few words. */
		describe: (workout: FinishedWorkout) => string;
		/** Today, for "Today" and "Yesterday" labels. */
		today: LocalDate;
	}

	const { workouts, describe, today }: Props = $props();
</script>

<section>
	<h2>{messages.training.recent}</h2>
	{#if workouts.length === 0}
		<EmptyState message={messages.training.noWorkouts} />
	{:else}
		<ul>
			{#each workouts as workout (workout.id)}
				<li>
					<span>{formatDate(workout.date, today)}</span>
					<span class="summary">{describe(workout)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	h2 {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-body);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-direction: column;
		padding: var(--space-3) 0;
	}

	li + li {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.summary {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}
</style>
