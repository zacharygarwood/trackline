<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Card from '../../design/Card.svelte';
	import AddRow from '../../design/AddRow.svelte';
	import IconButton from '../../design/IconButton.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { unitLabel } from '../../ui/format.ts';
	import type { WorkoutExercise } from '../domain/workout.ts';
	import SetRow from './SetRow.svelte';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for one exercise in the workout in progress, as a table of sets. */
	interface Props {
		/** The session that owns the workout. */
		session: WorkoutSession;
		/** The exercise and its sets. */
		exercise: WorkoutExercise;
	}

	const { session, exercise }: Props = $props();

	const name = $derived(session.nameOf(exercise.exerciseId));
	const hint = $derived(session.hintFor(exercise.exerciseId));
	const unit = $derived(unitLabel(session.unit));

	let options = $state(false);
</script>

<Card title={name}>
	{#snippet trailing()}
		<IconButton
			label={messages.training.exerciseOptions(name)}
			icon="more"
			onclick={() => (options = true)}
		/>
	{/snippet}
	{#if hint !== undefined}
		<p class="hint">{hint}</p>
	{/if}
	<div class="sets">
		<div class="columns" aria-hidden="true">
			<span>{messages.training.setColumn}</span>
			<span>{unit}</span>
			<span>{messages.training.reps}</span>
		</div>
		{#each exercise.sets as set, position (position)}
			<SetRow
				number={position + 1}
				entry={session.entryOf(set)}
				{unit}
				onreps={(reps: number) =>
					void session.setReps({ exerciseId: exercise.exerciseId, position }, reps)}
				onweight={(weight: number) =>
					void session.setWeight({ exerciseId: exercise.exerciseId, position }, weight)}
				ontoggle={() => void session.toggleCompleted({ exerciseId: exercise.exerciseId, position })}
				onremove={() => void session.removeSet({ exerciseId: exercise.exerciseId, position })}
			/>
		{/each}
	</div>
	<AddRow label={messages.training.addSet} onclick={() => session.addSet(exercise.exerciseId)} />
</Card>

{#if options}
	<Sheet bind:open={options} title={name}>
		<Button
			variant={ButtonVariant.secondary}
			onclick={() => {
				options = false;
				void session.removeExercise(exercise.exerciseId);
			}}
		>
			{messages.training.removeExercise(name)}
		</Button>
	</Sheet>
{/if}

<style>
	.hint {
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
	}

	.columns {
		display: grid;
		grid-template-columns: var(--space-6) 1fr 1fr calc(var(--tap-target) * 2 + var(--space-2));
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-label);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-label);
		text-align: center;
		text-transform: uppercase;
	}
</style>
