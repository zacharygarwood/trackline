<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import type { Exercise } from '../domain/exercise.ts';
	import { TrackedField } from '../domain/tracking.constants.ts';
	import { tracks } from '../domain/tracking.ts';
	import { stepOf, type SetDraft, type SteppedField } from './set-draft.ts';
	import StepperField from './StepperField.svelte';
	import { countLabel, plainNumber, type TrainingUnits } from './workout-format.ts';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for the stepper rows of the exercise being logged. */
	interface Props {
		session: WorkoutSession;
		exercise: Exercise;
		draft: SetDraft;
		units: TrainingUnits;
	}

	const { session, exercise, draft, units }: Props = $props();

	const STEPPED: readonly { field: SteppedField; tracked: TrackedField }[] = [
		{ field: 'weight', tracked: TrackedField.weight },
		{ field: 'reps', tracked: TrackedField.reps },
		{ field: 'distance', tracked: TrackedField.distance },
		{ field: 'count', tracked: TrackedField.count }
	];

	function labels(field: SteppedField): { label: string; less: string; more: string } {
		const step = plainNumber(stepOf(field, units.mass));
		switch (field) {
			case 'weight':
				return {
					label: units.mass,
					less: messages.workout.less(step, units.mass),
					more: messages.workout.more(step, units.mass)
				};
			case 'reps':
				return {
					label: messages.workout.reps,
					less: messages.workout.oneRepLess,
					more: messages.workout.oneRepMore
				};
			case 'distance':
				return {
					label: units.distance,
					less: messages.workout.less(step, units.distance),
					more: messages.workout.more(step, units.distance)
				};
			case 'count':
				return {
					label: countLabel(exercise),
					less: messages.workout.oneLess,
					more: messages.workout.oneMore
				};
		}
	}

	const rows = $derived(
		STEPPED.filter((row) => tracks(exercise.tracking, row.tracked)).map((row) => ({
			field: row.field,
			...labels(row.field)
		}))
	);
</script>

{#if rows.length > 0}
	<div class="fields">
		{#each rows as row (row.field)}
			<StepperField
				label={row.label}
				value={draft[row.field]}
				lessLabel={row.less}
				moreLabel={row.more}
				oninput={(text: string) => {
					session.type(exercise.id, row.field, text);
				}}
				onstep={(direction: number) => {
					session.step(exercise.id, row.field, direction);
				}}
			/>
		{/each}
	</div>
{/if}

<style>
	.fields {
		display: flex;
		flex-direction: column;
		margin: 0 calc(-1 * var(--gutter));
		border-top: var(--border-hairline) solid var(--color-divider);
	}
</style>
