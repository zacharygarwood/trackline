<script lang="ts">
	import ActionButton from '#lib/design/ActionButton.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import Row from '#lib/design/Row.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import type { Entry } from '#lib/tracking/domain/entry.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import type { DisplayUnits } from '#lib/tracking/ui/display-units.ts';
	import { foodTotals } from '#lib/tracking/ui/food-totals.ts';
	import type { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { formatAmount } from '#lib/tracking/ui/value-format.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open } from '../open.ts';
	import EntryHistory from './EntryHistory.svelte';

	/** Props for a food tracker's page: today's totals, add food, what was eaten, and the foods. */
	interface Props {
		screen: TrackerScreen;
		tracker: Tracker;
		units: DisplayUnits;
		today: LocalDate;
	}

	const { screen, tracker, units, today }: Props = $props();
	const totals = $derived(foodTotals(tracker, screen.today));

	function nameOf(entry: Entry): string {
		const food = screen.subjects.find((subject) => subject.id === entry.subjectId);
		return food?.name ?? messages.tracking.food.quickEntry;
	}
</script>

<ul class="totals">
	{#each totals as { field, total } (field.key)}
		<li><Row label={field.label} value={formatAmount(field, total, units)} /></li>
	{/each}
</ul>

<div class="add">
	<ActionButton
		label={messages.tracking.food.add}
		icon="plus"
		onclick={() => open(AppRoute.addFood, { tracker: tracker.id })}
	/>
</div>

<EntryHistory
	{tracker}
	entries={screen.today.toReversed()}
	{units}
	{today}
	{nameOf}
	title={messages.tracking.food.today}
/>

<div class="library">
	<NavRow
		label={messages.tracking.library.foods}
		onclick={() => open(AppRoute.library, { tracker: tracker.id })}
	/>
</div>

<style>
	.add {
		margin-top: var(--space-6);
	}

	.library {
		margin-top: var(--space-8);
	}
</style>
