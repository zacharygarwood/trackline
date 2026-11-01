<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import Choice from '#lib/design/Choice.svelte';
	import Icon from '#lib/design/Icon.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { Measure } from '#lib/trackers/domain/tracker.constants.ts';
	import { MAX_RATING, type Tracker, type TrackerEntry } from '#lib/trackers/domain/tracker.ts';
	import {
		formatTrackerNumber,
		goalText,
		unitOf,
		valueText
	} from '#lib/trackers/ui/tracker-format.ts';
	import { TrackerLog } from '#lib/trackers/ui/tracker-log.svelte.ts';
	import { formatDate, parseDecimal } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import TrackerField from '../TrackerField.svelte';

	const preferences = getPreferences();
	const toaster = getToaster();
	const homeHref = resolve(AppRoute.today);
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	const RATINGS = Array.from({ length: MAX_RATING }, (_, index) => index + 1);
	let log: TrackerLog | undefined = $state();
	let typed = $state('');

	void getAppContext().then(async (app) => {
		const next = new TrackerLog(app.trackers, app.clock, preferences.weekStart);
		if (!(await next.load(page.state.selected))) {
			await goto(homeHref, { replaceState: true });
			return;
		}
		log = next;
	});

	function entryText(tracker: Tracker, entry: TrackerEntry): string {
		if (tracker.measure === Measure.done) return messages.trackers.doneToday;
		const unit = unitOf(tracker, units);
		const value = formatTrackerNumber(entry.value);
		return unit === '' ? value : messages.nutrition.amountWithUnit(value, unit);
	}

	async function add(ready: TrackerLog, tracker: Tracker, value: number): Promise<void> {
		const entry = await ready.log(value);
		if (entry === undefined) return;
		typed = '';
		toaster.show(messages.trackers.logged(tracker.name, entryText(tracker, entry)), async () => {
			await ready.remove(entry);
		});
	}

	async function remove(ready: TrackerLog, entry: TrackerEntry): Promise<void> {
		toaster.show(messages.trackers.removed, await ready.remove(entry));
	}
</script>

<PageHeader
	backHref={homeHref}
	backLabel={messages.shell.back(messages.navigation.home)}
	title={log?.tracker?.name ?? ''}
/>

{#if log?.tracker !== undefined}
	{@const ready = log}
	{@const tracker = log.tracker}
	<p class="now">
		<span class="value">{valueText(tracker, ready.value, units)}</span>
		<span class="goal">{goalText(tracker, units)}</span>
	</p>

	{#if tracker.measure === Measure.rating}
		<div class="ratings" role="group" aria-label={messages.trackers.log}>
			{#each RATINGS as rating (rating)}
				<Choice
					joined
					pressed={false}
					ariaLabel={messages.trackers.rate(rating)}
					onclick={() => add(ready, tracker, rating)}>{rating}</Choice
				>
			{/each}
		</div>
	{:else if tracker.measure === Measure.done}
		{#if ready.loggedToday}
			<p class="done">{messages.trackers.doneToday}</p>
		{:else}
			<div class="action">
				<Button onclick={() => add(ready, tracker, 1)}>{messages.trackers.markDone}</Button>
			</div>
		{/if}
	{:else}
		<TrackerField
			id="tracker-entry"
			label={unitOf(tracker, units) === '' ? messages.trackers.log : unitOf(tracker, units)}
			numeric
			bind:value={typed}
		/>
		<div class="action">
			<Button onclick={() => add(ready, tracker, parseDecimal(typed) ?? 0)}
				>{messages.trackers.log}</Button
			>
		</div>
	{/if}

	<h2 id="tracker-history">{messages.trackers.history}</h2>
	{#if ready.entries.length === 0}
		<p class="empty">{messages.trackers.nothingLogged}</p>
	{:else}
		<ul aria-labelledby="tracker-history">
			{#each ready.entries as entry (entry.id)}
				{@const day = formatDate(entry.date, ready.today)}
				<li>
					<span>{day}</span>
					<span class="amount">{entryText(tracker, entry)}</span>
					<button
						type="button"
						aria-label={messages.trackers.removeEntry(day)}
						onclick={() => remove(ready, entry)}><Icon name="close" /></button
					>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="edit">
		<NavRow
			label={messages.trackers.edit}
			onclick={() => goto(resolve(AppRoute.tracker), { state: { selected: tracker.id } })}
		/>
	</div>
{/if}

<style>
	.now {
		display: flex;
		align-items: baseline;
		gap: var(--chip-gap);
		margin-bottom: var(--space-5);
	}

	.value {
		font-size: var(--font-size-34);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-title);
	}

	.goal,
	.empty,
	.done {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}

	.ratings {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
	}

	.action {
		display: grid;
		margin-top: var(--space-4);
	}

	h2 {
		margin: var(--space-8) 0 var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--row-height);
		border-bottom: var(--border-hairline) solid var(--color-divider);
		font-size: var(--font-size-17);
	}

	.amount {
		margin-left: auto;
		color: var(--color-text-muted);
	}

	li button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		--icon-size: var(--icon-size-small);
	}

	.edit {
		margin-top: var(--space-6);
	}
</style>
