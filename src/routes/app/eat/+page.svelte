<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import Card from '#lib/design/Card.svelte';
	import Fab from '#lib/design/Fab.svelte';
	import Icon from '#lib/design/Icon.svelte';
	import IconButton from '#lib/design/IconButton.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { FoodLogEntry } from '#lib/nutrition/domain/food-log-entry.ts';
	import { MEAL_SLOTS, type MealSlot } from '#lib/nutrition/domain/meal-slot.constants.ts';
	import EntrySheet from '#lib/nutrition/ui/EntrySheet.svelte';
	import LogFoodSheet from '#lib/nutrition/ui/LogFoodSheet.svelte';
	import MacroProgress from '#lib/nutrition/ui/MacroProgress.svelte';
	import { NutritionDay } from '#lib/nutrition/ui/nutrition-day.svelte.ts';
	import { formatAmount, formatCalories, SLOT_LABELS } from '#lib/nutrition/ui/nutrition-format.ts';
	import SaveMealSheet from '#lib/nutrition/ui/SaveMealSheet.svelte';
	import { formatDate } from '#lib/ui/format.ts';

	const ONE_DAY = 1;

	let day: NutritionDay | undefined = $state();
	let logging = $state(false);
	let editing: FoodLogEntry | undefined = $state();
	let savingSlot: MealSlot | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new NutritionDay(app.nutrition, app.clock);
		await next.load();
		day = next;
	});

	const slotCalories = (entries: readonly FoodLogEntry[]) =>
		formatCalories(entries.reduce((total, entry) => total + entry.macrosSnapshot.calories, 0));
</script>

{#if day !== undefined}
	{@const ready = day}
	<div class="day-switcher" role="group" aria-label={messages.nutrition.day}>
		<button
			type="button"
			aria-label={messages.nutrition.previousDay}
			onclick={() => ready.moveBy(-ONE_DAY)}
		>
			<Icon name="back" />
		</button>
		<span>{formatDate(ready.date, ready.today)}</span>
		<button
			type="button"
			aria-label={messages.nutrition.nextDay}
			disabled={!ready.date.isBefore(ready.today)}
			onclick={() => ready.moveBy(ONE_DAY)}
		>
			<Icon name="forward" />
		</button>
	</div>
	<Card>
		<MacroProgress summary={ready.day.summary} />
	</Card>
	{#each MEAL_SLOTS as slot (slot)}
		{@const entries = ready.entriesIn(slot)}
		<Card title={SLOT_LABELS[slot]} flush>
			{#snippet trailing()}
				{#if entries.length > 0}
					<span class="total">
						{slotCalories(entries)}
						<IconButton
							label={messages.nutrition.saveSlotAsMeal(SLOT_LABELS[slot])}
							icon="more"
							onclick={() => (savingSlot = slot)}
						/>
					</span>
				{/if}
			{/snippet}
			{#if entries.length > 0}
				<ul>
					{#each entries as entry (entry.id)}
						{@const amount = formatAmount(entry.amount, entry.unitSnapshot)}
						{@const calories = formatCalories(entry.macrosSnapshot.calories)}
						<li>
							<button
								type="button"
								class="entry"
								aria-label={messages.nutrition.entry(entry.foodNameSnapshot, amount, calories)}
								onclick={() => (editing = entry)}
							>
								<span class="food">
									<span>{entry.foodNameSnapshot}</span>
									<span class="amount">{amount}</span>
								</span>
								<span class="calories">{calories}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</Card>
	{/each}
	<Fab label={messages.nutrition.logFood} onclick={() => (logging = true)} />

	{#if logging}
		<LogFoodSheet day={ready} onclose={() => (logging = false)} />
	{/if}
	{#if editing !== undefined}
		<EntrySheet day={ready} entry={editing} onclose={() => (editing = undefined)} />
	{/if}
	{#if savingSlot !== undefined}
		<SaveMealSheet
			day={ready}
			slot={savingSlot}
			label={SLOT_LABELS[savingSlot]}
			onclose={() => (savingSlot = undefined)}
		/>
	{/if}
{/if}

<style>
	.day-switcher {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 calc(-1 * var(--space-2));
		padding: var(--space-1) 0;
	}

	.day-switcher span {
		font-weight: var(--font-weight-semibold);
	}

	.day-switcher button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		background: transparent;
		color: var(--color-accent);
		cursor: pointer;
	}

	.day-switcher button:disabled {
		color: var(--color-text-muted);
		opacity: 0.4;
		cursor: default;
	}

	.total {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--tap-target);
		padding: var(--space-2) var(--space-4);
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}

	.food {
		display: flex;
		flex-direction: column;
	}

	.amount {
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
	}

	.calories {
		font-family: var(--font-mono);
		white-space: nowrap;
	}
</style>
