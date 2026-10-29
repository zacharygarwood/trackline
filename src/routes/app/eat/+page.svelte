<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import Card from '#lib/design/Card.svelte';
	import Fab from '#lib/design/Fab.svelte';
	import Icon from '#lib/design/Icon.svelte';
	import IconButton from '#lib/design/IconButton.svelte';
	import Row from '#lib/design/Row.svelte';
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
		<Card title={SLOT_LABELS[slot]}>
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
			{#each entries as entry (entry.id)}
				{@const amount = formatAmount(entry.amount, entry.unitSnapshot)}
				{@const calories = formatCalories(entry.macrosSnapshot.calories)}
				<Row
					label={entry.foodNameSnapshot}
					detail={amount}
					value={calories}
					ariaLabel={messages.nutrition.entry(entry.foodNameSnapshot, amount, calories)}
					onclick={() => (editing = entry)}
				/>
			{/each}
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
		min-height: var(--row-height);
		margin: 0 calc(-1 * var(--space-4));
		padding: 0 calc(var(--space-4) + (var(--icon-size) - var(--tap-target)) / 2);
		border-bottom: var(--border-hairline) solid var(--color-divider);
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
		gap: var(--space-2);
	}
</style>
