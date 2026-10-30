<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import { parseDecimal } from '../../ui/format.ts';
	import type { FoodLogEntry } from '../domain/food-log-entry.ts';
	import AmountStepper from './AmountStepper.svelte';
	import { amountLabel, amountText, unitName } from './food-portions.ts';
	import { formatMacroNumber } from './nutrition-format.ts';

	/** Props for one food eaten today: tap to change how much, or remove it. */
	interface Props {
		entry: FoodLogEntry;
		open: boolean;
		ontoggle: () => void;
		onstep: (direction: number) => void;
		/** Called with a typed amount. */
		onchange: (amount: number) => void;
		onremove: () => void;
	}

	const { entry, open, ontoggle, onstep, onchange, onremove }: Props = $props();
	const MANY = 2;

	let typed = $derived(amountText(entry.amount));
	const unit = $derived(unitName(entry.unitSnapshot, entry.amount));
</script>

<li>
	<button
		type="button"
		class="entry"
		aria-expanded={open}
		aria-label={messages.food.entryLabel(entry.foodNameSnapshot, amountText(entry.amount), unit)}
		onclick={ontoggle}
	>
		<span class="name">{entry.foodNameSnapshot}</span>
		<span class="amount">{amountLabel(entry.amount, entry.unitSnapshot)}</span>
	</button>
	{#if open}
		<AmountStepper
			bind:value={typed}
			label={messages.food.amountOf(entry.foodNameSnapshot, unitName(entry.unitSnapshot, MANY))}
			{unit}
			detail={messages.food.preview(
				formatMacroNumber(entry.macrosSnapshot.calories),
				formatMacroNumber(entry.macrosSnapshot.protein)
			)}
			{onstep}
			onchange={() => {
				onchange(parseDecimal(typed) ?? 0);
			}}
		>
			{#snippet action()}
				<button type="button" class="remove" onclick={onremove}>{messages.food.remove}</button>
			{/snippet}
		</AmountStepper>
	{/if}
</li>

<style>
	li {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.entry {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--row-height);
		padding: 0 var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		text-align: left;
	}

	.entry:hover {
		background: var(--color-hover);
	}

	.name {
		flex: 1;
		min-width: 0;
		font-size: var(--font-size-18);
	}

	.amount {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.remove {
		height: var(--control-height);
		padding: 0 0 0 var(--space-3);
		border: none;
		background: transparent;
		color: var(--color-danger);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
