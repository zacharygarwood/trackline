<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import ActionButton from '#lib/design/ActionButton.svelte';
	import Icon from '#lib/design/Icon.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { MoveDirection } from '#lib/tracking/application/move-direction.constants.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { open } from '../../open.ts';

	let app: App | undefined = $state();
	let trackers: readonly Tracker[] = $state([]);

	void getAppContext().then(async (ready) => {
		trackers = await ready.tracking.listTrackers.execute();
		app = ready;
	});

	async function move(ready: App, tracker: Tracker, direction: MoveDirection): Promise<void> {
		trackers = await ready.tracking.moveTracker.execute({ id: tracker.id, direction });
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.navigation.trackers}
/>

{#if app !== undefined}
	{@const ready = app}
	<ul>
		{#each trackers as tracker, index (tracker.id)}
			<li>
				<button
					type="button"
					class="name"
					onclick={() => open(AppRoute.editTracker, { tracker: tracker.id })}>{tracker.name}</button
				>
				<button
					type="button"
					class="move"
					disabled={index === 0}
					aria-label={messages.tracking.edit.moveUp(tracker.name)}
					onclick={() => move(ready, tracker, MoveDirection.up)}><Icon name="chevronUp" /></button
				>
				<button
					type="button"
					class="move"
					disabled={index === trackers.length - 1}
					aria-label={messages.tracking.edit.moveDown(tracker.name)}
					onclick={() => move(ready, tracker, MoveDirection.down)}
					><Icon name="chevronDown" /></button
				>
			</li>
		{/each}
	</ul>
	<div class="add">
		<ActionButton
			label={messages.tracking.home.addTracker}
			icon="plus"
			href={resolve(AppRoute.addTracker)}
		/>
	</div>
{/if}

<style>
	li {
		display: flex;
		align-items: center;
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	button {
		border: none;
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
	}

	.name {
		flex: 1;
		height: var(--row-height);
		font-size: var(--font-size-17);
		text-align: left;
	}

	.move {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
	}

	.move:disabled {
		color: var(--color-empty);
		cursor: default;
	}

	.add {
		margin-top: var(--space-8);
	}
</style>
