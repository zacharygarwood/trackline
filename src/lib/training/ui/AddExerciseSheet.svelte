<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for the sheet that adds an exercise from the library or by a new name. */
	interface Props {
		/** The session to add the exercise to. */
		session: WorkoutSession;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { session, onclose }: Props = $props();

	let open = $state(true);
	let name = $state('');
	let problem: string | undefined = $state();

	const inWorkout = $derived(
		new Set(session.workout?.exercises.map((exercise) => exercise.exerciseId))
	);
	const matches = $derived(
		session.library.filter(
			(exercise) =>
				!inWorkout.has(exercise.id) &&
				exercise.name.toLowerCase().includes(name.trim().toLowerCase())
		)
	);
	const isNew = $derived(
		name.trim() !== '' &&
			!session.library.some((exercise) => exercise.name.toLowerCase() === name.trim().toLowerCase())
	);

	$effect(() => {
		if (!open) onclose();
	});

	async function add(exerciseName: string): Promise<void> {
		problem = await session.addExercise(exerciseName);
		if (problem === undefined) open = false;
	}
</script>

<Sheet bind:open title={messages.training.addExercise}>
	<label>
		<span>{messages.training.exerciseName}</span>
		<input type="text" autocomplete="off" bind:value={name} />
	</label>
	{#if problem !== undefined}
		<p role="alert">{problem}</p>
	{/if}
	{#if isNew}
		<Button onclick={() => add(name)}>{messages.training.addNamed(name.trim())}</Button>
	{/if}
	<ul>
		{#each matches as exercise (exercise.id)}
			<li>
				<Button variant={ButtonVariant.secondary} onclick={() => add(exercise.name)}
					>{exercise.name}</Button
				>
			</li>
		{/each}
	</ul>
</Sheet>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	input {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
