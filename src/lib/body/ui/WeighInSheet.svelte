<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import NumberPad from '../../design/NumberPad.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { MassUnit } from '../../shared/mass-unit.constants.ts';
	import { unitLabel } from '../../ui/format.ts';

	/** Props for the weigh-in sheet, which opens straight to a number pad. */
	interface Props {
		/** The sheet heading: "Weigh in" for today, or the day being edited. */
		title: string;
		/** The suggested weight, pre-selected so typing replaces it. */
		suggestion: string;
		/** The unit the user types in. */
		unit: MassUnit;
		/** Saves the entry; resolves to a message if it was rejected. */
		onsave: (entry: string) => Promise<string | undefined>;
		/** Deletes the weigh-in being edited; omit for a new weigh-in. */
		ondelete?: (() => Promise<void>) | undefined;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { title, suggestion, unit, onsave, ondelete, onclose }: Props = $props();

	const WEIGHT_LIMITS = { allowDecimal: true, maxIntegerDigits: 3, maxFractionDigits: 1 } as const;

	let open = $state(true);
	let entry = $state(untrack(() => suggestion));
	let selected = $state(untrack(() => suggestion !== ''));
	let problem: string | undefined = $state();

	$effect(() => {
		if (!open) onclose();
	});

	async function save(): Promise<void> {
		problem = await onsave(entry);
		if (problem === undefined) open = false;
	}

	async function remove(): Promise<void> {
		await ondelete?.();
		open = false;
	}
</script>

<Sheet bind:open {title}>
	<output class="reading" class:selected aria-live="polite">
		<span class="amount">{entry}</span>
		<span class="unit">{unitLabel(unit)}</span>
	</output>
	{#if problem !== undefined}
		<p class="problem" role="alert">{problem}</p>
	{/if}
	<NumberPad bind:value={entry} bind:selected limits={WEIGHT_LIMITS} />
	<Button onclick={save}>{messages.body.save}</Button>
	{#if ondelete !== undefined}
		<Button variant={ButtonVariant.quiet} onclick={remove}>{messages.body.deleteWeighIn}</Button>
	{/if}
</Sheet>

<style>
	.reading {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: var(--space-2);
		min-height: var(--space-12);
	}

	.amount {
		font-size: var(--font-size-display);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.selected .amount {
		border-radius: var(--radius-small);
		background: var(--color-surface);
	}

	.unit {
		color: var(--color-text-muted);
	}

	.problem {
		color: var(--color-text);
		text-align: center;
	}
</style>
