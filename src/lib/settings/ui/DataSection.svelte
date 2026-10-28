<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { DataPanel } from './data-panel.svelte.ts';

	/** Props for Settings' backup, restore, and delete-all section. */
	interface Props {
		/** The view model behind the section. */
		panel: DataPanel;
		/** Reloads the app after its data was replaced or erased. */
		onreplaced: () => void;
	}

	const { panel, onreplaced }: Props = $props();

	let picker: HTMLInputElement | undefined = $state();
	let restoreOpen = $state(false);
	let deleteOpen = $state(false);
	let deleteSummary = $state('');
	let typedConfirmation = $state('');

	const canDelete = $derived(
		typedConfirmation.trim().toLowerCase() === messages.settings.deleteConfirmWord
	);

	async function choose(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
		const file = event.currentTarget.files?.item(0);
		if (file === null || file === undefined) return;
		await panel.choose(new Uint8Array(await file.arrayBuffer()));
		restoreOpen = panel.pendingRestore !== undefined;
	}

	async function restore(): Promise<void> {
		if (await panel.restore()) onreplaced();
		restoreOpen = false;
	}

	async function openDelete(): Promise<void> {
		deleteSummary = await panel.deletionSummary();
		typedConfirmation = '';
		deleteOpen = true;
	}

	async function deleteAll(): Promise<void> {
		await panel.deleteAll();
		onreplaced();
	}
</script>

<section>
	<h2>{messages.settings.backup}</h2>
	<p>{messages.settings.backupExplainer}</p>
	<p class="status">{panel.statusText}</p>
	<Button onclick={() => panel.export()}>{messages.settings.exportBackup}</Button>
	<Button variant={ButtonVariant.secondary} onclick={() => picker?.click()}>
		{messages.settings.restoreBackup}
	</Button>
	<input
		bind:this={picker}
		class="picker"
		type="file"
		accept=".zip,application/zip"
		aria-label={messages.settings.restoreBackup}
		onchange={choose}
	/>
	{#if panel.problem !== undefined}
		<p role="alert">{panel.problem}</p>
	{/if}
</section>

<section>
	<h2>{messages.settings.dangerZone}</h2>
	<Button variant={ButtonVariant.quiet} onclick={openDelete}>{messages.settings.deleteAll}</Button>
</section>

{#if restoreOpen && panel.pendingRestore !== undefined}
	<Sheet bind:open={restoreOpen} title={messages.settings.restoreTitle}>
		<p>{panel.pendingRestore.summary}</p>
		<Button onclick={restore}>{messages.settings.restoreConfirm}</Button>
		<Button
			variant={ButtonVariant.quiet}
			onclick={() => {
				panel.cancelRestore();
				restoreOpen = false;
			}}>{messages.settings.cancel}</Button
		>
	</Sheet>
{/if}

{#if deleteOpen}
	<Sheet bind:open={deleteOpen} title={messages.settings.deleteTitle}>
		<p>{deleteSummary}</p>
		<label>
			<span>{messages.settings.deletePrompt}</span>
			<input type="text" autocomplete="off" autocapitalize="none" bind:value={typedConfirmation} />
		</label>
		<Button disabled={!canDelete} onclick={deleteAll}>{messages.settings.deleteConfirm}</Button>
	</Sheet>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--space-3);
	}

	h2 {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}

	.status {
		color: var(--color-text-muted);
	}

	.picker {
		display: none;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	label input {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
	}
</style>
