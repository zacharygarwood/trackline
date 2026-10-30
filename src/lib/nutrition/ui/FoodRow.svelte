<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonSize } from '../../design/button.constants.ts';
	import Icon from '../../design/Icon.svelte';
	import { IconWeight } from '../../design/icon.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import { parseDecimal } from '../../ui/format.ts';
	import { macrosForAmount, type Food } from '../domain/food.ts';
	import AmountStepper from './AmountStepper.svelte';
	import { baseLabel, unitName } from './food-portions.ts';
	import { formatMacroNumber } from './nutrition-format.ts';

	/** Props for one food in the search list: tap to choose an amount, + to add its usual portion. */
	interface Props {
		food: Food;
		/** Whether its amount stepper is open. */
		open: boolean;
		/** Whether it was just added, which shows a check for a moment. */
		added: boolean;
		/** The typed amount while open; bind to it. */
		amount: string;
		ontoggle: () => void;
		onstep: (direction: number) => void;
		/** Adds the usual portion, or the typed amount when `typed`. */
		onadd: (typed: boolean) => void;
	}

	let { food, open, added, amount = $bindable(), ontoggle, onstep, onadd }: Props = $props();
	const MANY = 2;

	const base = $derived(baseLabel(food.reference));
	const typed = $derived(parseDecimal(amount) ?? 0);
	const preview = $derived.by(() => {
		const macros = macrosForAmount(food, typed);
		return macros.ok
			? messages.food.preview(
					formatMacroNumber(macros.value.calories),
					formatMacroNumber(macros.value.protein)
				)
			: '';
	});
</script>

<li>
	<div class="food">
		<button
			type="button"
			class="choose"
			aria-expanded={open}
			aria-label={messages.food.chooseAmount(food.name)}
			onclick={ontoggle}
		>
			<span class="name">{food.name}</span>
			<span class="base">{base}</span>
		</button>
		<button
			type="button"
			class="add"
			class:added
			aria-label={messages.food.addBase(
				base === ''
					? messages.nutrition.amountWithUnit('1', unitName(food.reference.unit, 1))
					: base,
				food.name
			)}
			onclick={() => {
				onadd(false);
			}}
		>
			{#if added}
				<Icon name="check" weight={IconWeight.heavy} />
			{:else}
				<Icon name="plus" weight={IconWeight.bold} />
			{/if}
		</button>
	</div>
	{#if open}
		<AmountStepper
			bind:value={amount}
			label={messages.food.amountOf(food.name, unitName(food.reference.unit, MANY))}
			unit={unitName(food.reference.unit, typed)}
			detail={preview}
			{onstep}
		>
			{#snippet action()}
				<Button
					size={ButtonSize.compact}
					onclick={() => {
						onadd(true);
					}}>{messages.food.add}</Button
				>
			{/snippet}
		</AmountStepper>
	{/if}
</li>

<style>
	li {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.food {
		display: flex;
		align-items: center;
	}

	.choose {
		display: flex;
		flex: 1;
		align-items: center;
		gap: var(--gap-10);
		min-width: 0;
		min-height: var(--row-height-tall);
		padding: 0 var(--space-3) 0 var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		text-align: left;
	}

	.choose:hover {
		background: var(--color-hover);
	}

	.name {
		flex: 1;
		min-width: 0;
		font-size: var(--font-size-18);
	}

	.base {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.add {
		display: grid;
		flex: none;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		margin-right: var(--gutter);
		padding: 0;
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		transition: background var(--duration-quick) ease;
		--icon-size: var(--icon-size-small);
	}

	.add.added {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
</style>
