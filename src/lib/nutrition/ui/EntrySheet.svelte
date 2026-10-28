<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import NumberPad from '../../design/NumberPad.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { FoodLogEntry } from '../domain/food-log-entry.ts';
	import type { NutritionDay } from './nutrition-day.svelte.ts';

	/** Props for adjusting or removing a logged food. */
	interface Props {
		/** The day that holds the entry. */
		day: NutritionDay;
		/** The entry. */
		entry: FoodLogEntry;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { day, entry, onclose }: Props = $props();

	const AMOUNT_LIMITS = { allowDecimal: true, maxIntegerDigits: 4, maxFractionDigits: 1 } as const;

	let open = $state(true);
	let amount = $state(untrack(() => String(entry.amount)));
	let selected = $state(true);
	let problem: string | undefined = $state();

	$effect(() => {
		if (!open) onclose();
	});

	async function save(): Promise<void> {
		problem = await day.changeAmount(entry.id, amount);
		if (problem === undefined) open = false;
	}

	async function remove(): Promise<void> {
		await day.remove(entry.id);
		open = false;
	}
</script>

<Sheet bind:open title={entry.foodNameSnapshot}>
	<output class="reading" aria-live="polite">
		<span class="amount">{amount === '' ? '0' : amount}</span>
		<span class="unit">{entry.unitSnapshot}</span>
	</output>
	{#if problem !== undefined}
		<p role="alert">{problem}</p>
	{/if}
	<NumberPad bind:value={amount} bind:selected limits={AMOUNT_LIMITS} />
	<Button onclick={save}>{messages.nutrition.saveAmount}</Button>
	<Button variant={ButtonVariant.quiet} onclick={remove}>{messages.nutrition.deleteEntry}</Button>
</Sheet>

<style>
	.reading {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: var(--space-2);
	}

	.amount {
		font-size: var(--font-size-display);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.unit {
		color: var(--color-text-muted);
	}
</style>
