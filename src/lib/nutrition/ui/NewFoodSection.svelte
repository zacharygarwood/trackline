<script lang="ts">
	import Button from '../../design/Button.svelte';
	import Choice from '../../design/Choice.svelte';
	import { numberText, numberValue } from '../../design/number-text.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import { FOOD_UNITS, FoodUnit } from '../../shared/food-unit.constants.ts';
	import { CALORIES_AND_PROTEIN, TRACKED_MACRO_KEYS } from './macro-key.constants.ts';
	import { caloriesFrom, type NewFoodForm } from './new-food-form.svelte.ts';
	import { formatMacroNumber } from './nutrition-format.ts';

	/** Props for the inline form that adds a searched name as a new food. */
	interface Props {
		/** The new food's name. */
		name: string;
		form: NewFoodForm;
		/** Whether to ask for protein, carbs, and fat instead of calories and protein. */
		trackCarbsAndFat: boolean;
		/** The unit the form starts on. */
		defaultUnit: string;
		onadd: () => void;
	}

	const { name, form, trackCarbsAndFat, defaultUnit, onadd }: Props = $props();
	const id = $props.id();
	const GRAMS_PLACEHOLDER = 100;

	const unit = $derived(form.unitOr(defaultUnit));
	const LABELS = {
		calories: messages.food.calories,
		protein: messages.food.proteinGrams,
		carbs: messages.food.carbsGrams,
		fat: messages.food.fatGrams
	};
	const fields = $derived(trackCarbsAndFat ? TRACKED_MACRO_KEYS : CALORIES_AND_PROTEIN);
</script>

<section class="new-food" aria-labelledby="{id}-title">
	<h2 id="{id}-title">{messages.food.createTitle(name)}</h2>
	<div class="per">
		<p id="{id}-per" class="label">{messages.food.per}</p>
		<div class="per-row">
			<label class="visually-hidden" for="{id}-base">{messages.food.amount}</label>
			<input
				id="{id}-base"
				class="base"
				type="number"
				inputmode="decimal"
				min="0"
				placeholder={String(unit === FoodUnit.g ? GRAMS_PLACEHOLDER : 1)}
				bind:value={
					() => numberValue(form.base), (typed: number | null) => (form.base = numberText(typed))
				}
			/>
			<div class="units" role="group" aria-labelledby="{id}-per">
				{#each FOOD_UNITS as choice (choice)}
					<Choice joined pressed={choice === unit} onclick={() => (form.unit = choice)}
						>{choice}</Choice
					>
				{/each}
			</div>
		</div>
	</div>
	<div class="macros" class:three={trackCarbsAndFat}>
		{#each fields as field (field)}
			<label
				>{LABELS[field]}<input
					type="number"
					inputmode="decimal"
					min="0"
					placeholder="0"
					bind:value={
						() => numberValue(form[field]),
						(typed: number | null) => (form[field] = numberText(typed))
					}
				/></label
			>
		{/each}
	</div>
	{#if trackCarbsAndFat}
		<p class="computed">
			<strong>{formatMacroNumber(caloriesFrom(form))}</strong>
			{messages.food.computedCalories}
		</p>
	{/if}
	<Button onclick={onadd}>{messages.food.add}</Button>
</section>

<style>
	.new-food {
		display: flex;
		flex-direction: column;
		gap: var(--gap-18);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-5) var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
		animation: rise var(--duration-sheet) ease-out;
	}

	h2 {
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-semibold);
	}

	.per {
		display: flex;
		flex-direction: column;
		gap: var(--gap-10);
	}

	.label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.per-row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
	}

	.units {
		display: flex;
		flex-wrap: wrap;
	}

	input {
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-weight: var(--font-weight-bold);
		font-variant-numeric: tabular-nums;
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	.base {
		width: var(--food-base-width);
		height: var(--tap-target);
		font-size: var(--font-size-22);
	}

	.macros {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.macros.three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.macros label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.macros input {
		width: 100%;
		height: var(--field-height);
		font-size: var(--font-size-30);
		letter-spacing: var(--letter-spacing-title);
	}

	.computed {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.computed strong {
		color: var(--color-text);
		font-weight: var(--font-weight-semibold);
	}
</style>
