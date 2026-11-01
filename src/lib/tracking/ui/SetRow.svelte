<script lang="ts">
	import Icon from '../../design/Icon.svelte';
	import StepButton from '../../design/StepButton.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { parseDecimal } from '../../ui/format.ts';
	import type { Entry } from '../domain/entry.ts';
	import type { Field, FieldKey, FieldValue, NumberField } from '../domain/field.ts';
	import { FieldType } from '../domain/tracking.constants.ts';
	import { unitText, type DisplayUnits } from './display-units.ts';
	import { shownText, stepOf } from './entry-drafts.ts';
	import { EntryForm } from './entry-form.svelte.ts';

	/** Props for one set of an exercise: its number, a compact control per value, and delete. */
	interface Props {
		set: Entry;
		/** The set's place in the exercise, from 1. */
		number: number;
		/** The fields the exercise fills, in order. */
		fields: readonly Field[];
		units: DisplayUnits;
		onchange: (values: ReadonlyMap<FieldKey, FieldValue>) => void;
		ondelete: () => void;
	}

	const { set, number, fields, units, onchange, ondelete }: Props = $props();
	const UP = 1;
	const DOWN = -1;
	const form = $derived(new EntryForm(fields, units, set.values));

	function commit(): void {
		const values = form.values();
		if (values.ok) onchange(values.value);
	}

	function step(field: NumberField, direction: number): void {
		const draft = form.drafts[field.key];
		if (draft?.type !== FieldType.number) return;
		const current = parseDecimal(draft.text) ?? 0;
		draft.text = shownText(Math.max(0, current + direction * stepOf(field, units)));
		commit();
	}
</script>

<div class="set">
	<span class="number">{number}</span>
	<div class="values">
		{#each fields as field (field.key)}
			{@const draft = form.drafts[field.key]}
			{#if field.type === FieldType.number && draft?.type === FieldType.number}
				<div class="value">
					<StepButton
						label={messages.tracking.inputs.less(field.label)}
						symbol="−"
						onclick={() => {
							step(field, DOWN);
						}}
					/>
					<label>
						<input
							type="text"
							inputmode="decimal"
							autocomplete="off"
							bind:value={draft.text}
							onchange={commit}
						/>
						<span>{unitText(field, units, parseDecimal(draft.text))}</span>
					</label>
					<StepButton
						label={messages.tracking.inputs.more(field.label)}
						symbol="+"
						onclick={() => {
							step(field, UP);
						}}
					/>
				</div>
			{:else if draft?.type === FieldType.duration}
				<div class="value">
					<label>
						<input type="text" inputmode="numeric" bind:value={draft.minutes} onchange={commit} />
						<span>{messages.tracking.inputs.minutes}</span>
					</label>
					<label>
						<input type="text" inputmode="numeric" bind:value={draft.seconds} onchange={commit} />
						<span>{messages.tracking.inputs.seconds}</span>
					</label>
				</div>
			{/if}
		{/each}
	</div>
	<button
		type="button"
		class="delete"
		aria-label={messages.tracking.workout.deleteSet(number)}
		onclick={ondelete}
	>
		<Icon name="close" />
	</button>
</div>

<style>
	.set {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.number {
		width: var(--space-6);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.values {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.value {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	label {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-12);
	}

	input {
		width: var(--amount-field-width);
		height: var(--control-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-bold);
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	.delete {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		--icon-size: var(--icon-size-small);
	}
</style>
