<script lang="ts">
	import { InputMode } from './html.constants.ts';
	import { parseNumberEntry, type NumberRange } from './number-entry.ts';

	/** Props for a compact number field that commits when the user leaves it. */
	interface Props {
		/** What the number is, for example "Reps". */
		label: string;
		/** The current value; bind to it. */
		value: number;
		/** Allowed values; a whole step brings up the numeric keyboard. */
		range: NumberRange;
	}

	let { label, value = $bindable(), range }: Props = $props();

	const inputMode = $derived(Number.isInteger(range.step) ? InputMode.numeric : InputMode.decimal);

	let draft: string | undefined = $state();

	function commit(): void {
		value = parseNumberEntry(draft ?? '', range) ?? value;
		draft = undefined;
	}
</script>

<input
	type="text"
	inputmode={inputMode}
	aria-label={label}
	value={draft ?? String(value)}
	oninput={(event) => (draft = event.currentTarget.value)}
	onchange={commit}
	onfocus={(event) => {
		event.currentTarget.select();
	}}
/>

<style>
	input {
		width: 100%;
		min-height: var(--tap-target);
		padding: 0 var(--space-2);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
		font-size: var(--font-size-body);
		text-align: center;
	}
</style>
