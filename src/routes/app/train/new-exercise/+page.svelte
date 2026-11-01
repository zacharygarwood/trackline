<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { last } from '#lib/shared/collections.ts';
	import type { ExerciseForm } from '#lib/training/ui/exercise-form.svelte.ts';
	import NewExerciseForm from '#lib/training/ui/NewExerciseForm.svelte';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { WorkoutSession } from '#lib/training/ui/workout-session.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const name = page.state.name ?? '';
	const toWorkout = page.state.toWorkout === true;
	const listHref = resolve(
		page.state.toLibrary === true ? AppRoute.exercises : AppRoute.startWorkout
	);
	const backHref = toWorkout ? resolve(AppRoute.addExercise) : listHref;
	const listTitle =
		page.state.toLibrary === true
			? messages.navigation.exercises
			: messages.navigation.startWorkout;
	const backTitle = toWorkout ? messages.navigation.addExercise : listTitle;
	let save: ((form: ExerciseForm) => Promise<void>) | undefined = $state();

	void getAppContext().then(async (app) => {
		if (name.trim() === '') {
			await goto(backHref, { replaceState: true });
			return;
		}
		save = await (toWorkout ? saveToWorkout(app) : saveToLibrary(app));
	});

	/** Saves the exercise, adds it to the workout in progress, and shows it there. */
	async function saveToWorkout(app: App): Promise<(form: ExerciseForm) => Promise<void>> {
		const session = new WorkoutSession(app.training, app.clock, () => ({
			units: { mass: preferences.massUnit, distance: preferences.current.distanceUnit },
			restSeconds: preferences.current.restSeconds
		}));
		await session.load();
		session.query = name;
		return async (form) => {
			await session.create(form.tracking);
			const added = last(session.workout?.exercises ?? []);
			await goto(resolve(AppRoute.workout), {
				state: added === undefined ? {} : { selected: added.exerciseId }
			});
		};
	}

	/** Saves the exercise to the library and goes back to the exercise list. */
	async function saveToLibrary(app: App): Promise<(form: ExerciseForm) => Promise<void>> {
		const train = new TrainScreen(app.training);
		await train.load();
		train.query = name;
		return async (form) => {
			const saved = await train.create(form.tracking);
			if (saved === undefined) return;
			toaster.show(messages.train.saved(saved));
			await goto(listHref);
		};
	}
</script>

<PageHeader
	{backHref}
	backLabel={messages.shell.back(backTitle)}
	title={messages.exercise.createTitle(name)}
/>

{#if save !== undefined}
	<NewExerciseForm
		saveLabel={toWorkout ? messages.exercise.saveToWorkout : messages.exercise.saveToLibrary}
		onsave={save}
	/>
{/if}
