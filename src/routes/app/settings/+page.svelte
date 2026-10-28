<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import WeightGoalSheet from '#lib/body/ui/WeightGoalSheet.svelte';
	import { WeightGoalEditor } from '#lib/body/ui/weight-goal-editor.svelte.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { UnitsSetting } from '#lib/settings/ui/units-setting.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';

	const unitOptions = [
		{ value: MassUnit.kg, label: messages.units.kgLong },
		{ value: MassUnit.lb, label: messages.units.lbLong }
	];

	let units: UnitsSetting | undefined = $state();
	let goal: WeightGoalEditor | undefined = $state();
	let editingGoal = $state(false);

	void getAppContext().then(async (app) => {
		const nextUnits = new UnitsSetting(app.settings);
		const nextGoal = new WeightGoalEditor(app.body);
		await Promise.all([nextUnits.load(), nextGoal.load()]);
		units = nextUnits;
		goal = nextGoal;
	});
</script>

{#if units !== undefined && goal !== undefined}
	{@const unitsSetting = units}
	{@const goalEditor = goal}
	<div class="settings">
		<SegmentedControl
			label={messages.settings.units}
			options={unitOptions}
			value={unitsSetting.unit}
			onchange={(unit: MassUnit) => void unitsSetting.choose(unit)}
		/>

		<section>
			<h2>{messages.body.goalWeight}</h2>
			<p>{goalEditor.describe(unitsSetting.unit)}</p>
			<Button variant={ButtonVariant.secondary} onclick={() => (editingGoal = true)}>
				{goalEditor.goal === undefined ? messages.body.setGoal : messages.body.changeGoal}
			</Button>
		</section>
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
		padding-bottom: var(--space-6);
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
