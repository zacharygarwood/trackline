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
	import type { WorkoutTemplate } from '#lib/training/domain/workout-template.ts';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const workoutHref = resolve(AppRoute.workout);
	let screen: TrainScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrainScreen(app.training);
		await next.load();
		screen = next;
	});

	async function startTemplate(ready: TrainScreen, template: WorkoutTemplate): Promise<void> {
		await ready.startTemplate(template);
		await goto(workoutHref);
	}

	async function startExercise(ready: TrainScreen, exercise: Exercise): Promise<void> {
		await ready.startExercise(exercise);
		await goto(workoutHref, { state: { selected: exercise.id } });
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.train)}
	backLabel={messages.shell.back(messages.home.workouts)}
	title={messages.navigation.startWorkout}
/>

{#if screen !== undefined}
	{@const ready = screen}
	{#if ready.templates.length > 0}
		<h2 id="start-workouts">{messages.train.yourWorkouts}</h2>
		<ul aria-labelledby="start-workouts">
			{#each ready.templates as template (template.id)}
				<li>
					<NavRow
						label={template.name}
						ariaLabel={ready.active === undefined
							? messages.train.startOne(template.name)
							: messages.train.addTo(ready.activeName)}
						onclick={() => startTemplate(ready, template)}
					/>
				</li>
			{/each}
		</ul>
	{/if}

	<h2 id="start-exercises">{messages.navigation.exercises}</h2>
	<SearchField label={messages.train.search} edges={FieldEdges.bottom} bind:value={ready.query} />
	<ul aria-labelledby="start-exercises">
		{#each ready.matches as exercise (exercise.id)}
			<li>
				<NavRow
					label={exercise.name}
					ariaLabel={ready.active === undefined
						? messages.train.startExercise(exercise.name)
						: messages.train.addExerciseTo(exercise.name, ready.activeName)}
					onclick={() => startExercise(ready, exercise)}
				/>
			</li>
		{/each}
	</ul>
	{#if ready.canCreate}
		<NavRow
			label={messages.exercise.createTitle(ready.newName)}
			onclick={() => goto(resolve(AppRoute.newExercise), { state: { name: ready.newName } })}
		/>
	{/if}
{/if}

<style>
	h2 {
		margin: var(--space-6) 0 var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
