<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import ActionButton from '#lib/design/ActionButton.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { TrackerKind } from '#lib/tracking/domain/tracking.constants.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, open, replace } from '../../open.ts';

	const preferences = getPreferences();
	let screen: TrackerScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrackerScreen(app.tracking, app.clock, preferences.weekStart);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		screen = next;
	});

	function titleOf(tracker: Tracker): string {
		if (tracker.kind === TrackerKind.workout) return messages.tracking.library.exercises;
		return tracker.kind === TrackerKind.food ? messages.tracking.library.foods : tracker.name;
	}

	function addLabel(tracker: Tracker): string {
		if (tracker.kind === TrackerKind.workout) return messages.tracking.library.newExercise;
		return tracker.kind === TrackerKind.food
			? messages.tracking.library.newFood
			: messages.tracking.library.newThing;
	}

	function emptyText(tracker: Tracker): string {
		if (tracker.kind === TrackerKind.workout) return messages.tracking.library.emptyExercises;
		return tracker.kind === TrackerKind.food
			? messages.tracking.library.emptyFoods
			: messages.tracking.library.emptyThings;
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={screen?.tracker === undefined ? '' : titleOf(screen.tracker)}
	onback={back}
/>

{#if screen?.tracker !== undefined}
	{@const tracker = screen.tracker}
	<div class="adds">
		<ActionButton
			label={addLabel(tracker)}
			icon="plus"
			onclick={() => open(AppRoute.newSubject, { tracker: tracker.id })}
		/>
		{#if tracker.kind === TrackerKind.food}
			<ActionButton
				label={messages.tracking.library.newRecipe}
				icon="plus"
				onclick={() => open(AppRoute.newSubject, { tracker: tracker.id, recipe: true })}
			/>
		{/if}
	</div>
	<div class="list">
		{#if screen.subjects.length === 0}
			<p class="empty">{emptyText(tracker)}</p>
		{:else}
			<ul>
				{#each screen.subjects as subject (subject.id)}
					<li>
						<NavRow
							label={subject.name}
							onclick={() => open(AppRoute.subject, { tracker: tracker.id, subject: subject.id })}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.adds {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.list {
		margin-top: var(--space-6);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
