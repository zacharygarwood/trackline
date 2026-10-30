<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import Icon from '#lib/design/Icon.svelte';
	import { IconWeight } from '#lib/design/icon.constants.ts';
	import ResumeBar from '#lib/design/ResumeBar.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { Exercise } from '#lib/training/domain/exercise.ts';
	import type { WorkoutTemplate } from '#lib/training/domain/workout-template.ts';
	import type { ExerciseForm } from '#lib/training/ui/exercise-form.svelte.ts';
	import NewExerciseForm from '#lib/training/ui/NewExerciseForm.svelte';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { elapsedClock } from '#lib/training/ui/workout-format.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';

	const toaster = getToaster();
	let screen: TrainScreen | undefined = $state();
	let ticker: Ticker | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrainScreen(app.training);
		await next.load();
		screen = next;
		ticker = new Ticker(app.clock);
	});

	$effect(() => ticker?.start());

	async function startTemplate(ready: TrainScreen, template: WorkoutTemplate): Promise<void> {
		await ready.startTemplate(template);
		await goto(resolve(AppRoute.workout));
	}

	async function startExercise(ready: TrainScreen, exercise: Exercise): Promise<void> {
		await ready.startExercise(exercise);
		await goto(resolve(AppRoute.workout));
	}

	async function create(ready: TrainScreen, form: ExerciseForm): Promise<void> {
		const name = await ready.create(form.tracking);
		if (name !== undefined) toaster.show(messages.train.saved(name));
	}
</script>

{#if screen !== undefined}
	{@const ready = screen}
	{@const active = ready.active}
	{#if active !== undefined && ticker !== undefined}
		<div class="resume">
			<ResumeBar
				name={ready.activeName}
				elapsed={elapsedClock(active.startedAt, ticker.now)}
				href={resolve(AppRoute.workout)}
			/>
		</div>
	{/if}

	<SearchField label={messages.train.search} bind:value={ready.query} />

	<div class="workouts-heading">
		<h2>{messages.train.workouts}</h2>
		<a class="new" href={resolve(AppRoute.newWorkout)}>
			<Icon name="plus" weight={IconWeight.bold} />{messages.train.newWorkout}
		</a>
	</div>
	<ul class="list" aria-label={messages.train.workouts}>
		{#each ready.visibleTemplates as template (template.id)}
			{@const open = ready.openTemplate === template.id}
			<li>
				<button
					type="button"
					class="template"
					class:open
					aria-expanded={open}
					onclick={() => {
						ready.toggleTemplate(template.id);
					}}
				>
					<span class="template-name">{template.name}</span>
					<span class="chevron"><Icon name="chevronDown" weight={IconWeight.medium} /></span>
				</button>
				{#if open}
					<div class="template-body">
						<ol aria-label={messages.train.exercises}>
							{#each template.exercises as planned, position (position)}
								<li>
									{ready.library.find((exercise) => exercise.id === planned.exerciseId)?.name}
								</li>
							{/each}
						</ol>
						<Button onclick={() => startTemplate(ready, template)}
							>{active === undefined
								? messages.train.start
								: messages.train.addTo(ready.activeName)}</Button
						>
					</div>
				{/if}
			</li>
		{/each}
	</ul>

	{#if ready.matches.length > 0}
		<h2 class="exercises-heading">{messages.train.exercises}</h2>
		<ul class="list" aria-label={messages.train.exercises}>
			{#each ready.matches as exercise (exercise.id)}
				<li class="exercise">
					<span>{exercise.name}</span>
					<button
						type="button"
						class="pick"
						aria-label={active === undefined
							? messages.train.startExercise(exercise.name)
							: messages.train.addExerciseTo(exercise.name, ready.activeName)}
						onclick={() => startExercise(ready, exercise)}
						>{active === undefined ? messages.train.start : messages.train.add}</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	{#if ready.canCreate}
		<NewExerciseForm
			name={ready.newName}
			saveLabel={messages.exercise.saveToLibrary}
			onsave={(form: ExerciseForm) => create(ready, form)}
		/>
	{/if}
{/if}

<style>
	.resume {
		margin-bottom: var(--space-5);
	}

	h2 {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.workouts-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--space-4);
		padding-bottom: var(--space-1);
	}

	.new {
		display: flex;
		align-items: center;
		gap: var(--chip-gap);
		min-height: var(--tap-target);
		color: var(--color-accent);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		--icon-size: var(--font-size-15);
	}

	.list {
		margin: 0 calc(-1 * var(--gutter));
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.list > li {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.template {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--setting-row-height);
		padding: 0 var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		text-align: left;
		--icon-size: var(--gap-18);
	}

	.template:hover {
		background: var(--color-hover);
	}

	.chevron {
		display: flex;
		color: var(--color-text-muted);
		transition: transform var(--duration-quick) ease;
	}

	.open .chevron {
		transform: rotate(180deg);
	}

	.template-name {
		flex: 1;
		min-width: 0;
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-tight);
	}

	.template-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: 0 var(--gutter) var(--space-5);
		animation: rise var(--duration-rise) ease-out;
	}

	.template-body ol {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-17);
	}

	.exercises-heading {
		margin-top: var(--space-6);
		padding-bottom: var(--space-2);
	}

	.exercise {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--row-height-tall);
		padding: 0 var(--gutter);
		font-size: var(--font-size-18);
	}

	.exercise span {
		flex: 1;
		min-width: 0;
	}

	.pick {
		min-width: var(--tap-target);
		height: var(--tap-target);
		padding: 0 var(--gap-14);
		border: var(--border-control) solid var(--color-accent);
		background: transparent;
		color: var(--color-accent);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
