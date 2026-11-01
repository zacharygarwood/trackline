<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { FieldEdges } from '#lib/design/button.constants.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { Exercise } from '#lib/training/domain/exercise.ts';
	import { canCreateExercise, capitalized } from '#lib/training/ui/exercise-search.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	let library: readonly Exercise[] | undefined = $state();
	let query = $state('');

	void getAppContext().then(async (app) => {
		library = await app.training.listExercises.execute();
	});
</script>

<PageHeader
	backHref={resolve(AppRoute.train)}
	backLabel={messages.shell.back(messages.home.workouts)}
	title={messages.navigation.exercises}
/>

{#if library !== undefined}
	{@const typed = query.trim().toLowerCase()}
	<SearchField label={messages.train.search} edges={FieldEdges.bottom} bind:value={query} />
	<ul aria-label={messages.navigation.exercises}>
		{#each library.filter((exercise) => exercise.name
				.toLowerCase()
				.includes(typed)) as exercise (exercise.id)}
			<li>
				<NavRow
					label={exercise.name}
					onclick={() => goto(resolve(AppRoute.editExercise), { state: { selected: exercise.id } })}
				/>
			</li>
		{/each}
	</ul>
	{#if canCreateExercise(query, library)}
		<button
			type="button"
			class="add"
			onclick={() =>
				goto(resolve(AppRoute.newExercise), { state: { name: query, toLibrary: true } })}
			>{messages.train.addNewExercise(capitalized(query))}</button
		>
	{/if}
{/if}

<style>
	.add {
		min-height: var(--row-height);
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-accent);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}
</style>
