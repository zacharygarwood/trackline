<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { MoveDirection, type WorkoutTemplate } from '../domain/workout-template.ts';
	import type { TrainOverview } from './train-overview.svelte.ts';

	/** Props for a template's rename, move, and delete options. */
	interface Props {
		/** The overview that owns the templates. */
		overview: TrainOverview;
		/** The template being changed. */
		template: WorkoutTemplate;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { overview, template, onclose }: Props = $props();

	let open = $state(true);
	let name = $state(untrack(() => template.name));
	let problem: string | undefined = $state();

	$effect(() => {
		if (!open) onclose();
	});

	async function rename(): Promise<void> {
		problem = await overview.rename(template.id, name);
		if (problem === undefined) open = false;
	}

	async function act(action: () => Promise<void>): Promise<void> {
		await action();
		open = false;
	}
</script>

<Sheet bind:open title={template.name}>
	<label>
		<span>{messages.training.templateName}</span>
		<input type="text" autocomplete="off" bind:value={name} />
	</label>
	{#if problem !== undefined}
		<p role="alert">{problem}</p>
	{/if}
	<Button onclick={rename}>{messages.training.rename}</Button>
	<div class="row">
		<Button
			variant={ButtonVariant.secondary}
			onclick={() => act(() => overview.move(template.id, MoveDirection.up))}
			>{messages.training.moveUp}</Button
		>
		<Button
			variant={ButtonVariant.secondary}
			onclick={() => act(() => overview.move(template.id, MoveDirection.down))}
			>{messages.training.moveDown}</Button
		>
	</div>
	<Button variant={ButtonVariant.quiet} onclick={() => act(() => overview.remove(template.id))}>
		{messages.training.deleteTemplate}
	</Button>
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

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}
</style>
