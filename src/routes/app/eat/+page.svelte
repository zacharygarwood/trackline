<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import { FieldEdges } from '#lib/design/button.constants.ts';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { FoodLogEntry } from '#lib/nutrition/domain/food-log-entry.ts';
	import type { Food } from '#lib/nutrition/domain/food.ts';
	import EatenRow from '#lib/nutrition/ui/EatenRow.svelte';
	import { amountLabel } from '#lib/nutrition/ui/food-portions.ts';
	import FoodRow from '#lib/nutrition/ui/FoodRow.svelte';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import MacroTotals from '#lib/nutrition/ui/MacroTotals.svelte';
	import NewFoodSection from '#lib/nutrition/ui/NewFoodSection.svelte';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { capitalized } from '#lib/training/ui/exercise-search.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';

	/** How long + turns into a check after adding, in milliseconds. */
	const ADDED_MILLISECONDS = 1400;

	const preferences = getPreferences();
	const toaster = getToaster();
	let screen: FoodScreen | undefined = $state();
	let searchInput: HTMLInputElement | undefined = $state();
	let justAdded: Food['id'] | undefined = $state();
	let addedTimer: ReturnType<typeof setTimeout> | undefined;

	void getAppContext().then(async (app) => {
		const next = new FoodScreen(app.nutrition, app.clock);
		await next.load();
		screen = next;
	});

	function confirm(ready: FoodScreen, food: Food, entry: FoodLogEntry | undefined): void {
		if (entry === undefined) return;
		clearTimeout(addedTimer);
		justAdded = food.id;
		addedTimer = setTimeout(() => (justAdded = undefined), ADDED_MILLISECONDS);
		toaster.show(
			messages.food.added(food.name, amountLabel(entry.amount, entry.unitSnapshot)),
			() => ready.remove(entry)
		);
	}

	async function add(ready: FoodScreen, food: Food, typed: boolean): Promise<void> {
		confirm(ready, food, typed ? await ready.addTyped(food) : await ready.add(food));
	}

	async function create(ready: FoodScreen): Promise<void> {
		const name = capitalized(ready.query);
		const entry = await ready.create(
			preferences.current.trackCarbsAndFat,
			preferences.current.newFoodUnit
		);
		const food = ready.foods.find((known) => known.name === name);
		if (food !== undefined) confirm(ready, food, entry);
		searchInput?.focus();
	}

	async function remove(ready: FoodScreen, entry: FoodLogEntry): Promise<void> {
		await ready.remove(entry);
		toaster.show(messages.food.removed(entry.foodNameSnapshot), () => ready.restore(entry));
	}
</script>

{#if screen !== undefined}
	{@const ready = screen}
	<section aria-label={messages.food.totals}>
		<MacroTotals
			summary={ready.day.summary}
			trackCarbsAndFat={preferences.current.trackCarbsAndFat}
			today={false}
		/>
	</section>

	<SearchField
		label={messages.food.search}
		edges={FieldEdges.top}
		bind:input={searchInput}
		bind:value={
			() => ready.query,
			(text: string) => {
				ready.search(text);
			}
		}
	/>

	<ul
		class="list"
		aria-label={ready.query.trim() === '' ? messages.food.recent : messages.food.results}
	>
		{#each ready.visibleFoods as food (food.id)}
			<FoodRow
				{food}
				open={ready.openFood === food.id}
				added={justAdded === food.id}
				bind:amount={ready.amount}
				ontoggle={() => {
					ready.toggleFood(food);
				}}
				onstep={(direction: number) => {
					ready.stepFoodAmount(food, direction);
				}}
				onadd={(typed: boolean) => add(ready, food, typed)}
			/>
		{/each}
	</ul>

	{#if ready.canCreate}
		<NewFoodSection
			name={capitalized(ready.query)}
			form={ready.form}
			trackCarbsAndFat={preferences.current.trackCarbsAndFat}
			defaultUnit={preferences.current.newFoodUnit}
			onadd={() => create(ready)}
		/>
	{/if}

	<h2>{messages.food.eatenToday}</h2>
	<ul class="list" aria-label={messages.food.eatenToday}>
		{#each ready.day.entries as entry (entry.id)}
			<EatenRow
				{entry}
				open={ready.openEntry === entry.id}
				ontoggle={() => {
					ready.toggleEntry(entry.id);
				}}
				onstep={(direction: number) => ready.stepEntry(entry, direction)}
				onchange={(amount: number) => ready.changeAmount(entry, amount)}
				onremove={() => remove(ready, entry)}
			/>
		{/each}
	</ul>
	{#if ready.day.entries.length === 0}
		<p class="empty">{messages.food.nothingYet}</p>
	{/if}
{/if}

<style>
	.list {
		margin: 0 calc(-1 * var(--gutter));
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	h2 {
		margin-top: var(--space-9);
		padding-bottom: var(--space-3);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.empty {
		margin-top: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
