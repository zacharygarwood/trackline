<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { WorkoutBuilder } from '#lib/training/ui/workout-builder.svelte.ts';
	import WorkoutBuilderForm from '#lib/training/ui/WorkoutBuilderForm.svelte';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const toaster = getToaster();
	const backHref = resolve(AppRoute.myWorkouts);
	let builder: WorkoutBuilder | undefined = $state();

	void getAppContext().then(async (app) => {
		const template = (await app.training.listTemplates.execute()).find(
			(saved) => saved.id === page.state.selected
		);
		if (template === undefined) {
			await goto(backHref, { replaceState: true });
			return;
		}
		const next = new WorkoutBuilder(app.training, template);
		await next.load();
		builder = next;
	});

	async function save(ready: WorkoutBuilder): Promise<void> {
		const name = await ready.save();
		if (name === undefined) return;
		toaster.show(messages.train.saved(name));
		await goto(backHref);
	}
</script>

{#if builder !== undefined}
	{@const ready = builder}
	<WorkoutBuilderForm
		builder={ready}
		title={messages.navigation.editWorkout}
		onsave={() => save(ready)}
	>
		{#snippet back()}
			<a class="back-link" href={resolve(AppRoute.myWorkouts)}
				>{messages.shell.back(messages.navigation.myWorkouts)}</a
			>
		{/snippet}
	</WorkoutBuilderForm>
{/if}
