<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import NumberPad from '../../design/NumberPad.svelte';
	import SegmentedControl from '../../design/SegmentedControl.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { Food } from '../domain/food.ts';
	import { MEAL_SLOTS, type MealSlot } from '../domain/meal-slot.constants.ts';
	import FoodFormFields from './FoodFormFields.svelte';
	import type { FoodForm, NutritionDay } from './nutrition-day.svelte.ts';
	import { formatMacroLine, SLOT_LABELS } from './nutrition-format.ts';

	/** Props for the sheet that logs a food, a saved meal, or a new food. */
	interface Props {
		/** The day being logged. */
		day: NutritionDay;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { day, onclose }: Props = $props();

	const AMOUNT_LIMITS = { allowDecimal: true, maxIntegerDigits: 4, maxFractionDigits: 1 } as const;
	const EMPTY_FORM: FoodForm = {
		name: '',
		amount: '100',
		unit: 'g',
		calories: '',
		protein: '',
		carbs: '',
		fat: ''
	};
	const slots = MEAL_SLOTS.map((value) => ({ value, label: SLOT_LABELS[value] }));

	let open = $state(true);
	let slot: MealSlot = $state(untrack(() => day.suggestedSlot));
	let search = $state('');
	let chosen: Food | undefined = $state();
	let creating = $state(false);
	let form: FoodForm = $state(EMPTY_FORM);
	let amount = $state('');
	let selected = $state(true);
	let problem: string | undefined = $state();

	const matches = $derived(
		day.foods.filter((food) => food.name.toLowerCase().includes(search.trim().toLowerCase()))
	);
	const preview = $derived(chosen === undefined ? undefined : day.preview(chosen, amount));

	$effect(() => {
		if (!open) onclose();
	});

	async function choose(food: Food): Promise<void> {
		amount = await day.suggestedAmount(food);
		selected = true;
		problem = undefined;
		chosen = food;
	}

	async function create(): Promise<void> {
		const created = await day.createFood(form);
		if (typeof created === 'string') {
			problem = created;
			return;
		}
		creating = false;
		await choose(created);
	}

	async function log(food: Food): Promise<void> {
		problem = await day.log(food, amount, slot);
		if (problem === undefined) open = false;
	}

	async function logMeal(mealId: Parameters<NutritionDay['logMeal']>[0]): Promise<void> {
		await day.logMeal(mealId, slot);
		open = false;
	}
</script>

<Sheet
	bind:open
	title={chosen?.name ?? (creating ? messages.nutrition.newFood : messages.nutrition.logFood)}
>
	{#if chosen !== undefined}
		{@const food = chosen}
		<output class="reading" aria-live="polite">
			<span class="amount">{amount === '' ? '0' : amount}</span>
			<span class="unit">{food.reference.unit}</span>
		</output>
		<p class="preview">{preview === undefined ? '' : formatMacroLine(preview)}</p>
		{#if problem !== undefined}
			<p role="alert">{problem}</p>
		{/if}
		<NumberPad bind:value={amount} bind:selected limits={AMOUNT_LIMITS} />
		<Button onclick={() => log(food)}>{messages.nutrition.log}</Button>
	{:else if creating}
		<FoodFormFields bind:form />
		{#if problem !== undefined}
			<p role="alert">{problem}</p>
		{/if}
		<Button onclick={create}>{messages.nutrition.saveFood}</Button>
	{:else}
		<SegmentedControl label={messages.nutrition.meal} options={slots} bind:value={slot} />
		<input
			class="search"
			type="search"
			aria-label={messages.nutrition.search}
			placeholder={messages.nutrition.search}
			bind:value={search}
		/>
		{#if day.meals.length > 0 && search === ''}
			<section>
				<h3>{messages.nutrition.savedMeals}</h3>
				<ul>
					{#each day.meals as meal (meal.id)}
						<li><button type="button" onclick={() => logMeal(meal.id)}>{meal.name}</button></li>
					{/each}
				</ul>
			</section>
		{/if}
		<section>
			<h3>{messages.nutrition.recentFoods}</h3>
			{#if day.foods.length === 0}
				<p class="hint">{messages.nutrition.noFoods}</p>
			{/if}
			<ul>
				{#each matches as food (food.id)}
					<li><button type="button" onclick={() => choose(food)}>{food.name}</button></li>
				{/each}
			</ul>
		</section>
		<Button variant={ButtonVariant.secondary} onclick={() => (creating = true)}
			>{messages.nutrition.newFood}</Button
		>
	{/if}
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

	.unit,
	.preview,
	.hint {
		color: var(--color-text-muted);
		text-align: center;
	}

	.preview {
		min-height: var(--space-6);
		font-size: var(--font-size-small);
	}

	.search {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
	}

	h3 {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}

	ul {
		max-height: 30dvh;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		list-style: none;
	}

	li + li {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	li button {
		width: 100%;
		min-height: var(--tap-target);
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}
</style>
