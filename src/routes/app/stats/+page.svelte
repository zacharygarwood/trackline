<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import { weightChange } from '#lib/body/ui/body-trends.ts';
	import Bars from '#lib/design/Bars.svelte';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import { ChartSize } from '#lib/design/chart.constants.ts';
	import Choice from '#lib/design/Choice.svelte';
	import { LETTERED_WEEKDAYS } from '#lib/design/heatmap.constants.ts';
	import TrendLine from '#lib/design/TrendLine.svelte';
	import WorkoutHeatmap from '#lib/design/WorkoutHeatmap.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { STATS_RANGES } from '#lib/insights/application/stats-range.constants.ts';
	import { exerciseCards, type CardExercise } from '#lib/insights/ui/exercise-cards.ts';
	import ExerciseCardView from '#lib/insights/ui/ExerciseCardView.svelte';
	import { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { startOfWeek } from '#lib/shared/week.ts';
	import { WeekStart } from '#lib/shared/week-start.constants.ts';
	import type { FinishedWorkout } from '#lib/training/domain/workout.ts';
	import RecentWorkoutList from '#lib/training/ui/RecentWorkoutList.svelte';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import { countLabel, gradeNames, primaryField } from '#lib/training/ui/workout-format.ts';
	import { formatMonth, formatWeekdayLetter, unitLabel } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';

	const KG_PADDING = 0.15;
	const LB_PADDING = 0.3;
	const DAYS_PER_WEEK = 7;
	const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

	const preferences = getPreferences();
	const toaster = getToaster();
	let stats: StatsScreen | undefined = $state();
	let training: TrainOverview | undefined = $state();

	void getAppContext().then(async (app) => {
		const nextStats = new StatsScreen(app.insights, app.clock);
		const nextTraining = new TrainOverview(app.training, app.clock);
		await Promise.all([nextStats.load(), nextTraining.load()]);
		stats = nextStats;
		training = nextTraining;
	});

	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	const letters = $derived.by(() => {
		if (stats === undefined) return [];
		const start = startOfWeek(stats.today, preferences.weekStart);
		return Array.from({ length: DAYS_PER_WEEK }, (_, row) =>
			LETTERED_WEEKDAYS.includes(daysAfterMonday(start.addDays(row)))
				? formatWeekdayLetter(start.addDays(row))
				: ''
		);
	});

	/** How many days after Monday a date falls, 0 to 6. */
	function daysAfterMonday(date: LocalDate): number {
		return date.toEpochDay() - startOfWeek(date, WeekStart.monday).toEpochDay();
	}

	function cardExercises(overview: TrainOverview): readonly CardExercise[] {
		return overview.library.map((exercise) => ({
			id: exercise.id,
			name: exercise.name,
			measure: primaryField(exercise),
			grades: gradeNames(exercise),
			countLabel: countLabel(exercise)
		}));
	}

	async function save(overview: TrainOverview, workout: FinishedWorkout): Promise<void> {
		if (await overview.save(workout)) toaster.show(messages.trends.savedToWorkouts);
	}
</script>

{#if stats !== undefined && training !== undefined}
	{@const ready = stats}
	{@const overview = training}
	{@const words = messages.trends.rangeWords[ready.range]}
	{@const weights = ready.weights(units.mass)}
	{@const change = weightChange(weights)}
	{@const goal = ready.calorieGoal}
	<div class="ranges" role="group" aria-label={messages.trends.timeRange}>
		{#each STATS_RANGES as range (range)}
			<Choice joined pressed={ready.range === range} onclick={() => ready.choose(range)}
				>{messages.trends.ranges[range]}</Choice
			>
		{/each}
	</div>

	<section class="first" aria-labelledby="workout-days">
		<h2 id="workout-days">{messages.trends.workoutDays}</h2>
		<p class="hero">{ready.workoutDayCount}</p>
		<WorkoutHeatmap
			today={ready.today}
			rangeWeeks={ready.weeks}
			weekStart={preferences.weekStart}
			minutesOf={ready.minutesOf}
			monthLabel={formatMonth}
			weekdayLetters={letters}
			summary={messages.trends.heatmap(ready.workoutDayCount, words)}
		/>
	</section>

	{#if weights.length > 0}
		<section aria-labelledby="stats-weight">
			<h2 id="stats-weight">{messages.trends.weight}</h2>
			<BigNumber
				value={change.latest}
				suffix={unitLabel(units.mass)}
				note={change.text === change.amount ? undefined : change.text}
			/>
			<TrendLine
				values={weights}
				padding={units.mass === MassUnit.kg ? KG_PADDING : LB_PADDING}
				summary={messages.trends.weightChart({
					range: words,
					direction: change.direction,
					change: change.amount,
					unit: unitLabel(units.mass)
				})}
			/>
		</section>
	{/if}

	<section aria-labelledby="daily-calories">
		<div class="split">
			<h2 id="daily-calories">{messages.trends.dailyCalories}</h2>
			{#if goal !== undefined}<span>{messages.trends.goal(whole.format(goal))}</span>{/if}
		</div>
		<BigNumber value={whole.format(ready.calorieAverage)} suffix={messages.trends.average} />
		<Bars
			values={ready.calorieBars}
			scale={ready.calorieScale}
			{goal}
			size={ChartSize.medium}
			summary={messages.trends.caloriesChart(
				words,
				whole.format(goal ?? 0),
				ready.calorieBars.map((value) => whole.format(value)).join(', ')
			)}
		/>
	</section>

	{#each exerciseCards( { days: ready.exerciseDays, exercises: cardExercises(overview), today: ready.today, weeks: ready.weeks, units, rangeWords: words } ) as card (card.id)}
		<ExerciseCardView {card} />
	{/each}

	<RecentWorkoutList
		{overview}
		{units}
		onsave={(workout: FinishedWorkout) => save(overview, workout)}
	/>
{/if}

<style>
	.ranges {
		position: sticky;
		top: 0;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		margin: 0 calc(-1 * var(--gutter)) var(--space-5);
		padding: var(--space-2) var(--gutter);
		background: var(--color-background);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-6) var(--gutter) var(--space-7);
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	section.first {
		padding-top: 0;
		border-top: none;
	}

	h2 {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.hero {
		font-size: var(--font-size-72);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-number);
		letter-spacing: var(--letter-spacing-hero);
		font-variant-numeric: tabular-nums;
	}

	.split {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-15);
	}

	.split span {
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}
</style>
