<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import WeightGoalSheet from '#lib/body/ui/WeightGoalSheet.svelte';
	import { WeightGoalEditor } from '#lib/body/ui/weight-goal-editor.svelte.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { UnitsSetting } from '#lib/settings/ui/units-setting.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { AppRoute } from '../app-route.constants.ts';

	const unitOptions = [
		{ value: MassUnit.kg, label: messages.units.kgLong },
		{ value: MassUnit.lb, label: messages.units.lbLong }
	];

	let app: App | undefined = $state();
	let units: UnitsSetting | undefined = $state();
	let goal: WeightGoalEditor | undefined = $state();
	let editingGoal = $state(false);

	void getAppContext().then(async (ready) => {
		const nextUnits = new UnitsSetting(ready.settings);
		const nextGoal = new WeightGoalEditor(ready.body);
		await Promise.all([nextUnits.load(), nextGoal.load()]);
		units = nextUnits;
		goal = nextGoal;
		app = ready;
	});

	async function start(ready: App): Promise<void> {
		await ready.settings.completeSetup.execute();
		await goto(resolve(AppRoute.today), { replaceState: true });
	}
</script>

{#if app !== undefined && units !== undefined && goal !== undefined}
	{@const ready = app}
	{@const unitsSetting = units}
	{@const goalEditor = goal}
	<div class="welcome">
		<p>{messages.welcome.privacy}</p>
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
		<p class="note">{messages.welcome.optional}</p>
		<Button onclick={() => start(ready)}>{messages.welcome.start}</Button>
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
	.welcome {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
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

	.note {
		color: var(--color-text-muted);
	}
</style>
