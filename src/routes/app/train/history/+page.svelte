<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	let training: TrainOverview | undefined = $state();

	void getAppContext().then(async (app) => {
		const overview = new TrainOverview(app.training, app.clock);
		await overview.load();
		training = overview;
	});
</script>

<PageHeader
	backHref={resolve(AppRoute.train)}
	backLabel={messages.shell.back(messages.home.workouts)}
	title={messages.navigation.pastWorkouts}
/>

{#if training !== undefined}
	{@const overview = training}
	<ul aria-label={messages.navigation.pastWorkouts}>
		{#each overview.recent as workout (workout.id)}
			<li>
				<NavRow
					label={overview.nameOf(workout)}
					value={formatDate(workout.date, overview.today)}
					onclick={() => goto(resolve(AppRoute.pastWorkout), { state: { selected: workout.id } })}
				/>
			</li>
		{/each}
	</ul>
	{#if overview.recent.length === 0}
		<p class="empty">{messages.trends.noWorkouts}</p>
	{/if}
{/if}

<style>
	.empty {
		margin-top: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
