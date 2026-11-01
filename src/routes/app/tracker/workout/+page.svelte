<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import ActionButton from '#lib/design/ActionButton.svelte';
	import Button from '#lib/design/Button.svelte';
	import { ButtonSize, ButtonVariant } from '#lib/design/button.constants.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Sheet from '#lib/design/Sheet.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { REST_TIMER_SECONDS, type RestTimerSeconds } from '#lib/settings/domain/preferences.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import SettingChoices from '#lib/settings/ui/SettingChoices.svelte';
	import SettingRow from '#lib/settings/ui/SettingRow.svelte';
	import type { FieldKey, FieldValue } from '#lib/tracking/domain/field.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import SetRow from '#lib/tracking/ui/SetRow.svelte';
	import { entrySummary } from '#lib/tracking/ui/value-format.ts';
	import { WorkoutScreen, type WorkoutExercise } from '#lib/tracking/ui/workout-screen.svelte.ts';
	import { formatClock } from '#lib/ui/format.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, open, replace } from '../../open.ts';

	const MILLISECONDS_PER_SECOND = 1000;
	const preferences = getPreferences();
	const toaster = getToaster();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let workout: WorkoutScreen | undefined = $state();
	let ticker: Ticker | undefined = $state();
	let discarding = $state(false);

	void getAppContext().then(async (app) => {
		const next = new WorkoutScreen(app.tracking, app.clock);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		ticker = new Ticker(app.clock);
		workout = next;
	});

	$effect(() => ticker?.start());

	const restLeft = $derived(
		workout?.restEndsAt === undefined || ticker === undefined
			? undefined
			: (workout.restEndsAt - ticker.now) / MILLISECONDS_PER_SECOND
	);

	function fieldsOf(tracker: Tracker, exercise: WorkoutExercise) {
		const keys = exercise.exercise.fieldKeys;
		return tracker.fields.filter((field) => keys.length === 0 || keys.includes(field.key));
	}

	function lastTime(tracker: Tracker, exercise: WorkoutExercise): string | undefined {
		if (exercise.lastTime.length === 0) return undefined;
		const sets = exercise.lastTime.map((set) => entrySummary(tracker, set.values, units));
		return messages.tracking.workout.lastTime(sets.join(', '));
	}

	async function finish(ready: WorkoutScreen): Promise<void> {
		const finished = await ready.finish();
		toaster.show(
			finished === undefined ? messages.tracking.workout.empty : messages.tracking.workout.finished
		);
		back();
	}

	async function discard(ready: WorkoutScreen): Promise<void> {
		await ready.discard();
		discarding = false;
		back();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(workout?.tracker?.name ?? messages.navigation.home)}
	title={messages.tracking.workout.title}
	onback={back}
/>

{#if workout?.tracker !== undefined && workout.session !== undefined && ticker !== undefined}
	{@const ready = workout}
	{@const tracker = workout.tracker}
	<p class="elapsed">
		{messages.tracking.workout.elapsed(
			formatClock((ticker.now - workout.session.startedAt) / MILLISECONDS_PER_SECOND)
		)}
	</p>
	<SettingRow label={messages.preferences.restTimer}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={REST_TIMER_SECONDS.map((value) => ({ value, label: formatClock(value) }))}
				value={preferences.current.restSeconds}
				onchoose={(restSeconds: RestTimerSeconds) => void preferences.change({ restSeconds })}
			/>
		{/snippet}
	</SettingRow>

	{#if restLeft !== undefined}
		<div class="rest" role="timer">
			<span>
				{restLeft > 0
					? messages.tracking.workout.restLeft(formatClock(restLeft))
					: messages.tracking.workout.restDone}
			</span>
			<Button
				size={ButtonSize.compact}
				variant={ButtonVariant.quiet}
				onclick={() => {
					ready.skipRest();
				}}>{messages.tracking.workout.skipRest}</Button
			>
		</div>
	{/if}

	{#each ready.exercises as exercise (exercise.subjectId)}
		{@const fields = fieldsOf(tracker, exercise)}
		{@const previous = lastTime(tracker, exercise)}
		<section>
			<h2>{exercise.exercise.name}</h2>
			{#if previous !== undefined}<p class="last">{previous}</p>{/if}
			{#each exercise.sets as set, index (set.id)}
				<SetRow
					{set}
					number={index + 1}
					{fields}
					{units}
					onchange={(values: ReadonlyMap<FieldKey, FieldValue>) =>
						void ready.changeSet(set, values)}
					ondelete={() => void ready.deleteSet(set)}
				/>
			{/each}
			<div class="add-set">
				<Button
					variant={ButtonVariant.secondary}
					size={ButtonSize.medium}
					onclick={() => ready.addSet(exercise.subjectId, preferences.current.restSeconds)}
					>{messages.tracking.workout.addSet}</Button
				>
			</div>
		</section>
	{/each}

	<div class="add-exercise">
		<ActionButton
			label={messages.tracking.workout.addExercise}
			icon="plus"
			onclick={() => open(AppRoute.addExercise, { tracker: tracker.id })}
		/>
	</div>

	<div class="actions">
		<Button onclick={() => finish(ready)}>{messages.tracking.workout.finish}</Button>
		<Button variant={ButtonVariant.quiet} onclick={() => (discarding = true)}
			>{messages.tracking.workout.discard}</Button
		>
	</div>

	<Sheet bind:open={discarding} title={messages.tracking.workout.discard}>
		<p>{messages.tracking.workout.discardConfirm}</p>
		<div class="actions">
			<Button onclick={() => discard(ready)}>{messages.tracking.workout.discard}</Button>
		</div>
	</Sheet>
{/if}

<style>
	.elapsed {
		margin-bottom: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-variant-numeric: tabular-nums;
	}

	.rest {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 calc(-1 * var(--gutter)) var(--space-4);
		padding: var(--space-2) var(--gutter);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	section {
		margin-bottom: var(--space-8);
	}

	h2 {
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-bold);
	}

	.last {
		margin: var(--space-1) 0 var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-13);
	}

	.add-set {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-3);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-8);
	}
</style>
