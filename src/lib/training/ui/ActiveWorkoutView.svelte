<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { FinishedWorkout } from '../domain/workout.ts';
	import AddExerciseSheet from './AddExerciseSheet.svelte';
	import ExerciseCard from './ExerciseCard.svelte';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for the workout in progress. */
	interface Props {
		/** The session holding the workout. */
		session: WorkoutSession;
		/** Called after finishing; undefined when nothing was completed and the workout was discarded. */
		onfinished: (workout: FinishedWorkout | undefined) => void;
		/** Called after the workout was thrown away. */
		ondiscarded: () => void;
	}

	const { session, onfinished, ondiscarded }: Props = $props();

	let adding = $state(false);
	let confirmingDiscard = $state(false);

	async function finish(): Promise<void> {
		onfinished(await session.finish());
	}

	async function discard(): Promise<void> {
		await session.discard();
		ondiscarded();
	}
</script>

{#if session.workout !== undefined}
	<div class="workout">
		{#each session.workout.exercises as exercise (exercise.exerciseId)}
			<ExerciseCard {session} {exercise} />
		{/each}
		<Button variant={ButtonVariant.secondary} onclick={() => (adding = true)}>
			{messages.training.addExercise}
		</Button>
		<label>
			<span>{messages.training.note}</span>
			<textarea
				value={session.workout.note}
				onchange={(event) => session.setNote(event.currentTarget.value)}></textarea>
		</label>
		<Button onclick={finish}>{messages.training.finishWorkout}</Button>
		<Button variant={ButtonVariant.quiet} onclick={() => (confirmingDiscard = true)}>
			{messages.training.discardWorkout}
		</Button>
	</div>
{/if}

{#if adding}
	<AddExerciseSheet {session} onclose={() => (adding = false)} />
{/if}

{#if confirmingDiscard}
	<Sheet bind:open={confirmingDiscard} title={messages.training.discardTitle}>
		<p>{messages.training.discardWarning}</p>
		<Button onclick={discard}>{messages.training.discardWorkout}</Button>
		<Button variant={ButtonVariant.quiet} onclick={() => (confirmingDiscard = false)}>
			{messages.training.keepWorkout}
		</Button>
	</Sheet>
{/if}

<style>
	.workout {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-8);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	textarea {
		min-height: var(--space-12);
		padding: var(--space-2) var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
		font-size: var(--font-size-body);
		resize: vertical;
	}
</style>
