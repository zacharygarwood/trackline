<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../../design/Button.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { Pose } from '../domain/pose.constants.ts';
	import type { PhotoGallery } from './photo-gallery.svelte.ts';
	import { POSE_LABELS, POSES } from './pose-labels.ts';

	/** Props for choosing a photo and the sheet that tags it. */
	interface Props {
		gallery: PhotoGallery;
		/** The control that starts it, given the function that opens the photo picker. */
		trigger: Snippet<[() => void]>;
	}

	const { gallery, trigger }: Props = $props();

	let picker: HTMLInputElement | undefined = $state();
	let image: Uint8Array | undefined = $state();
	let open = $state(false);
	let date = $state('');
	let problem: string | undefined = $state();
	let saving = $state(false);

	async function choose(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
		const input = event.currentTarget;
		const file = input.files?.item(0);
		input.value = '';
		if (file === null || file === undefined) return;
		image = new Uint8Array(await file.arrayBuffer());
		date = gallery.today.toString();
		problem = undefined;
		open = true;
	}

	async function save(pose: Pose): Promise<void> {
		if (image === undefined) return;
		saving = true;
		problem = await gallery.add(image, date, pose);
		saving = false;
		if (problem === undefined) open = false;
	}
</script>

{@render trigger(() => picker?.click())}
<input bind:this={picker} type="file" accept="image/*" hidden onchange={choose} />

<Sheet bind:open title={messages.body.addPhoto}>
	<label class="date">
		<span>{messages.body.photoDate}</span>
		<input type="date" bind:value={date} max={gallery.today.toString()} />
	</label>
	<fieldset>
		<legend>{messages.body.choosePose}</legend>
		<div class="poses">
			{#each POSES as pose (pose)}
				<Button disabled={saving} onclick={() => save(pose)}>{POSE_LABELS[pose]}</Button>
			{/each}
		</div>
	</fieldset>
	{#if problem !== undefined}
		<p class="problem" role="alert">{problem}</p>
	{/if}
</Sheet>

<style>
	.date {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	input[type='date'] {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		font-size: var(--font-size-body);
	}

	fieldset {
		margin: 0;
		padding: 0;
		border: none;
	}

	legend {
		margin-bottom: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.poses {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2);
	}

	.problem {
		color: var(--color-text);
	}
</style>
