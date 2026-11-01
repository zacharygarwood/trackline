<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { Exercise } from '#lib/training/domain/exercise.ts';
	import AddExercisePanel from '#lib/training/ui/AddExercisePanel.svelte';
	import { WorkoutSession } from '#lib/training/ui/workout-session.svelte.ts';
	import { AppRoute } from '../../../app-route.constants.ts';

	const preferences = getPreferences();
	const workoutHref = resolve(AppRoute.workout);
	let session: WorkoutSession | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new WorkoutSession(app.training, app.clock, () => ({
			units: { mass: preferences.massUnit, distance: preferences.current.distanceUnit },
			restSeconds: preferences.current.restSeconds
		}));
		if (!(await next.load())) {
			await goto(resolve(AppRoute.train), { replaceState: true });
			return;
		}
		session = next;
	});

	async function pick(ready: WorkoutSession, exercise: Exercise): Promise<void> {
		await ready.add(exercise);
		await goto(workoutHref, { state: { selected: exercise.id } });
	}
</script>

<PageHeader
	backHref={session?.workout?.exercises.length === 0 ? resolve(AppRoute.train) : workoutHref}
	backLabel={messages.shell.back(
		session?.workout?.exercises.length === 0 ? messages.home.workouts : messages.navigation.workout
	)}
	title={messages.navigation.addExercise}
/>

{#if session !== undefined}
	{@const ready = session}
	<AddExercisePanel
		session={ready}
		onpick={(exercise: Exercise) => pick(ready, exercise)}
		oncreate={(name: string) =>
			goto(resolve(AppRoute.newExercise), { state: { name, toWorkout: true } })}
	/>
{/if}
