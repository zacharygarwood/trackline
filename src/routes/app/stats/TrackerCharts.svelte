<script lang="ts">
	import Bars from '#lib/design/Bars.svelte';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import { ChartSize } from '#lib/design/chart.constants.ts';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { Tracker, TrackerEntry } from '#lib/trackers/domain/tracker.ts';
	import { weeklyValues } from '#lib/trackers/ui/tracker-chart.ts';
	import { formatTrackerNumber, unitOf } from '#lib/trackers/ui/tracker-format.ts';

	/** Props for a chart of each tracker the user logs, week by week over the Stats range. */
	interface Props {
		stats: StatsScreen;
		trackers: readonly Tracker[];
		entries: readonly TrackerEntry[];
	}

	const { stats, trackers, entries }: Props = $props();
	/** Charts show at most a year of weeks. */
	const MAX_WEEKS = 52;
	const HEADROOM = 1.15;
	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
</script>

{#each trackers as tracker (tracker.id)}
	{@const values = weeklyValues({
		tracker,
		entries,
		today: stats.today,
		weeks: Math.min(stats.weeks, MAX_WEEKS),
		weekStart: preferences.weekStart
	})}
	{@const logged = values.filter((value) => value > 0)}
	{@const average = logged.length === 0 ? 0 : logged.reduce((a, b) => a + b, 0) / logged.length}
	<article aria-labelledby="tracker-{tracker.id}">
		<h3 id="tracker-{tracker.id}">{tracker.name}</h3>
		<BigNumber
			value={formatTrackerNumber(average)}
			suffix={unitOf(tracker, units) === '' ? undefined : unitOf(tracker, units)}
		/>
		<Bars
			{values}
			scale={Math.max(tracker.goal, ...values) * HEADROOM}
			goal={tracker.goal}
			size={ChartSize.medium}
			summary={messages.trackers.weeklyChart(
				tracker.name,
				values.map((value) => formatTrackerNumber(value)).join(', ')
			)}
		/>
	</article>
{/each}

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
		margin-bottom: var(--space-8);
	}

	h3 {
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}
</style>
