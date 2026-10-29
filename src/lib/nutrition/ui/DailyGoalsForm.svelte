<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Card from '../../design/Card.svelte';
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

<Card title={messages.nutrition.dailyGoals}>
	<DailyGoalsFields bind:form />
	<Button variant={ButtonVariant.secondary} onclick={save}>{messages.nutrition.saveGoals}</Button>
	{#if status !== undefined}
		<p role="status">{status}</p>
	{/if}
</Card>
