<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import WeightGoalSheet from '#lib/body/ui/WeightGoalSheet.svelte';
	import { WeightGoalEditor } from '#lib/body/ui/weight-goal-editor.svelte.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import DailyGoalsForm from '#lib/nutrition/ui/DailyGoalsForm.svelte';
	import { DailyGoalsEditor } from '#lib/nutrition/ui/daily-goals-editor.svelte.ts';
	import AboutSection from '#lib/settings/ui/AboutSection.svelte';
	import DataSection from '#lib/settings/ui/DataSection.svelte';
	import { DataPanel } from '#lib/settings/ui/data-panel.svelte.ts';
	import { UnitsSetting } from '#lib/settings/ui/units-setting.svelte.ts';
	import { WeekStartSetting } from '#lib/settings/ui/week-start-setting.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { WeekStart } from '#lib/shared/week-start.constants.ts';

	const unitOptions = [
		{ value: MassUnit.kg, label: messages.units.kgLong },
		{ value: MassUnit.lb, label: messages.units.lbLong }
	];

	const weekStartOptions = [
		{ value: WeekStart.monday, label: messages.settings.monday },
		{ value: WeekStart.sunday, label: messages.settings.sunday }
	];

	let units: UnitsSetting | undefined = $state();
	let weekStart: WeekStartSetting | undefined = $state();
	let goal: WeightGoalEditor | undefined = $state();
	let dailyGoals: DailyGoalsEditor | undefined = $state();
	let data: DataPanel | undefined = $state();
	let editingGoal = $state(false);

	void getAppContext().then(async (app) => {
		const nextUnits = new UnitsSetting(app.settings);
		const nextWeekStart = new WeekStartSetting(app.settings);
		const nextGoal = new WeightGoalEditor(app.body);
		const nextData = new DataPanel(app.settings, app.saveFile);
		const nextDailyGoals = new DailyGoalsEditor(app.nutrition, app.clock);
		await Promise.all([
			nextUnits.load(),
			nextWeekStart.load(),
			nextGoal.load(),
			nextData.load(),
			nextDailyGoals.load()
		]);
		weekStart = nextWeekStart;
		dailyGoals = nextDailyGoals;
		units = nextUnits;
		goal = nextGoal;
		data = nextData;
	});
</script>

{#if units !== undefined && weekStart !== undefined && goal !== undefined && data !== undefined && dailyGoals !== undefined}
	{@const unitsSetting = units}
	{@const goalEditor = goal}
	{@const weekStartSetting = weekStart}
	<div class="settings">
		<SegmentedControl
			label={messages.settings.units}
			options={unitOptions}
			value={unitsSetting.unit}
			onchange={(unit: MassUnit) => void unitsSetting.choose(unit)}
		/>

		<SegmentedControl
			label={messages.settings.weekStart}
			options={weekStartOptions}
			value={weekStartSetting.weekStart}
			onchange={(day: WeekStart) => void weekStartSetting.choose(day)}
		/>

		<section>
			<h2>{messages.body.goalWeight}</h2>
			<p>{goalEditor.describe(unitsSetting.unit)}</p>
			<Button variant={ButtonVariant.secondary} onclick={() => (editingGoal = true)}>
				{goalEditor.goal === undefined ? messages.body.setGoal : messages.body.changeGoal}
			</Button>
		</section>

		<DailyGoalsForm editor={dailyGoals} />

		<DataSection
			panel={data}
			onreplaced={() => {
				location.reload();
			}}
		/>

		<AboutSection version={__APP_VERSION__} />
	</div>

	{#if editingGoal}
		<WeightGoalSheet
			editor={goalEditor}
			unit={unitsSetting.unit}
			onclose={() => (editingGoal = false)}
		/>
	{/if}
{/if}

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding-bottom: var(--space-8);
	}

	section {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
	}

	h2 {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}
</style>
