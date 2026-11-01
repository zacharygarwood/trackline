<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { SubjectId } from '#lib/tracking/domain/ids.ts';
	import { WorkoutScreen } from '#lib/tracking/ui/workout-screen.svelte.ts';
	import { AppRoute } from '../../../app-route.constants.ts';
	import { back, open, replace } from '../../../open.ts';

	const preferences = getPreferences();
	let workout: WorkoutScreen | undefined = $state();
	let search = $state('');

	void getAppContext().then(async (app) => {
		const next = new WorkoutScreen(app.tracking, app.clock);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		workout = next;
	});

	const matches = $derived(
		(workout?.choices ?? []).filter((exercise) =>
			exercise.name.toLowerCase().includes(search.trim().toLowerCase())
		)
	);

	async function add(ready: WorkoutScreen, id: SubjectId): Promise<void> {
		await ready.addSet(id, preferences.current.restSeconds);
		back();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.workout)}
	backLabel={messages.shell.back(messages.tracking.workout.title)}
	title={messages.tracking.workout.chooseExercise}
	onback={back}
/>

{#if workout?.tracker !== undefined}
	{@const ready = workout}
	{@const tracker = workout.tracker}
	<SearchField label={messages.tracking.workout.chooseExercise} bind:value={search} />
	<ul>
		{#each matches as exercise (exercise.id)}
			<li><NavRow label={exercise.name} onclick={() => add(ready, exercise.id)} /></li>
		{/each}
		<li>
			<NavRow
				label={messages.tracking.library.newExercise}
				onclick={() => open(AppRoute.newSubject, { tracker: tracker.id, name: search.trim() })}
			/>
		</li>
	</ul>
{/if}
