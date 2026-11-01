<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	let screen: TrainScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrainScreen(app.training);
		await next.load();
		screen = next;
	});
</script>

<PageHeader
	backHref={resolve(AppRoute.train)}
	backLabel={messages.shell.back(messages.home.workouts)}
	title={messages.navigation.myWorkouts}
/>

{#if screen !== undefined}
	<ul aria-label={messages.navigation.myWorkouts}>
		{#each screen.templates as template (template.id)}
			<li>
				<NavRow
					label={template.name}
					value={messages.train.count(template.exercises.length)}
					onclick={() => goto(resolve(AppRoute.savedWorkout), { state: { selected: template.id } })}
				/>
			</li>
		{/each}
	</ul>
	<a class="add" href={resolve(AppRoute.newWorkout)}>{messages.train.addNewWorkout}</a>
{/if}

<style>
	.add {
		display: flex;
		align-items: center;
		min-height: var(--row-height);
		color: var(--color-accent);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}
</style>
