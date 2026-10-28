<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import { unitLabel } from '../../ui/format.ts';
	import type { WorkoutExercise } from '../domain/workout.ts';
	import SetRow from './SetRow.svelte';
	import { MAX_SET_WEIGHT, WEIGHT_STEP } from './weight-step.constants.ts';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for one exercise in the workout in progress. */
	interface Props {
		/** The session that owns the workout. */
		session: WorkoutSession;
		/** The exercise and its sets. */
		exercise: WorkoutExercise;
	}

	const { session, exercise }: Props = $props();

	const name = $derived(session.nameOf(exercise.exerciseId));
</script>

<section aria-label={name}>
	<h2>{name}</h2>
	<p class="hint">{session.hintFor(exercise.exerciseId)}</p>
	{#each exercise.sets as set, position (position)}
		<SetRow
			number={position + 1}
			entry={session.entryOf(set)}
			unit={unitLabel(session.unit)}
			weightStep={WEIGHT_STEP[session.unit]}
			maxWeight={MAX_SET_WEIGHT}
			onreps={(reps: number) =>
				void session.setReps({ exerciseId: exercise.exerciseId, position }, reps)}
			onweight={(weight: number) =>
				void session.setWeight({ exerciseId: exercise.exerciseId, position }, weight)}
			ontoggle={() => void session.toggleCompleted({ exerciseId: exercise.exerciseId, position })}
			onremove={() => void session.removeSet({ exerciseId: exercise.exerciseId, position })}
		/>
	{/each}
	<div class="actions">
		<Button variant={ButtonVariant.secondary} onclick={() => session.addSet(exercise.exerciseId)}>
			{messages.training.addSet}
		</Button>
		<Button
			variant={ButtonVariant.quiet}
			onclick={() => session.removeExercise(exercise.exerciseId)}
		>
			{messages.training.removeExercise(name)}
		</Button>
	</div>
</section>

<style>
	section {
		padding: var(--space-4) 0;
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	h2 {
		font-size: var(--font-size-body);
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
	}
</style>
