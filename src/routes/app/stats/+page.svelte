<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { exerciseCards } from '#lib/insights/ui/exercise-cards.ts';
	import ExerciseCardView from '#lib/insights/ui/ExerciseCardView.svelte';
	import RangePicker from '#lib/insights/ui/RangePicker.svelte';
	import type { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { TrackerSource } from '#lib/trackers/domain/tracker.constants.ts';
	import { sourceOf, type Tracker, type TrackerEntry } from '#lib/trackers/domain/tracker.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import CaloriesChart from './CaloriesChart.svelte';
	import { cardExercises, statsForPage } from './stats-pages.ts';
	import TrackerCharts from './TrackerCharts.svelte';
	import WeightTrend from './WeightTrend.svelte';
	import WorkoutDays from './WorkoutDays.svelte';

	/** A year and a week of logged values, enough for any range's charts. */
	const DAYS_CHARTED = 371;
	const preferences = getPreferences();
	let stats: StatsScreen | undefined = $state();
	let training: TrainOverview | undefined = $state();
	let logged: readonly Tracker[] = $state([]);
	let entries: readonly TrackerEntry[] = $state([]);

	void getAppContext().then(async (app) => {
		const overview = new TrainOverview(app.training, app.clock);
		const [nextStats, progress, nextEntries] = await Promise.all([
			statsForPage(app),
			app.trackers.listTrackerProgress.execute({ weekStart: preferences.weekStart }),
			app.trackers.listTrackerEntries.execute({
				since: app.clock.today().addDays(-DAYS_CHARTED)
			}),
			overview.load()
		]);
		logged = progress
			.map((item) => item.tracker)
			.filter((tracker) => sourceOf(tracker.measure) === TrackerSource.log);
		entries = nextEntries;
		stats = nextStats;
		training = overview;
	});
</script>

<PageHeader title={messages.navigation.stats} />

{#if stats !== undefined && training !== undefined}
	{@const ready = stats}
	{@const cards = exerciseCards({
		days: ready.exerciseDays,
		exercises: cardExercises(training),
		today: ready.today,
		weeks: ready.weeks,
		units: { mass: preferences.massUnit, distance: preferences.current.distanceUnit },
		rangeWords: messages.trends.rangeWords[ready.range]
	})}
	<RangePicker stats={ready} />

	<section aria-labelledby="stats-workouts">
		<h2 id="stats-workouts">{messages.home.workouts}</h2>
		<WorkoutDays stats={ready} />
	</section>

	<section aria-labelledby="stats-calories">
		<h2 id="stats-calories">{messages.nutrition.calories}</h2>
		<CaloriesChart stats={ready} />
	</section>

	<section aria-labelledby="stats-weight">
		<h2 id="stats-weight">{messages.home.weight}</h2>
		<WeightTrend stats={ready} />
	</section>

	{#if logged.length > 0}
		<section aria-labelledby="stats-trackers">
			<h2 id="stats-trackers">{messages.trackers.yourTrackers}</h2>
			<TrackerCharts stats={ready} trackers={logged} {entries} />
		</section>
	{/if}

	<section aria-labelledby="stats-exercises">
		<h2 id="stats-exercises">{messages.navigation.exercises}</h2>
		{#each cards as card (card.id)}
			<article class="exercise" aria-labelledby="exercise-{card.id}">
				<h3 id="exercise-{card.id}">{card.name}</h3>
				<ExerciseCardView {card} />
			</article>
		{/each}
		{#if cards.length === 0}
			<p class="empty">{messages.trends.noWorkouts}</p>
		{/if}
	</section>
{/if}

<style>
	section {
		margin-top: var(--space-8);
	}

	h2 {
		margin-bottom: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.exercise {
		margin-bottom: var(--space-8);
	}

	h3 {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
