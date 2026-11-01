<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import NavRow from '#lib/design/NavRow.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { amountLabel, amountText, unitName } from '#lib/nutrition/ui/food-portions.ts';
	import type { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import { formatMacroNumber } from '#lib/nutrition/ui/nutrition-format.ts';
	import { AppRoute } from '../app-route.constants.ts';

	/** Props for one day of the food log: its totals, then each entry. */
	interface Props {
		screen: FoodScreen;
		/** The day, as YYYY-MM-DD, when it is not today; entries open with it. */
		day?: string | undefined;
	}

	const { screen, day }: Props = $props();
</script>

<p class="totals">
	{messages.food.preview(
		formatMacroNumber(screen.day.summary.eaten.calories),
		formatMacroNumber(screen.day.summary.eaten.protein)
	)}
</p>
<ul class="rows" aria-label={messages.food.entries}>
	{#each screen.day.entries as entry (entry.id)}
		<li>
			<NavRow
				label={entry.foodNameSnapshot}
				value={amountLabel(entry.amount, entry.unitSnapshot)}
				ariaLabel={messages.food.entryLabel(
					entry.foodNameSnapshot,
					amountText(entry.amount),
					unitName(entry.unitSnapshot, entry.amount)
				)}
				onclick={() =>
					goto(resolve(AppRoute.eatenEntry), {
						state: day === undefined ? { selected: entry.id } : { selected: entry.id, day }
					})}
			/>
		</li>
	{/each}
</ul>
{#if screen.day.entries.length === 0}
	<p class="empty">{messages.food.nothingYet}</p>
{/if}

<style>
	.totals {
		margin-bottom: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}

	.rows {
		margin: 0 calc(-1 * var(--gutter));
		padding: 0 var(--gutter);
	}

	.empty {
		margin-top: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
