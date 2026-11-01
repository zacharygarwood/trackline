<script lang="ts">
	import ActionButton from '#lib/design/ActionButton.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import type { DisplayUnits } from '#lib/tracking/ui/display-units.ts';
	import { isOneTap, type TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open } from '../open.ts';
	import EntryHistory from './EntryHistory.svelte';

	/** Props for a logged tracker's page: its main action and its history. */
	interface Props {
		screen: TrackerScreen;
		tracker: Tracker;
		units: DisplayUnits;
		today: LocalDate;
	}

	const { screen, tracker, units, today }: Props = $props();
	const toaster = getToaster();

	async function checkToday(): Promise<void> {
		const entry = await screen.check();
		if (entry === undefined) return;
		toaster.show(messages.tracking.page.logged(tracker.name), async () => {
			await screen.remove(entry);
		});
	}
</script>

{#if isOneTap(tracker)}
	{#if !screen.checkedToday()}
		<ActionButton label={messages.tracking.inputs.done} icon="check" onclick={checkToday} />
	{:else}
		<p class="done">{messages.tracking.inputs.done}</p>
	{/if}
{:else}
	<ActionButton
		label={messages.tracking.page.log}
		icon="plus"
		onclick={() => open(AppRoute.log, { tracker: tracker.id })}
	/>
{/if}

<EntryHistory {tracker} entries={screen.entries} {units} {today} />

<style>
	.done {
		display: flex;
		align-items: center;
		height: var(--button-height);
		color: var(--color-accent);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}
</style>
