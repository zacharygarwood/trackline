<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import NumberPad from '../../design/NumberPad.svelte';
	import SegmentedControl from '../../design/SegmentedControl.svelte';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { MassUnit } from '../../shared/mass-unit.constants.ts';
	import { unitLabel } from '../../ui/format.ts';
	import { GoalDirection } from '../domain/goal-direction.constants.ts';
	import { DIRECTION_LABELS, type WeightGoalEditor } from './weight-goal-editor.svelte.ts';

	/** Props for the sheet that sets the goal weight. */
	interface Props {
		/** The editor holding the current goal. */
		editor: WeightGoalEditor;
		/** The unit the user types in. */
		unit: MassUnit;
		/** Called once the sheet has closed. */
		onclose: () => void;
	}

	const { editor, unit, onclose }: Props = $props();

	const TARGET_LIMITS = { allowDecimal: true, maxIntegerDigits: 3, maxFractionDigits: 1 } as const;
	const directions = Object.values(GoalDirection).map((value) => ({
		value,
		label: DIRECTION_LABELS[value]
	}));

	let open = $state(true);
	let entry = $state(untrack(() => editor.suggestion(unit)));
	let selected = $state(untrack(() => editor.goal !== undefined));
	let direction: GoalDirection = $state(
		untrack(() => editor.goal?.direction ?? GoalDirection.lose)
	);
	let problem: string | undefined = $state();

	$effect(() => {
		if (!open) onclose();
	});

	async function save(): Promise<void> {
		problem = await editor.save(entry, direction, unit);
		if (problem === undefined) open = false;
	}

	async function remove(): Promise<void> {
		await editor.remove();
		open = false;
	}
</script>

<Sheet bind:open title={messages.body.goalWeight}>
	<SegmentedControl label={messages.body.direction} options={directions} bind:value={direction} />
	<output class="reading" aria-live="polite">
		<span class="amount">{entry}</span>
		<span class="unit">{unitLabel(unit)}</span>
	</output>
	{#if problem !== undefined}
		<p role="alert">{problem}</p>
	{/if}
	<NumberPad bind:value={entry} bind:selected limits={TARGET_LIMITS} />
	<Button onclick={save}>{messages.body.save}</Button>
	{#if editor.goal !== undefined}
		<Button variant={ButtonVariant.quiet} onclick={remove}>{messages.body.removeGoal}</Button>
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

	.unit {
		color: var(--color-text-muted);
	}
</style>
