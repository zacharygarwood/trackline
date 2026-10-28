<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import WeighInSheet from '#lib/body/ui/WeighInSheet.svelte';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import { messages } from '#lib/i18n/messages.en.ts';
	import LogFoodSheet from '#lib/nutrition/ui/LogFoodSheet.svelte';
	import MacroProgress from '#lib/nutrition/ui/MacroProgress.svelte';
	import { NutritionDay } from '#lib/nutrition/ui/nutrition-day.svelte.ts';
	import { first } from '#lib/shared/collections.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
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
	{@const todayTraining = first(overview.calendar?.days ?? [])}
	<div class="today">
		{#if todayWeighIn === undefined}
			<Button onclick={() => (weighing = true)}>{messages.body.weighIn}</Button>
			<Button variant={ButtonVariant.secondary} onclick={() => (logging = true)}
				>{messages.nutrition.logFood}</Button
			>
		{:else}
			<Button onclick={() => (logging = true)}>{messages.nutrition.logFood}</Button>
		{/if}

		<section>
			<h2>{messages.today.food}</h2>
			<MacroProgress summary={day.day.summary} />
		</section>

		<section>
			<h2>{messages.today.body}</h2>
			<p>
				{todayWeighIn === undefined
					? messages.today.notWeighedIn
					: messages.today.weighedIn(formatMass(todayWeighIn.weight, bodyScreen.unit))}
			</p>
		</section>

		{#if todayTraining !== undefined}
			<section>
				<h2>{messages.today.training}</h2>
				{#if todayTraining.trained}
					<p>{messages.today.workoutDone}</p>
				{:else}
					<div class="row">
						<p>{todayTraining.rested ? messages.today.restDayMarked : messages.today.noTraining}</p>
						<button
							type="button"
							class="rest"
							class:rested={todayTraining.rested}
							aria-pressed={todayTraining.rested}
							aria-label={messages.training.markRestDay(messages.dates.today)}
							onclick={() => overview.toggleRestDay(todayTraining.date, todayTraining.rested)}
						>
							{messages.training.restDay}
						</button>
					</div>
				{/if}
				<p class="streak">{overview.streakText}</p>
			</section>
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
		gap: var(--space-6);
		padding-bottom: var(--space-8);
	}

	h2 {
		margin-bottom: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.rest {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.rest.rested {
		background: var(--color-surface);
		color: var(--color-text);
	}

	.streak {
		margin-top: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}
</style>
