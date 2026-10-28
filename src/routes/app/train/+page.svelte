<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { TrainingDay } from '#lib/training/application/get-training-days.ts';
	import type { WorkoutTemplateId } from '#lib/training/domain/ids.ts';
	import type { WorkoutTemplate } from '#lib/training/domain/workout-template.ts';
	import type { FinishedWorkout } from '#lib/training/domain/workout.ts';
	import ActiveWorkoutView from '#lib/training/ui/ActiveWorkoutView.svelte';
	import RecentWorkouts from '#lib/training/ui/RecentWorkouts.svelte';
	import SaveTemplateSheet from '#lib/training/ui/SaveTemplateSheet.svelte';
	import TemplateList from '#lib/training/ui/TemplateList.svelte';
	import TemplateSheet from '#lib/training/ui/TemplateSheet.svelte';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import WeekView from '#lib/training/ui/WeekView.svelte';
	import { WorkoutSession } from '#lib/training/ui/workout-session.svelte.ts';

	let session: WorkoutSession | undefined = $state();
	let overview: TrainOverview | undefined = $state();
	let justFinished: FinishedWorkout | undefined = $state();
	let notice: string | undefined = $state();
	let templateOptions: WorkoutTemplate | undefined = $state();

	void getAppContext().then(async (app) => {
		const nextSession = new WorkoutSession(app.training);
		const nextOverview = new TrainOverview(app.training, app.clock);
		await Promise.all([
			nextSession.load(await app.settings.getMassUnit.execute()),
			nextOverview.load()
		]);
		session = nextSession;
		overview = nextOverview;
	});

	async function finished(
		ready: TrainOverview,
		workout: FinishedWorkout | undefined
	): Promise<void> {
		justFinished = workout;
		notice = workout === undefined ? messages.training.nothingCompleted : undefined;
		await ready.load();
	}
</script>

{#if session !== undefined && overview !== undefined}
	{@const active = session}
	{@const ready = overview}
	{#if active.workout !== undefined}
		<ActiveWorkoutView
			session={active}
			onfinished={(workout: FinishedWorkout | undefined) => void finished(ready, workout)}
			ondiscarded={() => void ready.load()}
		/>
	{:else}
		<div class="overview">
			<Button
				onclick={() => {
					notice = undefined;
					void active.start();
				}}>{messages.training.startWorkout}</Button
			>
			{#if notice !== undefined}
				<p role="status">{notice}</p>
			{/if}
			<TemplateList
				templates={ready.templates}
				onstart={(id: WorkoutTemplateId) => void active.start(id)}
				onoptions={(template: WorkoutTemplate) => (templateOptions = template)}
			/>
			{#if ready.calendar !== undefined}
				<WeekView
					days={ready.calendar.days}
					streak={ready.calendar.streak}
					today={ready.today}
					ontoggle={(day: TrainingDay) => void ready.toggleRestDay(day.date, day.rested)}
				/>
			{/if}
			<RecentWorkouts
				workouts={ready.recent}
				describe={(workout: FinishedWorkout) => ready.describe(workout)}
				today={ready.today}
			/>
		</div>
	{/if}

	{#if justFinished !== undefined}
		<SaveTemplateSheet
			overview={ready}
			workout={justFinished}
			onclose={() => (justFinished = undefined)}
		/>
	{/if}
	{#if templateOptions !== undefined}
		<TemplateSheet
			overview={ready}
			template={templateOptions}
			onclose={() => (templateOptions = undefined)}
		/>
	{/if}
{/if}

<style>
	.overview {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding-bottom: var(--space-8);
	}
</style>
