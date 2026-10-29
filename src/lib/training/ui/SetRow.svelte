<script lang="ts">
	import Icon from '../../design/Icon.svelte';
	import NumberField from '../../design/NumberField.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { MAX_REPS, MIN_REPS } from '../domain/workout-set.ts';
	import { confirmWithVibration } from '../../ui/haptics.ts';
	import { MAX_SET_WEIGHT, WEIGHT_PRECISION } from './weight-step.constants.ts';
	import type { SetEntry } from './workout-session.svelte.ts';

	/** Props for one line of the set table: number, weight, reps, check, and remove. */
	interface Props {
		/** The set's number, starting at 1. */
		number: number;
		/** The set's values, with the weight in the user's unit. */
		entry: SetEntry;
		/** The weight unit's label, for example "kg". */
		unit: string;
		/** Called with new reps. */
		onreps: (reps: number) => void;
		/** Called with a new weight, in the user's unit. */
		onweight: (weight: number) => void;
		/** Called to check the set off, or uncheck it. */
		ontoggle: () => void;
		/** Called to remove the set. */
		onremove: () => void;
	}

	const { number, entry, unit, onreps, onweight, ontoggle, onremove }: Props = $props();

	function toggleCompleted(): void {
		if (!entry.completed) confirmWithVibration();
		ontoggle();
	}
</script>

<div
	class="set"
	class:completed={entry.completed}
	role="group"
	aria-label={messages.training.setNumber(number)}
>
	<span class="number" aria-hidden="true">{number}</span>
	<NumberField
		label={messages.training.weight(unit)}
		bind:value={
			() => entry.weight,
			(weight: number) => {
				onweight(weight);
			}
		}
		range={{ min: 0, max: MAX_SET_WEIGHT, step: WEIGHT_PRECISION }}
	/>
	<NumberField
		label={messages.training.reps}
		bind:value={
			() => entry.reps,
			(reps: number) => {
				onreps(reps);
			}
		}
		range={{ min: MIN_REPS, max: MAX_REPS, step: 1 }}
	/>
	<button
		type="button"
		class="check"
		aria-label={messages.training.completeSet(number)}
		aria-pressed={entry.completed}
		onclick={toggleCompleted}
	>
		<Icon name="check" />
	</button>
	<button
		type="button"
		class="remove"
		aria-label={messages.training.removeSet(number)}
		onclick={onremove}
	>
		<Icon name="close" />
	</button>
</div>

<style>
	.set {
		display: grid;
		grid-template-columns: var(--space-6) 1fr 1fr var(--tap-target) var(--tap-target);
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) 0;
	}

	.number {
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		text-align: center;
	}

	button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		padding: 0;
		border: none;
		border-radius: var(--radius-small);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		--icon-size: 20px;
	}

	.check {
		border: var(--border-hairline) solid var(--color-divider);
		background: var(--color-surface);
	}

	.completed .check {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
</style>
