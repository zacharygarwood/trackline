<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { FoodEditor } from '#lib/nutrition/ui/food-editor.svelte.ts';
	import NewFoodFields from '#lib/nutrition/ui/NewFoodFields.svelte';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const foodsHref = resolve(AppRoute.myFoods);
	let editor: FoodEditor | undefined = $state();
	let unit = $state('');

	void getAppContext().then(async (app) => {
		const food = (await app.nutrition.listFoods.execute()).find(
			(known) => known.id === page.state.selected
		);
		if (food === undefined) {
			await goto(foodsHref, { replaceState: true });
			return;
		}
		unit = food.reference.unit;
		editor = new FoodEditor(app.nutrition, food);
	});

	async function save(ready: FoodEditor): Promise<void> {
		const saved = await ready.save(preferences.current.trackCarbsAndFat);
		if (saved === undefined) return;
		toaster.show(messages.train.saved(saved.name));
		await goto(foodsHref);
	}

	async function remove(ready: FoodEditor): Promise<void> {
		await ready.delete();
		toaster.show(messages.food.deleted(ready.name));
		await goto(foodsHref);
	}
</script>

<PageHeader
	backHref={foodsHref}
	backLabel={messages.shell.back(messages.navigation.myFoods)}
	title={messages.navigation.editFood}
/>

{#if editor !== undefined}
	{@const ready = editor}
	<label for="food-name">{messages.food.name}</label>
	<input id="food-name" type="text" bind:value={ready.name} />
	<NewFoodFields
		form={ready.form}
		trackCarbsAndFat={preferences.current.trackCarbsAndFat}
		defaultUnit={unit}
		actionLabel={messages.train.save}
		onadd={() => save(ready)}
	/>
	<button type="button" class="delete" onclick={() => remove(ready)}>{messages.train.delete}</button
	>
{/if}

<style>
	label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	input {
		width: 100%;
		height: var(--button-height);
		margin-bottom: var(--space-6);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-semibold);
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	.delete {
		width: 100%;
		min-height: var(--row-height);
		margin-top: var(--space-2);
		border: none;
		background: transparent;
		color: var(--color-danger);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}
</style>
