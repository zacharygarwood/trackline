<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { FinishedWorkout } from '../domain/workout.ts';
	import type { TrainOverview } from './train-overview.svelte.ts';

	/** Props for the sheet shown after finishing, offering to save the workout as a template. */
	interface Props {
		/** The overview that keeps the templates. */
		overview: TrainOverview;
		/** The workout just finished. */
		workout: FinishedWorkout;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { overview, workout, onclose }: Props = $props();

	let open = $state(true);
	let name = $state('');
	let problem: string | undefined = $state();

	$effect(() => {
		if (!open) onclose();
	});

	async function save(): Promise<void> {
		problem = await overview.saveAsTemplate(workout.id, name);
		if (problem === undefined) open = false;
	}
</script>

<Sheet bind:open title={messages.training.workoutSaved}>
	<p>{messages.training.saveAsTemplatePrompt}</p>
	<label>
		<span>{messages.training.templateName}</span>
		<input type="text" autocomplete="off" bind:value={name} />
	</label>
	{#if problem !== undefined}
		<p role="alert">{problem}</p>
	{/if}
	<Button onclick={save}>{messages.training.saveTemplate}</Button>
	<Button variant={ButtonVariant.quiet} onclick={() => (open = false)}
		>{messages.training.notNow}</Button
	>
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
</style>
