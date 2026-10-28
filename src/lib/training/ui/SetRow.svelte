<script lang="ts">
	import Icon from '../../design/Icon.svelte';
	import Stepper from '../../design/Stepper.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { MAX_REPS, MIN_REPS } from '../domain/workout-set.ts';
	import { confirmWithVibration } from '../../ui/haptics.ts';
	import type { SetEntry } from './workout-session.svelte.ts';

	/** Props for one set in the workout: reps and weight steppers and a check mark. */
	interface Props {
		/** The set's number, starting at 1. */
		number: number;
		/** The set's values, with the weight in the user's unit. */
		entry: SetEntry;
		/** The weight unit's label, for example "kg". */
		unit: string;
		/** How much one tap changes the weight. */
		weightStep: number;
		/** The heaviest weight that can be entered. */
		maxWeight: number;
		/** Called with new reps. */
		onreps: (reps: number) => void;
		/** Called with a new weight, in the user's unit. */
		onweight: (weight: number) => void;
		/** Called to check the set off, or uncheck it. */
		ontoggle: () => void;
		/** Called to remove the set. */
		onremove: () => void;
	}

	const {
		number,
		entry,
		unit,
		weightStep,
		maxWeight,
		onreps,
		onweight,
		ontoggle,
		onremove
	}: Props = $props();

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
	<span class="number">{messages.training.setNumber(number)}</span>
	<Stepper
		label={messages.training.reps}
		bind:value={
			() => entry.reps,
			(reps: number) => {
				onreps(reps);
			}
		}
		range={{ min: MIN_REPS, max: MAX_REPS, step: 1 }}
	/>
	<Stepper
		label={messages.training.weight(unit)}
		bind:value={
			() => entry.weight,
			(weight: number) => {
				onweight(weight);
			}
		}
		range={{ min: 0, max: maxWeight, step: weightStep }}
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
		grid-template-areas:
			'number number remove'
			'reps weight check';
		grid-template-columns: 1fr 1fr auto;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		padding: var(--space-2) 0;
	}

	.number {
		grid-area: number;
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.check {
		grid-area: check;
	}

	.remove {
		grid-area: remove;
	}

	button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	button.check {
		background: var(--color-surface);
	}

	.completed .check {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
</style>
