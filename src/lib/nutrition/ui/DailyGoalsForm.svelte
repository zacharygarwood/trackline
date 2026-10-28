<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import DailyGoalsFields from './DailyGoalsFields.svelte';
	import type { DailyGoalsEditor, GoalsForm } from './daily-goals-editor.svelte.ts';

	/** Props for Settings' daily calorie and macro targets. */
	interface Props {
		/** The editor holding today's goals. */
		editor: DailyGoalsEditor;
	}

	const { editor }: Props = $props();

	let form: GoalsForm = $state(untrack(() => editor.form));
	let status: string | undefined = $state();

	async function save(): Promise<void> {
		status = (await editor.save(form)) ?? messages.nutrition.goalsSaved;
	}
</script>

<section>
	<h2>{messages.nutrition.dailyGoals}</h2>
	<DailyGoalsFields bind:form />
	<Button variant={ButtonVariant.secondary} onclick={save}>{messages.nutrition.saveGoals}</Button>
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
</style>
