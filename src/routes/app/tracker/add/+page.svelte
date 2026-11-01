<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { Measure } from '#lib/trackers/domain/tracker.constants.ts';
	import { formatTrackerNumber, unitOf } from '#lib/trackers/ui/tracker-format.ts';
	import { PRESETS, type PresetName } from '#lib/trackers/ui/tracker-presets.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	const names = Object.keys(PRESETS).filter((name): name is PresetName => name in PRESETS);

	function summary(name: PresetName): string {
		const preset = PRESETS[name];
		if (preset.measure === Measure.weight) return messages.trackers.weightPreset;
		return messages.trackers.presetSummary(
			formatTrackerNumber(preset.goal),
			unitOf(preset, units),
			messages.trackers.perPeriod[preset.period]
		);
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.settingsHome)}
	backLabel={messages.shell.back(messages.navigation.homeScreen)}
	title={messages.trackers.addTracker}
/>

<NavRow label={messages.trackers.buildYourOwn} onclick={() => goto(resolve(AppRoute.tracker))} />

<h2 id="presets">{messages.trackers.presetsHeading}</h2>
<ul aria-labelledby="presets">
	{#each names as name (name)}
		<li>
			<NavRow
				label={messages.trackers.presets[name]}
				value={summary(name)}
				onclick={() => goto(resolve(AppRoute.tracker), { state: { preset: name } })}
			/>
		</li>
	{/each}
</ul>

<style>
	h2 {
		margin: var(--space-6) 0 var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
