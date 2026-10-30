<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { FieldEdges } from '#lib/design/button.constants.ts';
	import Icon from '#lib/design/Icon.svelte';
	import { IconWeight } from '#lib/design/icon.constants.ts';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { ExerciseForm } from '#lib/training/ui/exercise-form.svelte.ts';
	import NewExerciseForm from '#lib/training/ui/NewExerciseForm.svelte';
	import { WorkoutBuilder } from '#lib/training/ui/workout-builder.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const toaster = getToaster();
	const trainHref = resolve(AppRoute.train);
	let builder: WorkoutBuilder | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new WorkoutBuilder(app.training);
		await next.load();
		builder = next;
	});

	async function save(ready: WorkoutBuilder): Promise<void> {
		const name = await ready.save();
		if (name === undefined) return;
		toaster.show(messages.train.saved(name));
		await goto(trainHref);
	}
</script>

{#if builder !== undefined}
	{@const ready = builder}
	<div class="bar">
		<a href={trainHref}>{messages.train.builderBack}</a>
		<button type="button" class="save" disabled={!ready.canSave} onclick={() => save(ready)}
			>{messages.train.save}</button
		>
	</div>
	<h1>{messages.train.newWorkout}</h1>
	<label for="workout-name">{messages.train.name}</label>
	<input
		id="workout-name"
		type="text"
		placeholder={messages.train.namePlaceholder}
		bind:value={ready.name}
	/>

	<h2>{messages.train.exercises}</h2>
	<ol class="chosen" aria-label={messages.train.inThisWorkout}>
		{#each ready.chosen as exercise, position (position)}
			<li>
				<span class="number">{position + 1}</span>
				<span class="name">{exercise.name}</span>
				<button
					type="button"
					aria-label={messages.train.remove(exercise.name)}
					onclick={() => {
						ready.remove(position);
					}}><Icon name="close" weight={IconWeight.bold} /></button
				>
			</li>
		{/each}
	</ol>
	<SearchField label={messages.train.search} edges={FieldEdges.bottom} bind:value={ready.query} />
	<ul class="matches" aria-label={messages.train.toAdd}>
		{#each ready.matches as match (match.id)}
			<li>
				<button
					type="button"
					aria-label={messages.train.addToThisWorkout(match.name)}
					onclick={() => {
						ready.add(match);
					}}
				>
					<span>{match.name}</span>
					<span class="plus"><Icon name="plus" weight={IconWeight.bold} /></span>
				</button>
			</li>
		{/each}
	</ul>
	{#if ready.canCreate}
		<NewExerciseForm
			name={ready.newName}
			saveLabel={messages.exercise.saveToBuilder}
			onsave={(form: ExerciseForm) => ready.create(form.tracking)}
		/>
	{/if}
{/if}

<style>
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: calc(-1 * var(--space-2)) 0 var(--space-2);
	}

	.bar a {
		display: flex;
		align-items: center;
		min-height: var(--tap-target);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.save {
		min-height: var(--tap-target);
		padding: 0 0 0 var(--space-3);
		border: none;
		background: transparent;
		color: var(--color-accent);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-semibold);
	}

	.save:disabled {
		opacity: 0.35;
	}

	h1 {
		margin-bottom: var(--space-6);
		font-size: var(--font-size-34);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-title);
	}

	label,
	h2 {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	#workout-name {
		width: 100%;
		height: var(--button-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-26);
		font-weight: var(--font-weight-semibold);
	}

	#workout-name:focus-visible {
		border-bottom-color: var(--color-text);
	}

	h2 {
		margin-top: var(--space-8);
		padding-bottom: var(--space-2);
	}

	.chosen,
	.matches {
		margin: 0 calc(-1 * var(--gutter));
	}

	.chosen {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.chosen li {
		display: flex;
		align-items: center;
		gap: var(--gap-14);
		min-height: var(--row-height);
		padding: 0 var(--space-2) 0 var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.number {
		width: var(--space-5);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.name {
		flex: 1;
		font-size: var(--font-size-18);
	}

	.chosen li button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		--icon-size: var(--icon-size-small);
	}

	.matches li {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.matches li button {
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

	.matches li button:hover {
		background: var(--color-hover);
	}

	.plus {
		display: flex;
		color: var(--color-accent);
		--icon-size: var(--icon-size-small);
	}
</style>
