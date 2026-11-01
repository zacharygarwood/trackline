<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import OptionList from '#lib/design/OptionList.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import TextField from '#lib/design/TextField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { TrackerKind } from '#lib/tracking/domain/tracking.constants.ts';
	import type { ExercisePreset } from '#lib/tracking/ui/exercise-presets.constants.ts';
	import FieldInput from '#lib/tracking/ui/FieldInput.svelte';
	import { SubjectEditor } from '#lib/tracking/ui/subject-editor.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, backTwice, replace } from '../../open.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = { mass: preferences.massUnit, distance: preferences.current.distanceUnit };
	const tracksId = $props.id();
	let editor: SubjectEditor | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new SubjectEditor(app.tracking, units);
		const target = {
			tracker: page.state.tracker,
			subject: page.state.subject,
			name: page.state.name
		};
		if (!(await next.load(target))) {
			await replace(AppRoute.today);
			return;
		}
		editor = next;
	});

	async function save(ready: SubjectEditor): Promise<void> {
		if ((await ready.save()) === undefined) return;
		back();
	}

	async function archive(ready: SubjectEditor): Promise<void> {
		const name = ready.subject?.name ?? '';
		await ready.archive();
		toaster.show(messages.tracking.library.deleted(name));
		backTwice();
	}

	function titleOf(ready: SubjectEditor): string {
		if (ready.subject !== undefined) return ready.subject.name;
		if (ready.tracker?.kind === TrackerKind.workout) return messages.tracking.library.newExercise;
		return ready.tracker?.kind === TrackerKind.food
			? messages.tracking.library.newFood
			: messages.tracking.library.newThing;
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(editor?.tracker?.name ?? messages.navigation.home)}
	title={editor === undefined ? '' : titleOf(editor)}
	onback={back}
/>

{#if editor?.tracker !== undefined}
	{@const ready = editor}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			void save(ready);
		}}
	>
		<TextField label={messages.tracking.library.name} bind:value={ready.name} />

		{#if ready.isExercise}
			<SectionTitle title={messages.tracking.library.tracks} id={tracksId} />
			<OptionList
				labelledBy={tracksId}
				options={ready.presets.map((value) => ({
					value,
					label: messages.tracking.exerciseFields[value]
				}))}
				value={ready.preset}
				onchoose={(preset: ExercisePreset) => (ready.preset = preset)}
			/>
		{/if}

		{#if ready.perServing !== undefined}
			{@const perServing = ready.perServing}
			<SectionTitle title={messages.tracking.library.perServing} />
			{#each perServing.fields as field (field.key)}
				{@const draft = perServing.drafts[field.key]}
				{#if draft !== undefined}
					<FieldInput {field} {draft} {units} />
				{/if}
			{/each}
		{/if}

		{#if ready.problem !== undefined}
			<p class="problem" role="alert">{ready.problem}</p>
		{/if}
		<div class="actions">
			<Button type="submit">{messages.tracking.library.save}</Button>
			{#if ready.subject !== undefined}
				<Button variant={ButtonVariant.quiet} onclick={() => archive(ready)}
					>{messages.tracking.library.delete}</Button
				>
			{/if}
		</div>
	</form>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	.problem {
		margin-top: var(--space-4);
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-8);
	}
</style>
