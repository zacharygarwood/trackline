<script lang="ts">
	import { ARIA_CURRENT_STEP } from '../../design/html.constants.ts';
	import Icon from '../../design/Icon.svelte';
	import { IconWeight } from '../../design/icon.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';

	/** One exercise of the workout as a chip. */
	interface Chip {
		readonly name: string;
		readonly done: boolean;
		readonly current: boolean;
	}

	/** Props for the row of exercise chips at the top of the workout, with + to add another. */
	interface Props {
		chips: readonly Chip[];
		onselect: (position: number) => void;
		onadd: () => void;
	}

	const { chips, onselect, onadd }: Props = $props();
</script>

<div class="chips" role="group" aria-label={messages.train.exercises}>
	{#each chips as chip, position (position)}
		<button
			type="button"
			class="chip"
			class:current={chip.current}
			class:done={chip.done}
			aria-current={chip.current ? ARIA_CURRENT_STEP : undefined}
			aria-label={chip.done ? messages.workout.chipDone(chip.name) : chip.name}
			onclick={() => {
				onselect(position);
			}}
		>
			{#if chip.done}<span class="check"><Icon name="check" weight={IconWeight.heavy} /></span>{/if}
			{chip.name}
		</button>
	{/each}
	<button type="button" class="add" aria-label={messages.workout.addExercise} onclick={onadd}>
		<Icon name="plus" weight={IconWeight.bold} />
	</button>
</div>

<style>
	.chips {
		display: flex;
		gap: var(--chip-gap);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-1) var(--gutter) var(--space-5);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.chip {
		display: flex;
		flex: none;
		align-items: center;
		gap: var(--chip-gap);
		height: var(--tap-target);
		padding: 0 var(--gap-14);
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
	}

	.chip.done {
		color: var(--color-text-muted);
	}

	.check {
		display: flex;
		color: var(--color-accent);
		--icon-size: var(--gap-14);
	}

	.chip.current {
		border-color: var(--color-text);
		background: var(--color-text);
		color: var(--color-background);
	}

	.chip.current .check {
		color: var(--color-background);
	}

	.add {
		display: grid;
		flex: none;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		padding: 0;
		border: var(--border-control) dashed var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		--icon-size: var(--icon-size-small);
	}
</style>
