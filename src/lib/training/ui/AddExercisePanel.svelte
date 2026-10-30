<script lang="ts">
	import { FieldEdges } from '../../design/button.constants.ts';
	import Icon from '../../design/Icon.svelte';
	import { IconWeight } from '../../design/icon.constants.ts';
	import SearchField from '../../design/SearchField.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { ExerciseForm } from './exercise-form.svelte.ts';
	import { canCreateExercise, capitalized, matchExercises } from './exercise-search.ts';
	import NewExerciseForm from './NewExerciseForm.svelte';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for finding or creating an exercise to add to the workout in progress. */
	interface Props {
		session: WorkoutSession;
	}

	const { session }: Props = $props();
	let input: HTMLInputElement | undefined = $state();

	$effect(() => {
		input?.focus();
	});
</script>

<div class="adding">
	<SearchField
		label={messages.train.search}
		edges={FieldEdges.both}
		bind:value={session.query}
		bind:input
	/>
	<ul aria-label={messages.train.exercises}>
		{#each matchExercises(session.query, session.library) as match (match.id)}
			<li>
				<button
					type="button"
					aria-label={messages.train.addExerciseTo(match.name, session.name)}
					onclick={() => session.add(match)}
				>
					<span>{match.name}</span>
					<span class="plus"><Icon name="plus" weight={IconWeight.bold} /></span>
				</button>
			</li>
		{/each}
	</ul>
	{#if canCreateExercise(session.query, session.library)}
		<NewExerciseForm
			name={capitalized(session.query)}
			saveLabel={messages.exercise.saveToWorkout}
			onsave={(form: ExerciseForm) => session.create(form.tracking)}
		/>
	{/if}
</div>

<style>
	.adding {
		animation: rise var(--duration-rise) ease-out;
	}

	ul {
		margin: 0 calc(-1 * var(--gutter));
	}

	li {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: var(--row-height);
		padding: 0 var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-18);
		text-align: left;
	}

	button:hover {
		background: var(--color-hover);
	}

	.plus {
		display: flex;
		color: var(--color-accent);
		--icon-size: var(--icon-size-small);
	}
</style>
