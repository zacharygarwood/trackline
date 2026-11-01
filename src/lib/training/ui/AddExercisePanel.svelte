<script lang="ts">
	import { FieldEdges } from '../../design/button.constants.ts';
	import Icon from '../../design/Icon.svelte';
	import NavRow from '../../design/NavRow.svelte';
	import { IconWeight } from '../../design/icon.constants.ts';
	import SearchField from '../../design/SearchField.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { Exercise } from '../domain/exercise.ts';
	import { canCreateExercise, capitalized, matchExercises } from './exercise-search.ts';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for finding an exercise to add to the workout in progress, or naming a new one. */
	interface Props {
		session: WorkoutSession;
		onpick: (exercise: Exercise) => void;
		/** Opens the form for a new exercise with the typed name. */
		oncreate: (name: string) => void;
	}

	const { session, onpick, oncreate }: Props = $props();
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
					onclick={() => {
						onpick(match);
					}}
				>
					<span>{match.name}</span>
					<span class="plus"><Icon name="plus" weight={IconWeight.bold} /></span>
				</button>
			</li>
		{/each}
	</ul>
	{#if canCreateExercise(session.query, session.library)}
		<NavRow
			label={messages.exercise.createTitle(capitalized(session.query))}
			onclick={() => {
				oncreate(capitalized(session.query));
			}}
		/>
	{/if}
</div>

<style>
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
