<script lang="ts">
	import Card from '../../design/Card.svelte';
	import Row from '../../design/Row.svelte';
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

<Card title={messages.training.recent}>
	{#each workouts as workout (workout.id)}
		<Row label={describe(workout)} value={formatDate(workout.date, today)} />
	{/each}
</Card>
