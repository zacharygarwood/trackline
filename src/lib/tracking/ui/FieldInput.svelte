<script lang="ts">
	import Choice from '../../design/Choice.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { MAX_STARS, type Field } from '../domain/field.ts';
	import { FieldType } from '../domain/tracking.constants.ts';
	import { unitText, type DisplayUnits } from './display-units.ts';
	import { parseDecimal } from '../../ui/format.ts';
	import { shownText, stepOf, type FieldDraft } from './entry-drafts.ts';
	import PhotoImage from './PhotoImage.svelte';
	import StepperField from './StepperField.svelte';

	/** Props for the input that fills one field of an entry, made for the field's type. */
	interface Props {
		field: Field;
		/** The field's draft; the input changes it in place. */
		draft: FieldDraft;
		units: DisplayUnits;
		/** Called with a chosen photo's bytes, for a photo field. */
		onphoto?: (image: Uint8Array) => void;
		/** The chosen photo's thumbnail URL, for a photo field. */
		photoUrl?: Promise<string | undefined> | undefined;
	}

	const { field, draft, units, onphoto, photoUrl }: Props = $props();
	const id = $props.id();
	const STARS = Array.from({ length: MAX_STARS }, (_, index) => index + 1);
	const label = $derived(
		field.required ? field.label : messages.tracking.inputs.optional(field.label)
	);

	function step(direction: number): void {
		if (draft.type !== FieldType.number || field.type !== FieldType.number) return;
		const current = parseDecimal(draft.text) ?? 0;
		draft.text = shownText(Math.max(0, current + direction * stepOf(field, units)));
	}

	function type(text: string): void {
		if (draft.type === FieldType.number) draft.text = text;
	}

	async function choosePhoto(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
		const input = event.currentTarget;
		const file = input.files?.item(0);
		if (file === null || file === undefined) return;
		onphoto?.(new Uint8Array(await file.arrayBuffer()));
		input.value = '';
	}
</script>

{#if draft.type === FieldType.number && field.type === FieldType.number}
	<p class="label" id="{id}-label">{label}</p>
	<StepperField
		label={unitText(field, units)}
		value={draft.text}
		lessLabel={messages.tracking.inputs.less(field.label)}
		moreLabel={messages.tracking.inputs.more(field.label)}
		oninput={type}
		onstep={step}
	/>
{:else if draft.type === FieldType.duration}
	<fieldset>
		<legend class="label">{label}</legend>
		<div class="duration">
			<label>
				<input type="text" inputmode="numeric" autocomplete="off" bind:value={draft.hours} />
				<span>{messages.tracking.inputs.hours}</span>
			</label>
			<label>
				<input type="text" inputmode="numeric" autocomplete="off" bind:value={draft.minutes} />
				<span>{messages.tracking.inputs.minutes}</span>
			</label>
			<label>
				<input type="text" inputmode="numeric" autocomplete="off" bind:value={draft.seconds} />
				<span>{messages.tracking.inputs.seconds}</span>
			</label>
		</div>
	</fieldset>
{:else if draft.type === FieldType.note}
	<label class="label" for={id}>{label}</label>
	<textarea
		{id}
		rows="3"
		placeholder={messages.tracking.inputs.notePlaceholder}
		bind:value={draft.text}></textarea>
{:else if draft.type === FieldType.photo}
	<p class="label">{label}</p>
	{#if photoUrl !== undefined}
		<div class="preview"><PhotoImage src={photoUrl} alt={field.label} whole /></div>
	{/if}
	<label class="photo">
		<input type="file" accept="image/*" onchange={choosePhoto} />
		<span>
			{photoUrl === undefined
				? messages.tracking.inputs.takePhoto
				: messages.tracking.inputs.retakePhoto}
		</span>
	</label>
{:else if draft.type === FieldType.check}
	<div class="choices" role="group" aria-label={field.label}>
		<Choice
			pressed={draft.picked !== undefined}
			onclick={() => {
				draft.picked = draft.picked === undefined ? { type: FieldType.check } : undefined;
			}}>{field.label}</Choice
		>
	</div>
{:else if draft.type === FieldType.rating}
	<p class="label" id="{id}-label">{label}</p>
	<div class="choices" role="group" aria-labelledby="{id}-label">
		{#each STARS as stars (stars)}
			<Choice
				joined
				pressed={draft.picked?.type === FieldType.rating && draft.picked.stars === stars}
				ariaLabel={messages.tracking.values.starsLabel(stars)}
				onclick={() => (draft.picked = { type: FieldType.rating, stars })}>{stars}</Choice
			>
		{/each}
	</div>
{:else if draft.type === FieldType.choice && field.type === FieldType.choice}
	<p class="label" id="{id}-label">{label}</p>
	<div class="choices" role="group" aria-labelledby="{id}-label">
		{#each field.options as option (option)}
			<Choice
				joined
				pressed={draft.picked?.type === FieldType.choice && draft.picked.option === option}
				onclick={() => (draft.picked = { type: FieldType.choice, option })}>{option}</Choice
			>
		{/each}
	</div>
{/if}

<style>
	.label {
		margin-top: var(--space-6);
		padding: 0 0 var(--space-2);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	fieldset {
		margin: 0;
		padding: 0;
		border: none;
	}

	.duration {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.duration label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-13);
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font: inherit;
	}

	input[type='text'] {
		height: var(--button-height);
		font-size: var(--font-size-26);
		font-weight: var(--font-weight-bold);
		font-variant-numeric: tabular-nums;
	}

	textarea {
		padding: var(--space-2) 0;
		font-size: var(--font-size-17);
		resize: vertical;
	}

	input[type='text']:focus-visible,
	textarea:focus-visible {
		border-bottom-color: var(--color-text);
	}

	textarea::placeholder {
		color: var(--color-placeholder);
	}

	.choices {
		display: flex;
		margin-top: var(--space-2);
	}

	.preview {
		margin-bottom: var(--space-3);
	}

	.photo {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--button-height);
		border: var(--border-control) solid var(--color-edge);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.photo:focus-within {
		outline: var(--focus-ring-width) solid var(--color-accent);
	}

	.photo input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
</style>
