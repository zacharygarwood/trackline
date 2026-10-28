<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { StatsRange } from '#lib/insights/application/stats-range.constants.ts';
	import ActivityHeatmapView from '#lib/insights/ui/ActivityHeatmapView.svelte';
	import { LegendMark } from '#lib/insights/ui/legend-mark.constants.ts';
	import StatsChart from '#lib/insights/ui/StatsChart.svelte';
	import { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';

	let screen: StatsScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new StatsScreen(
			{
				...app.insights,
				getMassUnit: app.settings.getMassUnit,
				getWeekStart: app.settings.getWeekStart
			},
			app.clock
		);
		await next.load();
		screen = next;
	});

	const ranges = [
		{ value: StatsRange.fourWeeks, label: messages.stats.fourWeeks },
		{ value: StatsRange.threeMonths, label: messages.stats.threeMonths },
		{ value: StatsRange.oneYear, label: messages.stats.oneYear },
		{ value: StatsRange.all, label: messages.stats.all }
	] as const;

	const nutritionLegend = [
		{ mark: LegendMark.line, label: messages.stats.dailyTotal },
		{ mark: LegendMark.dashed, label: messages.stats.goal }
	];
</script>

{#if screen !== undefined}
	{@const ready = screen}
	<div class="stats">
		<dl class="streaks">
			<div>
				<dt>{messages.stats.currentStreak}</dt>
				<dd>{messages.stats.days(ready.streak.current)}</dd>
			</div>
			<div>
				<dt>{messages.stats.longestStreak}</dt>
				<dd>{messages.stats.days(ready.streak.longest)}</dd>
			</div>
		</dl>

		<section class="activity">
			<h2>{messages.stats.activity}</h2>
			{#each ready.heatmaps as heatmap (heatmap.title)}
				<ActivityHeatmapView {heatmap} today={ready.today} weekStart={ready.weekStart} />
			{/each}
		</section>

		<SegmentedControl
			label={messages.stats.range}
			options={ranges}
			value={ready.range}
			onchange={(range: StatsRange) => ready.changeRange(range)}
		/>

		<StatsChart
			title={messages.stats.weight}
			data={ready.weightChart}
			empty={messages.stats.noWeighIns}
			legend={[{ mark: LegendMark.line, label: messages.stats.movingAverage }]}
		/>
		<StatsChart
			title={messages.stats.calories}
			data={ready.caloriesChart}
			empty={messages.stats.noFood}
			legend={nutritionLegend}
		/>
		<StatsChart
			title={messages.stats.protein}
			data={ready.proteinChart}
			empty={messages.stats.noFood}
			legend={nutritionLegend}
		/>

		{#if ready.exercise === undefined}
			<section>
				<h2>{messages.stats.exerciseProgress}</h2>
				<p class="note">{messages.stats.noExercises}</p>
			</section>
		{:else}
			{@const chosen = ready.exercise}
			<StatsChart
				title={messages.stats.exerciseProgress}
				data={ready.exerciseChart}
				empty={messages.stats.noSessions}
				legend={[
					{ mark: LegendMark.line, label: messages.stats.estimatedOneRepMax },
					{ mark: LegendMark.dot, label: messages.stats.heaviestSet }
				]}
			>
				{#snippet controls()}
					<label class="picker">
						<span>{messages.stats.exercise}</span>
						<select
							value={chosen.id}
							onchange={(event) => ready.chooseExercise(event.currentTarget.value)}
						>
							{#each ready.exercises as exercise (exercise.id)}
								<option value={exercise.id}>{exercise.name}</option>
							{/each}
						</select>
					</label>
				{/snippet}
			</StatsChart>
		{/if}
	</div>
{/if}

<style>
	.stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding-bottom: var(--space-8);
	}

	.streaks {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin: 0;
	}

	.streaks div {
		padding: var(--space-4);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	dt {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	dd {
		margin: 0;
		font-size: var(--font-size-title);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.activity {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	h2 {
		font-size: var(--font-size-body);
	}

	.note {
		margin-top: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.picker {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	select {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		font-size: var(--font-size-body);
	}
</style>
