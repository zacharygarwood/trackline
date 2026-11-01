<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonSize } from '#lib/design/button.constants.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { WorkoutTemplate } from '#lib/training/domain/workout-template.ts';
	import { TrainScreen } from '#lib/training/ui/train-screen.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const toaster = getToaster();
	const trainHref = resolve(AppRoute.myWorkouts);
	let deleteTemplate: ((chosen: WorkoutTemplate) => Promise<void>) | undefined = $state();
	let screen: TrainScreen | undefined = $state();
	let template: WorkoutTemplate | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrainScreen(app.training);
		await next.load();
		const found = next.findTemplate(page.state.selected);
		if (found === undefined) {
			await goto(trainHref, { replaceState: true });
			return;
		}
		screen = next;
		template = found;
		deleteTemplate = async (chosen) => {
			await app.training.deleteTemplate.execute({ id: chosen.id });
			toaster.show(messages.train.deleted(chosen.name), async () => {
				await app.training.createTemplate.execute({
					name: chosen.name,
					exerciseIds: chosen.exercises.map((planned) => planned.exerciseId)
				});
			});
			await goto(trainHref);
		};
	});

	async function start(ready: TrainScreen, chosen: WorkoutTemplate): Promise<void> {
		await ready.startTemplate(chosen);
		await goto(resolve(AppRoute.workout));
	}
</script>

<PageHeader
	backHref={trainHref}
	backLabel={messages.shell.back(messages.navigation.myWorkouts)}
	title={template?.name ?? ''}
/>

{#if screen !== undefined && template !== undefined}
	{@const ready = screen}
	{@const chosen = template}
	<ol aria-label={messages.train.exercises}>
		{#each ready.exerciseNames(chosen) as name, position (position)}
			<li><span class="number">{position + 1}</span>{name}</li>
		{/each}
	</ol>
	<div class="start">
		<Button size={ButtonSize.tall} onclick={() => start(ready, chosen)}
			>{ready.active === undefined
				? messages.train.start
				: messages.train.addTo(ready.activeName)}</Button
		>
	</div>
	<div class="manage">
		<NavRow
			label={messages.train.edit}
			onclick={() => goto(resolve(AppRoute.editWorkout), { state: { selected: chosen.id } })}
		/>
		{#if deleteTemplate !== undefined}
			{@const remove = deleteTemplate}
			<button type="button" class="delete" onclick={() => remove(chosen)}
				>{messages.train.delete}</button
			>
		{/if}
	</div>
{/if}

<style>
	ol {
		margin: 0 calc(-1 * var(--gutter)) var(--space-6);
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		min-height: var(--row-height);
		padding: 0 var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
		font-size: var(--font-size-18);
	}

	.start {
		display: grid;
	}

	.manage {
		margin-top: var(--space-8);
	}

	.delete {
		min-height: var(--row-height);
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-danger);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}

	.number {
		min-width: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-variant-numeric: tabular-nums;
	}
</style>
