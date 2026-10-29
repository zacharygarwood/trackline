<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import Card from '#lib/design/Card.svelte';
	import Icon from '#lib/design/Icon.svelte';
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
	<div class="eat">
		<Button onclick={() => (logging = true)}>{messages.nutrition.logFood}</Button>
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
					<span>{entries.length === 0 ? '' : slotCalories(entries)}</span>
				{/snippet}
				{#if entries.length === 0}
					<p class="empty">{messages.nutrition.nothingLogged}</p>
				{:else}
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
									<span>{entry.foodNameSnapshot}</span>
									<span class="detail">{messages.nutrition.entryDetail(amount, calories)}</span>
								</button>
							</li>
						{/each}
					</ul>
					<div class="save">
						<Button variant={ButtonVariant.quiet} onclick={() => (savingSlot = slot)}>
							{messages.nutrition.saveSlotAsMeal(SLOT_LABELS[slot])}
						</Button>
					</div>
				{/if}
			</Card>
		{/each}
	</div>

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
	.eat {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-bottom: var(--space-8);
	}

	.day-switcher {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.day-switcher button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-medium);
		background: var(--color-card);
		cursor: pointer;
	}

	.day-switcher span {
		font-weight: var(--font-weight-semibold);
	}

	.day-switcher button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.detail,
	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.empty {
		padding: 0 var(--space-4) var(--space-3);
	}

	.save {
		padding: 0 var(--space-2) var(--space-2);
	}

	li + li {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.entry {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		min-height: var(--tap-target);
		padding: var(--space-2) var(--space-4);
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}
</style>
