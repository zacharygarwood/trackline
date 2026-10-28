<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { GoalDirection } from '#lib/body/domain/goal-direction.constants.ts';
	import { DIRECTION_LABELS, WeightGoalEditor } from '#lib/body/ui/weight-goal-editor.svelte.ts';
	import Button from '#lib/design/Button.svelte';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import UnitField from '#lib/design/UnitField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import DailyGoalsFields from '#lib/nutrition/ui/DailyGoalsFields.svelte';
	import { DailyGoalsEditor, type GoalsForm } from '#lib/nutrition/ui/daily-goals-editor.svelte.ts';
	import { UnitsSetting } from '#lib/settings/ui/units-setting.svelte.ts';
	import { WelcomeSetup } from '#lib/settings/ui/welcome-setup.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { unitLabel } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';

	/** Everything the screen needs once the app has started. */
	interface Ready {
		readonly units: UnitsSetting;
		readonly goal: WeightGoalEditor;
		readonly dailyGoals: DailyGoalsEditor;
		readonly setup: WelcomeSetup;
	}

	const unitOptions = [
		{ value: MassUnit.kg, label: messages.units.kgLong },
		{ value: MassUnit.lb, label: messages.units.lbLong }
	];
	const directions = Object.values(GoalDirection).map((value) => ({
		value,
		label: DIRECTION_LABELS[value]
	}));

	let ready: Ready | undefined = $state();
	let goalEntry = $state('');
	let direction: GoalDirection = $state(GoalDirection.lose);
	let dailyGoals: GoalsForm = $state({ calories: '', protein: '', carbs: '', fat: '' });

	void getAppContext().then(async (app) => {
		const units = new UnitsSetting(app.settings);
		await units.load();
		ready = {
			units,
			goal: new WeightGoalEditor(app.body),
			dailyGoals: new DailyGoalsEditor(app.nutrition, app.clock),
			setup: new WelcomeSetup(app.settings.completeSetup)
		};
	});

	async function start(screen: Ready): Promise<void> {
		const finished = await screen.setup.finish([
			() => screen.goal.saveIfFilled(goalEntry, direction, screen.units.unit),
			() => screen.dailyGoals.saveIfFilled(dailyGoals)
		]);
		if (finished) await goto(resolve(AppRoute.today), { replaceState: true });
	}
</script>

{#if ready !== undefined}
	{@const screen = ready}
	<div class="welcome">
		<SegmentedControl
			label={messages.settings.units}
			options={unitOptions}
			value={screen.units.unit}
			onchange={(unit: MassUnit) => void screen.units.choose(unit)}
		/>

		<section>
			<UnitField
				label={messages.welcome.optional(messages.body.goalWeight)}
				unit={unitLabel(screen.units.unit)}
				bind:value={goalEntry}
			/>
			{#if goalEntry.trim() !== ''}
				<SegmentedControl
					label={messages.body.direction}
					options={directions}
					bind:value={direction}
				/>
			{/if}
		</section>

		<section>
			<h2>{messages.welcome.optional(messages.nutrition.dailyGoals)}</h2>
			<DailyGoalsFields bind:form={dailyGoals} />
		</section>

		{#if screen.setup.problem !== undefined}
			<p class="problem" role="alert">{screen.setup.problem}</p>
		{/if}
		<Button onclick={() => start(screen)}>{messages.welcome.start}</Button>
	</div>
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
		gap: var(--space-3);
	}

	h2 {
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}
</style>
