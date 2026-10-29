<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import WeighInSheet from '#lib/body/ui/WeighInSheet.svelte';
	import Card from '#lib/design/Card.svelte';
	import IconButton from '#lib/design/IconButton.svelte';
	import Row from '#lib/design/Row.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import LogFoodSheet from '#lib/nutrition/ui/LogFoodSheet.svelte';
	import MacroProgress from '#lib/nutrition/ui/MacroProgress.svelte';
	import { NutritionDay } from '#lib/nutrition/ui/nutrition-day.svelte.ts';
	import { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
	import { first } from '#lib/shared/collections.ts';
	import { formatDate, formatMass } from '#lib/ui/format.ts';

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
	{@const latestWeighIn = first(bodyScreen.weighIns)}
	{@const lastWorkout = first(overview.recent)}

	<Card title={messages.today.food}>
		{#snippet trailing()}
			<IconButton label={messages.nutrition.logFood} icon="plus" onclick={() => (logging = true)} />
		{/snippet}
		<MacroProgress summary={day.day.summary} />
	</Card>

	<Card title={messages.today.weight}>
		{#snippet trailing()}
			<IconButton label={messages.body.weighIn} icon="plus" onclick={() => (weighing = true)} />
		{/snippet}
		<Row
			label={latestWeighIn === undefined
				? messages.today.latest
				: formatDate(latestWeighIn.date, bodyScreen.today)}
			value={latestWeighIn === undefined
				? messages.today.none
				: formatMass(latestWeighIn.weight, bodyScreen.unit)}
		/>
	</Card>

	<Card title={messages.today.training}>
		<Row
			label={messages.today.lastWorkout}
			value={lastWorkout === undefined
				? messages.today.none
				: formatDate(lastWorkout.date, overview.today)}
		/>
		<Row
			label={messages.today.workoutsLastSevenDays}
			value={String(overview.workoutsLastSevenDays)}
		/>
	</Card>

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
