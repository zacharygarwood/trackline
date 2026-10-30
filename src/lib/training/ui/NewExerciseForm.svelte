<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ChoiceSize } from '../../design/button.constants.ts';
	import Choice from '../../design/Choice.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { GradeScale, TrackedField } from '../domain/tracking.constants.ts';
	import { ExerciseForm, FORM_FIELDS, GRADE_SCALES } from './exercise-form.svelte.ts';

	/** Props for the inline form that turns a search into a new exercise. */
	interface Props {
		/** The new exercise's name. */
		name: string;
		/** The save button's label, which says where the exercise goes. */
		saveLabel: string;
		/** Saves the exercise; the form clears afterwards. */
		onsave: (form: ExerciseForm) => Promise<void> | void;
	}

	const { name, saveLabel, onsave }: Props = $props();
	const form = new ExerciseForm();
	const id = $props.id();

	async function save(): Promise<void> {
		await onsave(form);
		form.reset();
	}
</script>

<section class="new-exercise" aria-labelledby="{id}-title">
	<h3 id="{id}-title">{messages.exercise.createTitle(name)}</h3>
	<p id="{id}-track" class="label">{messages.exercise.track}</p>
	<div class="choices" role="group" aria-labelledby="{id}-track">
		{#each FORM_FIELDS as field (field)}
			<Choice
				size={ChoiceSize.large}
				pressed={form.fields.includes(field)}
				onclick={() => {
					form.toggle(field);
				}}>{messages.exercise.fields[field]}</Choice
			>
		{/each}
	</div>
	{#if form.fields.includes(TrackedField.grade)}
		<p id="{id}-scale" class="label grades">{messages.exercise.grades}</p>
		<div class="choices" role="group" aria-labelledby="{id}-scale">
			{#each GRADE_SCALES as scale (scale)}
				<Choice
					size={ChoiceSize.large}
					pressed={form.scale === scale}
					onclick={() => (form.scale = scale)}>{messages.exercise.scales[scale]}</Choice
				>
			{/each}
		</div>
		<p class="preview">{form.scalePreview}</p>
		{#if form.scale === GradeScale.custom}
			<label class="field">
				{messages.exercise.customGrades}
				<input
					type="text"
					bind:value={form.customGrades}
					placeholder={messages.exercise.customPlaceholder}
				/>
			</label>
		{/if}
	{/if}
	{#if form.fields.includes(TrackedField.count)}
		<label class="field counted">
			{messages.exercise.countLabel}
			<input
				type="text"
				bind:value={form.countLabel}
				placeholder={messages.exercise.countPlaceholder}
			/>
		</label>
	{/if}
	<Button disabled={!form.ready} onclick={save}>{saveLabel}</Button>
</section>

<style>
	.new-exercise {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-top: var(--space-6);
		animation: rise var(--duration-sheet) ease-out;
	}

	h3 {
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-semibold);
	}

	.label {
		margin-top: var(--space-1);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.grades {
		margin-top: var(--space-2);
	}

	.choices {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.preview {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--chip-gap);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.counted {
		margin-top: var(--space-2);
	}

	input {
		height: var(--field-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-18);
		font-weight: var(--font-weight-regular);
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}
</style>
