<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { FieldEdges } from '#lib/design/button.constants.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import { capitalized } from '#lib/training/ui/exercise-search.ts';
	import { getToaster, reloadOnUndo } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const toaster = getToaster();
	let screen: FoodScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new FoodScreen(app.nutrition, app.clock);
		await next.load();
		screen = next;
	});

	reloadOnUndo(toaster, () => screen?.load());
</script>

<PageHeader
	backHref={resolve(AppRoute.eat)}
	backLabel={messages.shell.back(messages.navigation.eat)}
	title={messages.navigation.addFood}
/>

{#if screen !== undefined}
	{@const ready = screen}
	<div>
		<SearchField
			label={messages.food.search}
			edges={FieldEdges.bottom}
			bind:value={
				() => ready.query,
				(text: string) => {
					ready.search(text);
				}
			}
		/>
		<ul aria-label={ready.query.trim() === '' ? messages.food.recent : messages.food.results}>
			{#each ready.visibleFoods as food (food.id)}
				<li>
					<NavRow
						label={food.name}
						ariaLabel={messages.food.chooseAmount(food.name)}
						onclick={() => goto(resolve(AppRoute.food), { state: { selected: food.id } })}
					/>
				</li>
			{/each}
		</ul>
		{#if ready.canCreate}
			<NavRow
				label={messages.food.createTitle(capitalized(ready.query))}
				onclick={() => goto(resolve(AppRoute.newFood), { state: { name: ready.query } })}
			/>
		{/if}
	</div>
{/if}
