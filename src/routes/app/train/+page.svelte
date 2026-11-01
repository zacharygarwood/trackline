<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import ResumeBar from '#lib/design/ResumeBar.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { elapsedClock } from '#lib/training/ui/workout-format.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';

	let screen: TrainScreen | undefined = $state();
	let ticker: Ticker | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrainScreen(app.training);
		await next.load();
		screen = next;
		ticker = new Ticker(app.clock);
	});

	$effect(() => ticker?.start());
</script>

<PageHeader title={messages.home.workouts} />

{#if screen !== undefined}
	{@const ready = screen}
	{#if ready.active !== undefined && ticker !== undefined}
		<ResumeBar
			name={ready.activeName}
			elapsed={elapsedClock(ready.active.startedAt, ticker.now)}
			href={resolve(AppRoute.workout)}
		/>
	{:else}
		<div class="action">
			<Button onclick={() => goto(resolve(AppRoute.startWorkout))}
				>{messages.navigation.startWorkout}</Button
			>
		</div>
	{/if}

	<div class="rows">
		<NavRow label={messages.navigation.pastWorkouts} href={resolve(AppRoute.pastWorkouts)} />
		<NavRow label={messages.navigation.myWorkouts} href={resolve(AppRoute.myWorkouts)} />
		<NavRow label={messages.navigation.exercises} href={resolve(AppRoute.exercises)} />
	</div>
{/if}

<style>
	.action {
		display: grid;
	}

	.rows {
		margin-top: var(--space-6);
	}
</style>
