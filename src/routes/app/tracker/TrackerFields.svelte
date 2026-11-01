<script lang="ts">
	import OptionList from '#lib/design/OptionList.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import SettingChoices from '#lib/settings/ui/SettingChoices.svelte';
	import {
		Combine,
		Direction,
		Measure,
		MEASURES_BY_SOURCE,
		Period,
		TrackerSource
	} from '#lib/trackers/domain/tracker.constants.ts';
	import { unitOf, type TrackerUnits } from '#lib/trackers/ui/tracker-format.ts';
	import type { TrackerForm } from '#lib/trackers/ui/tracker-form.svelte.ts';
	import TrackerField from './TrackerField.svelte';

	/** A food or exercise a tracker can measure. */
	interface Subject {
		readonly id: string;
		readonly name: string;
		/** A food's unit; empty for exercises. */
		readonly unit: string;
	}

	/** Props for the fields that build a tracker: where its numbers come from, what, and the goal. */
	interface Props {
		form: TrackerForm;
		foods: readonly Subject[];
		exercises: readonly Subject[];
		units: TrackerUnits;
	}

	const { form, foods, exercises, units }: Props = $props();
	const subjects = $derived(form.source === TrackerSource.food ? foods : exercises);
	const unit = $derived(unitOf(form, units));
	const options = <T extends string>(values: readonly T[], labels: Readonly<Record<T, string>>) =>
		values.map((value) => ({ value, label: labels[value] }));
</script>

<div class="fields">
	<div class="row">
		<span id="tracker-from">{messages.trackers.from}</span>
		<SettingChoices
			labelledBy="tracker-from"
			options={options(Object.values(TrackerSource), messages.trackers.sources)}
			value={form.source}
			onchoose={(source: TrackerSource) => {
				form.chooseSource(source);
			}}
		/>
	</div>

	{#if form.source !== TrackerSource.weight}
		<div>
			<p id="tracker-what" class="label">{messages.trackers.what}</p>
			<OptionList
				labelledBy="tracker-what"
				options={options(MEASURES_BY_SOURCE[form.source], messages.trackers.measures)}
				value={form.measure}
				onchoose={(measure: Measure) => {
					form.chooseMeasure(measure);
				}}
			/>
		</div>
	{/if}

	{#if form.needsSubject}
		<div class="field">
			<label for="tracker-subject">{messages.trackers.which(form.source)}</label>
			<select
				id="tracker-subject"
				value={form.subjectId ?? ''}
				onchange={(event) => {
					const chosen = subjects.find((subject) => subject.id === event.currentTarget.value);
					if (chosen !== undefined) form.chooseSubject(chosen);
				}}
			>
				<option value="" disabled>{messages.trackers.choose}</option>
				{#each subjects as subject (subject.id)}
					<option value={subject.id}>{subject.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<TrackerField
		id="tracker-name"
		label={messages.trackers.name}
		bind:value={
			() => form.name,
			(name: string) => {
				form.rename(name);
			}
		}
	/>

	{#if form.measure === Measure.number}
		<TrackerField
			id="tracker-unit"
			label={messages.trackers.unit}
			placeholder={messages.trackers.unitPlaceholder}
			bind:value={form.unit}
		/>
	{/if}

	<TrackerField
		id="tracker-goal"
		label={unit === '' ? messages.trackers.goal : messages.trackers.goalIn(unit)}
		numeric
		bind:value={form.goal}
	/>

	{#if form.measure !== Measure.weight}
		<div class="row">
			<span id="tracker-direction">{messages.trackers.direction}</span>
			<SettingChoices
				labelledBy="tracker-direction"
				options={options(Object.values(Direction), messages.trackers.directions)}
				value={form.direction}
				onchoose={(direction: Direction) => {
					form.direction = direction;
				}}
			/>
		</div>
		<div class="row">
			<span id="tracker-period">{messages.trackers.every}</span>
			<SettingChoices
				labelledBy="tracker-period"
				options={options(Object.values(Period), messages.trackers.periods)}
				value={form.period}
				onchoose={(period: Period) => {
					form.period = period;
				}}
			/>
		</div>
	{/if}

	{#if form.measure === Measure.number || form.measure === Measure.duration}
		<div class="row">
			<span id="tracker-combine">{messages.trackers.combine}</span>
			<SettingChoices
				labelledBy="tracker-combine"
				options={options([Combine.total, Combine.average], messages.trackers.combines)}
				value={form.combine}
				onchoose={(combine: Combine) => {
					form.combine = combine;
				}}
			/>
		</div>
	{/if}
</div>

<style>
	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.row span,
	.label,
	label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.label {
		margin-bottom: var(--space-2);
	}

	.field {
		display: flex;
		flex-direction: column;
	}

	select {
		height: var(--button-height);
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font: inherit;
		font-size: var(--font-size-20);
	}
</style>
