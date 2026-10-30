<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonSize } from '#lib/design/button.constants.ts';
	import Icon from '#lib/design/Icon.svelte';
	import { IconWeight } from '#lib/design/icon.constants.ts';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { ActiveWorkout } from '#lib/training/domain/workout.ts';
	import AddExercisePanel from '#lib/training/ui/AddExercisePanel.svelte';
	import CurrentExercise from '#lib/training/ui/CurrentExercise.svelte';
	import ExerciseChips from '#lib/training/ui/ExerciseChips.svelte';
	import { elapsedClock } from '#lib/training/ui/workout-format.ts';
	import { WorkoutSession } from '#lib/training/ui/workout-session.svelte.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const trainHref = resolve(AppRoute.train);
	let session: WorkoutSession | undefined = $state();
	let ticker: Ticker | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new WorkoutSession(app.training, app.clock, () => ({
			units: { mass: preferences.massUnit, distance: preferences.current.distanceUnit },
			restSeconds: preferences.current.restSeconds
		}));
		if (!(await next.load())) {
			await goto(trainHref, { replaceState: true });
			return;
		}
		session = next;
		ticker = new Ticker(app.clock);
	});

	$effect(() =>
		ticker?.start(() => {
			if (session !== undefined && ticker !== undefined && session.rest.tick(ticker.now)) {
				toaster.announce(messages.workout.restOver);
			}
		})
	);

	function restorable(text: string, before: ActiveWorkout | undefined): void {
		toaster.show(
			text,
			before === undefined
				? undefined
				: async () => {
						await session?.restore(before);
						await goto(resolve(AppRoute.workout));
					}
		);
	}

	async function finish(ready: WorkoutSession): Promise<void> {
		const { saved, before } = await ready.finish();
		restorable(saved ? messages.workout.saved : messages.workout.nothingLogged, before);
		await goto(trainHref);
	}

	async function discard(ready: WorkoutSession): Promise<void> {
		restorable(messages.workout.discarded, await ready.discard());
		await goto(trainHref);
	}

	async function announce(text: Promise<string | undefined>): Promise<void> {
		const said = await text;
		if (said !== undefined) toaster.announce(said);
	}
</script>

{#if session?.workout !== undefined && ticker !== undefined}
	{@const ready = session}
	{@const workout = session.workout}
	{@const entry = ready.currentEntry}
	{@const exercise = entry === undefined ? undefined : ready.exerciseOf(entry.exerciseId)}
	<div class="bar">
		<a class="back" href={trainHref} aria-label={messages.workout.backToTrain}>
			<Icon name="back" weight={IconWeight.medium} />
		</a>
		<p role="timer" aria-label={messages.workout.time}>
			{elapsedClock(workout.startedAt, ticker.now)}
		</p>
		<button type="button" class="finish" onclick={() => finish(ready)}
			>{messages.workout.finish}</button
		>
	</div>

	<ExerciseChips
		chips={workout.exercises.map((item, position) => ({
			name: ready.exerciseOf(item.exerciseId)?.name ?? '',
			done: ready.isDone(item),
			current: position === ready.current && !ready.adding
		}))}
		adding={ready.adding}
		onselect={(position: number) => {
			ready.select(position);
		}}
		onadd={() => {
			ready.toggleAdding();
		}}
	/>

	{#if ready.adding}
		<AddExercisePanel session={ready} />
	{:else if entry !== undefined && exercise !== undefined}
		<CurrentExercise
			session={ready}
			{entry}
			{exercise}
			now={ticker.now}
			onlog={() => announce(ready.logCurrent())}
			ondone={() => announce(ready.doneWithCurrent())}
		/>
	{:else if workout.exercises.length > 0}
		<section class="all-done">
			<h1>{messages.workout.allDone}</h1>
			<Button size={ButtonSize.tall} onclick={() => finish(ready)}
				>{messages.workout.finishWorkout}</Button
			>
		</section>
	{/if}

	{#if !ready.adding}
		<button type="button" class="discard" onclick={() => discard(ready)}>
			{messages.workout.discard}
			<Icon name="trash" />
		</button>
	{/if}
{/if}

<style>
	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		margin: calc(-1 * var(--space-2)) 0 var(--space-2);
	}

	.back {
		display: grid;
		place-items: center;
		justify-self: start;
		width: var(--tap-target);
		height: var(--tap-target);
		margin-left: calc(-1 * var(--space-3));
		color: var(--color-text);
		--icon-size: var(--icon-size-header);
	}

	.bar p {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-variant-numeric: tabular-nums;
	}

	.finish {
		justify-self: end;
		min-height: var(--tap-target);
		padding: 0 0 0 var(--space-3);
		border: none;
		background: transparent;
		color: var(--color-accent);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.all-done {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		animation: rise var(--duration-rise) ease-out;
	}

	.all-done h1 {
		font-size: var(--font-size-36);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-title);
	}

	.discard {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: calc(100% + 2 * var(--gutter));
		height: var(--button-height);
		margin: var(--space-12) calc(-1 * var(--gutter)) 0;
		padding: 0 var(--gutter);
		border: none;
		border-top: var(--border-hairline) solid var(--color-divider);
		border-bottom: var(--border-hairline) solid var(--color-divider);
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-medium);
		--icon-size: var(--gap-18);
	}

	.discard:hover {
		background: var(--color-hover);
	}
</style>
