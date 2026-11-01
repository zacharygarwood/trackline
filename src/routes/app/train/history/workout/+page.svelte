<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { FinishedWorkout } from '#lib/training/domain/workout.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../../app-route.constants.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const workoutsHref = resolve(AppRoute.pastWorkouts);
	let training: TrainOverview | undefined = $state();
	let workout: FinishedWorkout | undefined = $state();

	void getAppContext().then(async (app) => {
		const overview = new TrainOverview(app.training, app.clock);
		await overview.load();
		const found = overview.recent.find((known) => known.id === page.state.selected);
		if (found === undefined) {
			await goto(workoutsHref, { replaceState: true });
			return;
		}
		training = overview;
		workout = found;
	});

	async function save(overview: TrainOverview, chosen: FinishedWorkout): Promise<void> {
		if (await overview.save(chosen)) toaster.show(messages.trends.savedToWorkouts);
	}
</script>

<PageHeader
	backHref={workoutsHref}
	backLabel={messages.shell.back(messages.navigation.pastWorkouts)}
	title={training !== undefined && workout !== undefined ? training.nameOf(workout) : ''}
/>

{#if training !== undefined && workout !== undefined}
	{@const overview = training}
	{@const chosen = workout}
	<p class="when">{formatDate(chosen.date, overview.today)}</p>
	<dl>
		{#each overview.summaryOf( chosen, { mass: preferences.massUnit, distance: preferences.current.distanceUnit } ) as row, position (position)}
			<div>
				<dt>{row.label === '' ? messages.workout.durationLabel : row.label}</dt>
				<dd>{row.value}</dd>
			</div>
		{/each}
	</dl>
	{#if overview.canSave(chosen)}
		<button type="button" class="save" onclick={() => save(overview, chosen)}
			>{messages.trends.saveToWorkouts}</button
		>
	{/if}
{/if}

<style>
	.when {
		margin: calc(-1 * var(--space-4)) 0 var(--space-5);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	dl {
		margin: 0 calc(-1 * var(--gutter));
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	dl div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--row-height);
		padding: 0 var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
		font-size: var(--font-size-16);
	}

	dt {
		color: var(--color-text-muted);
	}

	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.save {
		height: var(--control-height);
		margin-top: var(--space-5);
		padding: 0 var(--space-4);
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
