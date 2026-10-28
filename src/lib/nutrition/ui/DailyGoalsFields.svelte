<script lang="ts">
	import UnitField from '../../design/UnitField.svelte';
	import { MACRO_KEYS } from './macro-key.constants.ts';
	import type { GoalsForm } from './daily-goals-editor.svelte.ts';
	import { MACRO_LABELS, MACRO_UNITS } from './nutrition-format.ts';

	/** Props for the four daily target fields. */
	interface Props {
		/** The typed targets; bind to it. */
		form: GoalsForm;
	}

	let { form = $bindable() }: Props = $props();

	const fields = MACRO_KEYS.map((key) => ({
		key,
		label: MACRO_LABELS[key],
		unit: MACRO_UNITS[key]
	}));
</script>

<div class="fields">
	{#each fields as field (field.key)}
		<UnitField
			label={field.label}
			unit={field.unit}
			bind:value={
				() => form[field.key], (value: string) => (form = { ...form, [field.key]: value })
			}
		/>
	{/each}
</div>

<style>
	.fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
	}
</style>
