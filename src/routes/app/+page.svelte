<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import ProgressRow from '#lib/design/ProgressRow.svelte';
	import ResumeBar from '#lib/design/ResumeBar.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { TrackerProgress } from '#lib/trackers/application/list-tracker-progress.ts';
	import { TrackerSource } from '#lib/trackers/domain/tracker.constants.ts';
	import { sourceOf, type Tracker } from '#lib/trackers/domain/tracker.ts';
	import { goalText, valueText } from '#lib/trackers/ui/tracker-format.ts';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { elapsedClock } from '#lib/training/ui/workout-format.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { AppRoute } from './app-route.constants.ts';
	import { loadTrackers } from './trackers.ts';

	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let trackers: readonly TrackerProgress[] | undefined = $state();
	let train: TrainScreen | undefined = $state();
	let ticker: Ticker | undefined = $state();

	void getAppContext().then(async (app) => {
		const nextTrain = new TrainScreen(app.training);
		const [progress] = await Promise.all([loadTrackers(app, preferences), nextTrain.load()]);
		trackers = progress;
		train = nextTrain;
		ticker = new Ticker(app.clock);
	});

	$effect(() => ticker?.start());

	const PAGES = {
		food: AppRoute.eat,
		workouts: AppRoute.train,
		weight: AppRoute.body
	} as const;

	function open(tracker: Tracker): Promise<void> {
		const source = sourceOf(tracker.measure);
		return source === TrackerSource.log
			? goto(resolve(AppRoute.trackerLog), { state: { selected: tracker.id } })
			: goto(resolve(PAGES[source]));
	}
</script>

{#if trackers !== undefined && train !== undefined}
	{#if train.active !== undefined && ticker !== undefined}
		<div class="resume">
			<ResumeBar
				name={train.activeName}
				elapsed={elapsedClock(train.active.startedAt, ticker.now)}
				href={resolve(AppRoute.workout)}
			/>
		</div>
	{/if}

	<ul class="trackers">
		{#each trackers as { tracker, value, fill } (tracker.id)}
			<li>
				<ProgressRow
					label={tracker.name}
					value={valueText(tracker, value, units)}
					detail={goalText(tracker, units)}
					fraction={fill}
					onclick={() => open(tracker)}
				/>
			</li>
		{/each}
	</ul>
	{#if trackers.length === 0}
		<p class="empty">{messages.home.empty}</p>
	{/if}
{/if}

<style>
	.resume {
		margin-bottom: var(--space-5);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
