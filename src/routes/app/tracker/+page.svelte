<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import Button from '#lib/design/Button.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { Tracker } from '#lib/trackers/domain/tracker.ts';
	import { TrackerForm } from '#lib/trackers/ui/tracker-form.svelte.ts';
	import { isPresetName } from '#lib/trackers/ui/tracker-presets.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { loadTrackers, shareGoal } from '../trackers.ts';
	import TrackerFields from './TrackerFields.svelte';

	const preferences = getPreferences();
	const toaster = getToaster();
	const backHref = resolve(AppRoute.settingsHome);
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	const selected = page.state.selected;
	const form = new TrackerForm();
	let app: App | undefined = $state();
	let editing: Tracker | undefined = $state();
	let foods: readonly { id: string; name: string; unit: string }[] = $state([]);
	let exercises: readonly { id: string; name: string; unit: string }[] = $state([]);
	let invalid = $state(false);

	void getAppContext().then(async (ready) => {
		const [progress, foodList, exerciseList] = await Promise.all([
			loadTrackers(ready, preferences),
			ready.nutrition.listFoods.execute(),
			ready.training.listExercises.execute()
		]);
		editing = progress.find((item) => item.tracker.id === selected)?.tracker;
		if (selected !== undefined && editing === undefined) {
			await goto(backHref, { replaceState: true });
			return;
		}
		if (editing !== undefined) form.fill(editing, units);
		else if (isPresetName(page.state.preset)) form.usePreset(page.state.preset);
		foods = foodList.map((food) => ({ id: food.id, name: food.name, unit: food.reference.unit }));
		exercises = exerciseList.map((exercise) => ({
			id: exercise.id,
			name: exercise.name,
			unit: ''
		}));
		app = ready;
	});

	async function save(ready: App): Promise<void> {
		const command = form.toCommand(units);
		const saved = await ready.trackers.saveTracker.execute(
			editing === undefined ? command : { ...command, id: editing.id }
		);
		invalid = !saved.ok;
		if (!saved.ok) return;
		await shareGoal(ready, saved.value);
		toaster.show(messages.trackers.saved(saved.value.name));
		await goto(backHref);
	}

	async function remove(ready: App, tracker: Tracker): Promise<void> {
		await ready.trackers.deleteTracker.execute({ id: tracker.id });
		toaster.show(messages.trackers.deleted(tracker.name));
		await goto(backHref);
	}
</script>

<PageHeader
	{backHref}
	backLabel={messages.shell.back(messages.navigation.homeScreen)}
	title={editing === undefined ? messages.navigation.newTracker : messages.navigation.editTracker}
/>

{#if app !== undefined}
	{@const ready = app}
	<TrackerFields {form} {foods} {exercises} {units} />
	{#if invalid}
		<p class="problem" role="alert">{messages.trackers.invalid}</p>
	{/if}
	<div class="actions">
		<Button onclick={() => save(ready)}>{messages.train.save}</Button>
		{#if editing !== undefined}
			{@const tracker = editing}
			<button type="button" class="delete" onclick={() => remove(ready, tracker)}
				>{messages.trackers.delete}</button
			>
		{/if}
	</div>
{/if}

<style>
	.problem {
		margin-top: var(--space-4);
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.actions {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-8);
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
