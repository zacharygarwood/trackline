<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { FoodLogEntry } from '#lib/nutrition/domain/food-log-entry.ts';
	import AmountStepper from '#lib/nutrition/ui/AmountStepper.svelte';
	import { amountText, unitName } from '#lib/nutrition/ui/food-portions.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import { formatMacroNumber } from '#lib/nutrition/ui/nutrition-format.ts';
	import { LocalDate } from '#lib/shared/local-date.ts';
	import { parseDecimal } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const MANY = 2;
	const toaster = getToaster();
	const day = page.state.day;
	const eatenHref = resolve(day === undefined ? AppRoute.eaten : AppRoute.pastDays);
	const backTitle = day === undefined ? messages.navigation.today : messages.navigation.pastDays;
	const selected = page.state.selected;
	let screen: FoodScreen | undefined = $state();
	const entry = $derived(screen?.findEntry(selected));
	let typed = $derived(entry === undefined ? '' : amountText(entry.amount));

	void getAppContext().then(async (app) => {
		const next = new FoodScreen(app.nutrition, app.clock);
		const date = day === undefined ? undefined : LocalDate.parse(day);
		if (date?.ok === true) next.date = date.value;
		await next.load();
		if (next.findEntry(selected) === undefined) {
			await goto(eatenHref, { replaceState: true });
			return;
		}
		screen = next;
	});

	async function remove(ready: FoodScreen, removed: FoodLogEntry): Promise<void> {
		await ready.remove(removed);
		toaster.show(messages.food.removed(removed.foodNameSnapshot), () => ready.restore(removed));
		await (day === undefined
			? goto(eatenHref)
			: goto(resolve(AppRoute.pastDay), { state: { day } }));
	}
</script>

<PageHeader
	backHref={eatenHref}
	backLabel={messages.shell.back(backTitle)}
	title={entry?.foodNameSnapshot ?? ''}
/>

{#if screen !== undefined && entry !== undefined}
	{@const ready = screen}
	{@const current = entry}
	<AmountStepper
		bind:value={typed}
		label={messages.food.amountOf(current.foodNameSnapshot, unitName(current.unitSnapshot, MANY))}
		unit={unitName(current.unitSnapshot, current.amount)}
		detail={messages.food.preview(
			formatMacroNumber(current.macrosSnapshot.calories),
			formatMacroNumber(current.macrosSnapshot.protein)
		)}
		onstep={(direction: number) => ready.stepEntry(current, direction)}
		onchange={() => ready.changeAmount(current, parseDecimal(typed) ?? 0)}
	>
		{#snippet action()}
			<button type="button" class="remove" onclick={() => remove(ready, current)}
				>{messages.food.remove}</button
			>
		{/snippet}
	</AmountStepper>
{/if}

<style>
	.remove {
		align-self: flex-start;
		height: var(--control-height);
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-danger);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
