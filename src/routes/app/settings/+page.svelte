<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Switch from '#lib/design/Switch.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { DailyGoalsEditor } from '#lib/nutrition/ui/daily-goals-editor.svelte.ts';
	import GoalRows from '#lib/nutrition/ui/GoalRows.svelte';
	import type { Preferences } from '#lib/settings/domain/preferences.ts';
	import { NEW_FOOD_UNITS, REST_TIMER_SECONDS } from '#lib/settings/domain/preferences.ts';
	import AboutSection from '#lib/settings/ui/AboutSection.svelte';
	import AppearanceSettings from '#lib/settings/ui/AppearanceSettings.svelte';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import DataSection from '#lib/settings/ui/DataSection.svelte';
	import { DataPanel } from '#lib/settings/ui/data-panel.svelte.ts';
	import SettingChoices from '#lib/settings/ui/SettingChoices.svelte';
	import SettingRow from '#lib/settings/ui/SettingRow.svelte';
	import { DistanceUnit } from '#lib/shared/distance-unit.constants.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { WeekStart } from '#lib/shared/week-start.constants.ts';
	import { formatClock, parseDecimal } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { TAB_SECTIONS } from '../navigation.constants.ts';

	const preferences = getPreferences();
	let goals: DailyGoalsEditor | undefined = $state();
	let data: DataPanel | undefined = $state();
	let from = $state(TAB_SECTIONS.at(0));

	afterNavigate((navigation) => {
		const path = navigation.from?.url.pathname;
		const section = TAB_SECTIONS.find((tab) => resolve(tab.route) === path);
		if (section !== undefined) from = section;
	});

	void getAppContext().then(async (app) => {
		const nextGoals = new DailyGoalsEditor(app.nutrition, app.clock);
		const nextData = new DataPanel(app.settings, app.saveFile);
		await Promise.all([nextGoals.load(), nextData.load()]);
		goals = nextGoals;
		data = nextData;
	});

	function change(changes: Partial<Preferences>): void {
		void preferences.change(changes);
	}
</script>

<a class="back" href={resolve(from?.route ?? AppRoute.today)}
	>{messages.shell.back(from?.title ?? messages.navigation.today)}</a
>
<h1>{messages.navigation.settings}</h1>

<AppearanceSettings {preferences} />

{#if goals !== undefined}
	<h2>{messages.preferences.dailyGoals}</h2>
	<div class="group">
		<GoalRows editor={goals} trackCarbsAndFat={preferences.current.trackCarbsAndFat} />
		<div class="goal">
			<label for="goal-workouts">{messages.preferences.workoutsPerWeek}</label>
			<input
				id="goal-workouts"
				type="number"
				inputmode="numeric"
				min="1"
				max="7"
				value={preferences.current.weeklyWorkoutGoal}
				onchange={(event) => {
					change({ weeklyWorkoutGoal: parseDecimal(event.currentTarget.value) ?? Number.NaN });
				}}
			/>
			<span></span>
		</div>
	</div>
{/if}

<h2 class="spaced">{messages.preferences.tracking}</h2>
<div class="group switch">
	<Switch
		label={messages.preferences.carbsAndFat}
		checked={preferences.current.trackCarbsAndFat}
		ontoggle={() => {
			change({ trackCarbsAndFat: !preferences.current.trackCarbsAndFat });
		}}
	/>
</div>

<h2 class="spaced">{messages.preferences.units}</h2>
<div class="group">
	<SettingRow label={messages.preferences.weight}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={[
					{ value: MassUnit.lb, label: messages.units.lb },
					{ value: MassUnit.kg, label: messages.units.kg }
				]}
				value={preferences.massUnit}
				onchoose={(unit: MassUnit) => preferences.chooseMassUnit(unit)}
			/>
		{/snippet}
	</SettingRow>
	<SettingRow label={messages.preferences.distance}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={Object.values(DistanceUnit).map((value) => ({ value, label: value }))}
				value={preferences.current.distanceUnit}
				onchoose={(distanceUnit: DistanceUnit) => {
					change({ distanceUnit });
				}}
			/>
		{/snippet}
	</SettingRow>
	<SettingRow label={messages.preferences.newFoods}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={NEW_FOOD_UNITS.map((value) => ({ value, label: value }))}
				value={preferences.current.newFoodUnit}
				onchoose={(newFoodUnit: (typeof NEW_FOOD_UNITS)[number]) => {
					change({ newFoodUnit });
				}}
			/>
		{/snippet}
	</SettingRow>
	<SettingRow label={messages.preferences.weekStarts}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={[
					{ value: WeekStart.monday, label: messages.preferences.monday },
					{ value: WeekStart.sunday, label: messages.preferences.sunday }
				]}
				value={preferences.weekStart}
				onchoose={(day: WeekStart) => preferences.chooseWeekStart(day)}
			/>
		{/snippet}
	</SettingRow>
</div>

<h2 class="spaced">{messages.preferences.workouts}</h2>
<div class="group">
	<SettingRow label={messages.preferences.restTimer}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={REST_TIMER_SECONDS.map((value) => ({ value, label: formatClock(value) }))}
				value={preferences.current.restSeconds}
				onchoose={(restSeconds: (typeof REST_TIMER_SECONDS)[number]) => {
					change({ restSeconds });
				}}
			/>
		{/snippet}
	</SettingRow>
</div>

{#if data !== undefined}
	<div class="more">
		<DataSection
			panel={data}
			onreplaced={() => {
				location.reload();
			}}
		/>
		<AboutSection version={__APP_VERSION__} />
	</div>
{/if}

<style>
	.back {
		display: flex;
		align-items: center;
		min-height: var(--tap-target);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	h1 {
		margin: var(--space-2) 0 var(--space-6);
		font-size: var(--font-size-34);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-title);
	}

	h2 {
		padding-bottom: var(--space-3);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.spaced {
		margin-top: var(--space-9);
	}

	.group {
		margin: 0 calc(-1 * var(--gutter));
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.switch {
		padding: 0 var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.goal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--setting-row-height);
		padding: 0 var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.goal label {
		flex: 1;
		font-size: var(--font-size-17);
	}

	.goal input {
		width: var(--goal-field-width);
		height: var(--tap-target);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-bold);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.goal input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	.goal span {
		width: var(--goal-unit-width);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.more {
		margin-top: var(--space-9);
	}
</style>
