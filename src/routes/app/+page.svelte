<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import { recentWeights } from '#lib/body/ui/weight-chart.ts';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import ResumeBar from '#lib/design/ResumeBar.svelte';
	import Sparkline from '#lib/design/Sparkline.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import MacroTotals from '#lib/nutrition/ui/MacroTotals.svelte';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { first } from '#lib/shared/collections.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { workoutsIn } from '#lib/training/ui/week-strip.ts';
	import WeekStrip from '#lib/training/ui/WeekStrip.svelte';
	import { elapsedClock } from '#lib/training/ui/workout-format.ts';
	import { formatMassNumber, unitLabel } from '#lib/ui/format.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { AppRoute } from './app-route.constants.ts';

	/** How many of the latest weigh-ins the sparkline draws. */
	const SPARKLINE_WEIGH_INS = 30;
	const SPARKLINE_PADDING = 0.2;

	const preferences = getPreferences();
	let body: BodyScreen | undefined = $state();
	let food: FoodScreen | undefined = $state();
	let week: TrainOverview | undefined = $state();
	let train: TrainScreen | undefined = $state();
	let ticker: Ticker | undefined = $state();

	void getAppContext().then(async (app) => {
		const screens = {
			body: new BodyScreen({ ...app.body, getMassUnit: app.settings.getMassUnit }, app.clock),
			food: new FoodScreen(app.nutrition, app.clock),
			week: new TrainOverview(app.training, app.clock),
			train: new TrainScreen(app.training)
		};
		await Promise.all(Object.values(screens).map((screen) => screen.load()));
		({ body, food, week, train } = screens);
		ticker = new Ticker(app.clock);
	});

	$effect(() => ticker?.start());
</script>

{#if body !== undefined && food !== undefined && week !== undefined && train !== undefined}
	{@const latest = first(body.weighIns)}
	{@const unit = preferences.massUnit}
	{@const days = week.thisWeek(preferences.weekStart)}
	{@const trend = recentWeights(body.weighIns, unit, SPARKLINE_WEIGH_INS)}

	{#if train.active !== undefined && ticker !== undefined}
		<ResumeBar
			name={train.activeName}
			elapsed={elapsedClock(train.active.startedAt, ticker.now)}
			href={resolve(AppRoute.workout)}
		/>
	{/if}

	<a class="section food" href={resolve(AppRoute.eat)}>
		<MacroTotals
			summary={food.day.summary}
			trackCarbsAndFat={preferences.current.trackCarbsAndFat}
			today
		/>
	</a>

	<a class="section" href={resolve(AppRoute.train)}>
		<span class="heading">
			<span>{messages.today.thisWeek}</span>
			<span
				>{workoutsIn(days)}<span class="goal"
					>{messages.food.goal(String(preferences.current.weeklyWorkoutGoal))}</span
				></span
			>
		</span>
		<WeekStrip {days} />
	</a>

	<a class="section weight" href={resolve(AppRoute.body)}>
		<span class="figure">
			<span class="label">{messages.today.weight}</span>
			<BigNumber
				value={latest === undefined ? messages.today.none : formatMassNumber(latest.weight, unit)}
				suffix={latest === undefined ? undefined : unitLabel(unit)}
			/>
		</span>
		{#if trend.length > 0}
			<Sparkline values={trend} padding={SPARKLINE_PADDING} />
		{/if}
	</a>
{/if}

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-6) var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
		color: var(--color-text);
		text-decoration: none;
	}

	.section:hover {
		background: var(--color-hover);
	}

	.food {
		padding: var(--space-5) var(--gutter) var(--space-7);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.goal {
		margin-left: var(--chip-gap);
		color: var(--color-text-muted);
	}

	.weight {
		flex-direction: row;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.figure {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
