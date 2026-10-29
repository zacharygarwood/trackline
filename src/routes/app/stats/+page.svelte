<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import Card from '#lib/design/Card.svelte';
	import Row from '#lib/design/Row.svelte';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { StatsRange } from '#lib/insights/application/stats-range.constants.ts';
	import ActivityHeatmapView from '#lib/insights/ui/ActivityHeatmapView.svelte';
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
</script>

{#if screen !== undefined}
	{@const ready = screen}
	<Card title={messages.stats.streaks}>
		<Row label={messages.stats.currentStreak} value={messages.stats.days(ready.streak.current)} />
		<Row label={messages.stats.longestStreak} value={messages.stats.days(ready.streak.longest)} />
	</Card>

	<Card title={messages.stats.activity}>
		{#each ready.heatmaps as heatmap (heatmap.title)}
			<ActivityHeatmapView {heatmap} today={ready.today} weekStart={ready.weekStart} />
		{/each}
	</Card>

	<Card>
		<SegmentedControl
			label={messages.stats.range}
			options={ranges}
			value={ready.range}
			onchange={(range: StatsRange) => ready.changeRange(range)}
		/>
	</Card>

	<StatsChart
		title={messages.stats.weight}
		data={ready.weightChart}
		empty={messages.stats.noWeighIns}
	/>
	<StatsChart
		title={messages.stats.calories}
		data={ready.caloriesChart}
		empty={messages.stats.noFood}
	/>
	<StatsChart
		title={messages.stats.protein}
		data={ready.proteinChart}
		empty={messages.stats.noFood}
	/>

	{#if ready.exercise === undefined}
		<Card title={messages.stats.exerciseProgress}>
			<p class="note">{messages.stats.noExercises}</p>
		</Card>
	{:else}
		{@const chosen = ready.exercise}
		<StatsChart
			title={messages.stats.exerciseProgress}
			data={ready.exerciseChart}
			empty={messages.stats.noSessions}
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
{/if}

<style>
	.note {
		display: flex;
		align-items: center;
		min-height: var(--row-height);
		color: var(--color-text-muted);
	}

	.picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--row-height);
	}

	select {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
	}
</style>
