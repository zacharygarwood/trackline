<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { FieldEdges } from '#lib/design/button.constants.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { Food } from '#lib/nutrition/domain/food.ts';
	import { amountLabel } from '#lib/nutrition/ui/food-portions.ts';
	import { formatMacroNumber } from '#lib/nutrition/ui/nutrition-format.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	let foods: readonly Food[] | undefined = $state();
	let query = $state('');

	void getAppContext().then(async (app) => {
		foods = await app.nutrition.listFoods.execute();
	});
</script>

<PageHeader
	backHref={resolve(AppRoute.eat)}
	backLabel={messages.shell.back(messages.navigation.eat)}
	title={messages.navigation.myFoods}
/>

{#if foods !== undefined}
	{@const typed = query.trim().toLowerCase()}
	<SearchField label={messages.food.search} edges={FieldEdges.bottom} bind:value={query} />
	<ul aria-label={messages.navigation.myFoods}>
		{#each foods
			.filter((food) => food.name.toLowerCase().includes(typed))
			.toSorted((a, b) => a.name.localeCompare(b.name)) as food (food.id)}
			<li>
				<NavRow
					label={food.name}
					value={messages.food.per100(
						formatMacroNumber(food.macrosPerReference.calories),
						amountLabel(food.reference.amount, food.reference.unit)
					)}
					onclick={() => goto(resolve(AppRoute.editFood), { state: { selected: food.id } })}
				/>
			</li>
		{/each}
	</ul>
	{#if foods.length === 0}
		<p class="empty">{messages.food.noFoods}</p>
	{/if}
{/if}

<style>
	.empty {
		margin-top: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
