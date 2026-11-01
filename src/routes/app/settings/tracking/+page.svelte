<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Switch from '#lib/design/Switch.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { Preferences } from '#lib/settings/domain/preferences.ts';
	import { NEW_FOOD_UNITS, REST_TIMER_SECONDS } from '#lib/settings/domain/preferences.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import SettingChoices from '#lib/settings/ui/SettingChoices.svelte';
	import SettingRow from '#lib/settings/ui/SettingRow.svelte';
	import { DistanceUnit } from '#lib/shared/distance-unit.constants.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { WeekStart } from '#lib/shared/week-start.constants.ts';
	import { formatClock } from '#lib/ui/format.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();

	function change(changes: Partial<Preferences>): void {
		void preferences.change(changes);
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.navigation.tracking}
/>

<h2>{messages.preferences.tracking}</h2>
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

<style>
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
</style>
