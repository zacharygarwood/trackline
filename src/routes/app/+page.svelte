<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import WeighInSheet from '#lib/body/ui/WeighInSheet.svelte';
	import Button from '#lib/design/Button.svelte';
	import Card from '#lib/design/Card.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import { messages } from '#lib/i18n/messages.en.ts';
	import LogFoodSheet from '#lib/nutrition/ui/LogFoodSheet.svelte';
	import MacroProgress from '#lib/nutrition/ui/MacroProgress.svelte';
	import { NutritionDay } from '#lib/nutrition/ui/nutrition-day.svelte.ts';
	import type { TrainingDay } from '#lib/training/application/get-training-days.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import WeekView from '#lib/training/ui/WeekView.svelte';
	import { formatMass } from '#lib/ui/format.ts';

	let body: BodyScreen | undefined = $state();
	let food: NutritionDay | undefined = $state();
	let training: TrainOverview | undefined = $state();
	let weighing = $state(false);
	let logging = $state(false);

	void getAppContext().then(async (app) => {
		const nextBody = new BodyScreen(
			{ ...app.body, getMassUnit: app.settings.getMassUnit },
			app.clock
		);
		const nextFood = new NutritionDay(app.nutrition, app.clock);
		const nextTraining = new TrainOverview(app.training, app.clock);
		await Promise.all([nextBody.load(), nextFood.load(), nextTraining.load()]);
		body = nextBody;
		food = nextFood;
		training = nextTraining;
	});

	async function reload(): Promise<void> {
		await Promise.all([body?.load(), food?.load()]);
	}
</script>

{#if body !== undefined && food !== undefined && training !== undefined}
	{@const bodyScreen = body}
	{@const day = food}
	{@const overview = training}
	{@const todayWeighIn = bodyScreen.weighIns.find((weighIn) =>
		weighIn.date.equals(bodyScreen.today)
	)}
	<div class="today">
		{#if todayWeighIn === undefined}
			<div class="actions">
				<Button onclick={() => (weighing = true)}>{messages.body.weighIn}</Button>
				<Button variant={ButtonVariant.secondary} onclick={() => (logging = true)}
					>{messages.nutrition.logFood}</Button
				>
			</div>
		{:else}
			<Button onclick={() => (logging = true)}>{messages.nutrition.logFood}</Button>
		{/if}

		<Card title={messages.today.food}>
			<MacroProgress summary={day.day.summary} />
		</Card>

		<Card title={messages.today.body}>
			{#if todayWeighIn === undefined}
				<p class="muted">{messages.today.notWeighedIn}</p>
			{:else}
				<p class="stat">{formatMass(todayWeighIn.weight, bodyScreen.unit)}</p>
				<p class="muted">{messages.today.weighedInToday}</p>
			{/if}
		</Card>

		{#if overview.calendar !== undefined}
			<WeekView
				days={overview.calendar.days}
				today={overview.today}
				ontoggle={(training: TrainingDay) =>
					void overview.toggleRestDay(training.date, training.rested)}
			/>
		{/if}
	</div>

	{#if weighing}
		<WeighInSheet
			title={messages.body.weighIn}
			suggestion={bodyScreen.suggestionFor(bodyScreen.today)}
			unit={bodyScreen.unit}
			onsave={(entry: string) => bodyScreen.record(bodyScreen.today, entry)}
			onclose={() => (weighing = false)}
		/>
	{/if}
	{#if logging}
		<LogFoodSheet
			{day}
			onclose={() => {
				logging = false;
				void reload();
			}}
		/>
	{/if}
{/if}

<style>
	.today {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-bottom: var(--space-8);
	}

	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.stat {
		font-size: var(--font-size-stat);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.muted {
		color: var(--color-text-muted);
	}
</style>
