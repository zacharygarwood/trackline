<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import ActionButton from '#lib/design/ActionButton.svelte';
	import Icon from '#lib/design/Icon.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { TrackerMove } from '#lib/trackers/application/arrange-trackers.ts';
	import type { TrackerProgress } from '#lib/trackers/application/list-tracker-progress.ts';
	import type { Tracker } from '#lib/trackers/domain/tracker.ts';
	import { goalText } from '#lib/trackers/ui/tracker-format.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { loadTrackers } from '../../trackers.ts';

	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let app: App | undefined = $state();
	let trackers: readonly TrackerProgress[] = $state([]);

	void getAppContext().then(async (ready) => {
		trackers = await loadTrackers(ready, preferences);
		app = ready;
	});

	async function move(ready: App, tracker: Tracker, direction: TrackerMove): Promise<void> {
		await ready.trackers.moveTracker.execute({ id: tracker.id, move: direction });
		trackers = await loadTrackers(ready, preferences);
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.navigation.homeScreen}
/>

{#if app !== undefined}
	{@const ready = app}
	<ul aria-label={messages.trackers.yourTrackers}>
		{#each trackers as { tracker }, index (tracker.id)}
			<li>
				<button
					type="button"
					class="open"
					onclick={() => goto(resolve(AppRoute.tracker), { state: { selected: tracker.id } })}
				>
					<span class="name">{tracker.name}</span>
					<span class="goal">{goalText(tracker, units)}</span>
				</button>
				<button
					type="button"
					class="move"
					disabled={index === 0}
					aria-label={messages.trackers.moveUp(tracker.name)}
					onclick={() => move(ready, tracker, TrackerMove.up)}><Icon name="chevronUp" /></button
				>
				<button
					type="button"
					class="move"
					disabled={index === trackers.length - 1}
					aria-label={messages.trackers.moveDown(tracker.name)}
					onclick={() => move(ready, tracker, TrackerMove.down)}><Icon name="chevronDown" /></button
				>
			</li>
		{/each}
	</ul>
	<div class="add">
		<ActionButton
			label={messages.trackers.addTracker}
			icon="plus"
			href={resolve(AppRoute.addTracker)}
		/>
	</div>
{/if}

<style>
	ul {
		margin: 0 calc(-1 * var(--gutter));
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	li {
		display: flex;
		align-items: center;
		padding-right: var(--space-2);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.open {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		min-height: var(--row-height);
		padding: var(--space-2) var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		text-align: left;
	}

	.name {
		font-size: var(--font-size-17);
	}

	.goal {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.move {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		--icon-size: var(--icon-size-small);
	}

	.move:disabled {
		opacity: 0.3;
	}

	.add {
		margin-top: var(--space-6);
	}
</style>
