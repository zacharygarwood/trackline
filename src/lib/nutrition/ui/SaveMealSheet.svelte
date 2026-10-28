<script lang="ts">
	import Button from '../../design/Button.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { MealSlot } from '../domain/meal-slot.constants.ts';
	import type { NutritionDay } from './nutrition-day.svelte.ts';

	/** Props for naming a meal slot to log again later. */
	interface Props {
		/** The day whose slot is saved. */
		day: NutritionDay;
		/** The slot. */
		slot: MealSlot;
		/** The slot's label, for the heading. */
		label: string;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { day, slot, label, onclose }: Props = $props();

	let open = $state(true);
	let name = $state('');
	let problem: string | undefined = $state();

	$effect(() => {
		if (!open) onclose();
	});

	async function save(): Promise<void> {
		problem = await day.saveSlotAsMeal(slot, name);
		if (problem === undefined) open = false;
	}
</script>

<Sheet bind:open title={messages.nutrition.saveSlotAsMeal(label)}>
	<label>
		<span>{messages.nutrition.mealName}</span>
		<input type="text" autocomplete="off" bind:value={name} />
	</label>
	{#if problem !== undefined}
		<p role="alert">{problem}</p>
	{/if}
	<Button onclick={save}>{messages.nutrition.saveMeal}</Button>
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
