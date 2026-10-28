<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import { MACRO_KEYS } from './macro-key.constants.ts';
	import { MACRO_LABELS } from './nutrition-format.ts';
	import type { DailyGoalsEditor, GoalsForm } from './daily-goals-editor.svelte.ts';

	/** Props for the daily calorie and macro targets form. */
	interface Props {
		/** The editor holding today's goals. */
		editor: DailyGoalsEditor;
	}

	const { editor }: Props = $props();

	const fields = MACRO_KEYS.map((key) => ({ key, label: MACRO_LABELS[key] }));

	let form: GoalsForm = $state(untrack(() => editor.form));
	let status: string | undefined = $state();
</script>

<section>
	<h2>{messages.nutrition.dailyGoals}</h2>
	<div class="fields">
		{#each fields as field (field.key)}
			<label>
				<span>{field.label}</span>
				<input
					type="text"
					inputmode="decimal"
					bind:value={
						() => form[field.key], (value: string) => (form = { ...form, [field.key]: value })
					}
				/>
			</label>
		{/each}
	</div>
	<Button
		variant={ButtonVariant.secondary}
		onclick={async () => (status = await editor.save(form))}
	>
		{messages.nutrition.saveGoals}
	</Button>
	{#if status !== undefined}
		<p role="status">{status}</p>
	{/if}
</section>

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

	.fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--font-size-small);
	}

	input {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
		font-size: var(--font-size-body);
	}
</style>
