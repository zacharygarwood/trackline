<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { amountLabel } from '#lib/nutrition/ui/food-portions.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import NewFoodFields from '#lib/nutrition/ui/NewFoodFields.svelte';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { capitalized } from '#lib/training/ui/exercise-search.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const foodHref = resolve(AppRoute.eat);
	const name = page.state.name ?? '';
	let screen: FoodScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		if (name.trim() === '') {
			await goto(foodHref, { replaceState: true });
			return;
		}
		const next = new FoodScreen(app.nutrition, app.clock);
		await next.load();
		next.search(name);
		screen = next;
	});

	async function create(ready: FoodScreen): Promise<void> {
		const entry = await ready.create(
			preferences.current.trackCarbsAndFat,
			preferences.current.newFoodUnit
		);
		if (entry === undefined) return;
		toaster.show(
			messages.food.added(entry.foodNameSnapshot, amountLabel(entry.amount, entry.unitSnapshot)),
			() => ready.remove(entry)
		);
		await goto(foodHref);
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.addFood)}
	backLabel={messages.shell.back(messages.navigation.addFood)}
	title={messages.food.createTitle(capitalized(name))}
/>

{#if screen !== undefined}
	{@const ready = screen}
	<NewFoodFields
		form={ready.form}
		trackCarbsAndFat={preferences.current.trackCarbsAndFat}
		defaultUnit={preferences.current.newFoodUnit}
		onadd={() => create(ready)}
	/>
{/if}
