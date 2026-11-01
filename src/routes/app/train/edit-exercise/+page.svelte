<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { ExerciseEditor } from '#lib/training/ui/exercise-editor.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const toaster = getToaster();
	const libraryHref = resolve(AppRoute.exercises);
	let editor: ExerciseEditor | undefined = $state();

	void getAppContext().then(async (app) => {
		const exercise = (await app.training.listExercises.execute()).find(
			(known) => known.id === page.state.selected
		);
		if (exercise === undefined) {
			await goto(libraryHref, { replaceState: true });
			return;
		}
		editor = new ExerciseEditor(app.training, exercise);
	});

	async function rename(ready: ExerciseEditor): Promise<void> {
		if (!(await ready.rename())) return;
		toaster.show(messages.train.saved(ready.name.trim()));
		await goto(libraryHref);
	}

	async function remove(ready: ExerciseEditor): Promise<void> {
		const name = ready.name;
		if (!(await ready.delete())) return;
		toaster.show(messages.train.deleted(name));
		await goto(libraryHref);
	}
</script>

<PageHeader
	backHref={libraryHref}
	backLabel={messages.shell.back(messages.navigation.exercises)}
	title={messages.navigation.editExercise}
/>

{#if editor !== undefined}
	{@const ready = editor}
	<label for="exercise-name">{messages.train.name}</label>
	<input id="exercise-name" type="text" bind:value={ready.name} />
	{#if ready.problem !== undefined}
		<p class="problem" role="alert">{ready.problem}</p>
	{/if}
	<div class="actions">
		<Button onclick={() => rename(ready)}>{messages.train.save}</Button>
		<button type="button" class="delete" onclick={() => remove(ready)}
			>{messages.train.delete}</button
		>
	</div>
{/if}

<style>
	label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	input {
		width: 100%;
		height: var(--button-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-semibold);
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	.problem {
		margin-top: var(--space-3);
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.actions {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-6);
	}

	.delete {
		min-height: var(--row-height);
		border: none;
		background: transparent;
		color: var(--color-danger);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}
</style>
