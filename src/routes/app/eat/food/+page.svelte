<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonSize } from '#lib/design/button.constants.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { macrosForAmount, type Food } from '#lib/nutrition/domain/food.ts';
	import AmountStepper from '#lib/nutrition/ui/AmountStepper.svelte';
	import { amountLabel, unitName } from '#lib/nutrition/ui/food-portions.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import { formatMacroNumber } from '#lib/nutrition/ui/nutrition-format.ts';
	import { parseDecimal } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const MANY = 2;
	const toaster = getToaster();
	const foodHref = resolve(AppRoute.eat);
	let screen: FoodScreen | undefined = $state();
	let food: Food | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new FoodScreen(app.nutrition, app.clock);
		await next.load();
		const found = next.findFood(page.state.selected);
		if (found === undefined) {
			await goto(foodHref, { replaceState: true });
			return;
		}
		next.choose(found);
		screen = next;
		food = found;
	});

	function preview(chosen: Food, amount: string): string {
		const macros = macrosForAmount(chosen, parseDecimal(amount) ?? 0);
		return macros.ok
			? messages.food.preview(
					formatMacroNumber(macros.value.calories),
					formatMacroNumber(macros.value.protein)
				)
			: '';
	}

	async function add(ready: FoodScreen, chosen: Food): Promise<void> {
		const entry = await ready.addTyped(chosen);
		if (entry === undefined) return;
		toaster.show(
			messages.food.added(chosen.name, amountLabel(entry.amount, entry.unitSnapshot)),
			() => ready.remove(entry)
		);
		await goto(foodHref);
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.addFood)}
	backLabel={messages.shell.back(messages.navigation.addFood)}
	title={food?.name ?? ''}
/>

{#if screen !== undefined && food !== undefined}
	{@const ready = screen}
	{@const chosen = food}
	<AmountStepper
		bind:value={ready.amount}
		label={messages.food.amountOf(chosen.name, unitName(chosen.reference.unit, MANY))}
		unit={unitName(chosen.reference.unit, parseDecimal(ready.amount) ?? 0)}
		detail={preview(chosen, ready.amount)}
		onstep={(direction: number) => {
			ready.stepFoodAmount(chosen, direction);
		}}
	>
		{#snippet action()}
			<Button size={ButtonSize.tall} onclick={() => add(ready, chosen)}>{messages.food.add}</Button>
		{/snippet}
	</AmountStepper>
{/if}
