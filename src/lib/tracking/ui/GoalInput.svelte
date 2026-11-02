<script lang="ts">
	import ChipGroup from '../../design/ChipGroup.svelte';
	import SegmentedControl from '../../design/SegmentedControl.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { FieldKey } from '../domain/field.ts';
	import { isOnceADay, type GoalMeasure } from '../domain/goal-parts.ts';
	import { Direction, GoalType, Period } from '../domain/tracking.constants.ts';
	import type { DisplayUnits } from './display-units.ts';
	import FieldInput from './FieldInput.svelte';
	import type { GoalEditor } from './goal-editor.svelte.ts';
	import { goalText } from './value-format.ts';

	/**
	 * Props for building a tracker's goal from simple choices: what counts, of
	 * which field, every day, week, or month, at least or at most, and the target.
	 */
	interface Props {
		editor: GoalEditor;
		units: DisplayUnits;
		/** Shows only the target and how the goal reads, such as during onboarding; a once-a-day goal has no target to show. */
		simple?: boolean;
	}

	const { editor, units, simple = false }: Props = $props();
	const preview = $derived(editor.goal());
	const nothingToChoose = $derived(simple && preview.ok && isOnceADay(preview.value));
	const { edit } = messages.tracking;
</script>

<div class="goal">
	{#if !simple}
		<ChipGroup
			label={edit.goalType}
			options={editor.measures.map((measure) => ({
				value: measure,
				label: edit.goalKinds[measure]
			}))}
			value={editor.measure}
			onchoose={(measure: GoalMeasure) => {
				editor.chooseMeasure(measure);
			}}
		/>

		{#if editor.fields.length > 1}
			<ChipGroup
				label={edit.goalUnit}
				options={editor.fields.map((field) => ({ value: field.key, label: field.label }))}
				value={editor.field}
				onchoose={(key: FieldKey) => {
					editor.chooseField(key);
				}}
			/>
		{/if}

		{#if editor.measure !== GoalType.target}
			<SegmentedControl
				label={edit.goalEvery}
				options={Object.values(Period).map((period) => ({
					value: period,
					label: edit.goalPeriods[period]
				}))}
				value={editor.period}
				onchange={(period: Period) => (editor.period = period)}
			/>
			<SegmentedControl
				label={edit.goalTarget}
				options={Object.values(Direction).map((direction) => ({
					value: direction,
					label: edit.goalDirections[direction]
				}))}
				value={editor.direction}
				onchange={(direction: Direction) => (editor.direction = direction)}
			/>
		{/if}
	{/if}

	{#if !nothingToChoose}
		{#key `${editor.measure}-${editor.field ?? ''}`}
			<FieldInput
				field={{ ...editor.input, label: edit.goalAmount }}
				draft={editor.draft}
				{units}
			/>
		{/key}
	{/if}
	{#if preview.ok}
		<p class="preview">{goalText({ fields: editor.tracker.fields, goal: preview.value }, units)}</p>
	{/if}
</div>

<style>
	.goal {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.preview {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}
</style>
