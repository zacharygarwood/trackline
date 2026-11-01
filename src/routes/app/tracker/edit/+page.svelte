<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Sheet from '#lib/design/Sheet.svelte';
	import TextField from '#lib/design/TextField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import GoalInput from '#lib/tracking/ui/GoalInput.svelte';
	import { TrackerEditor } from '#lib/tracking/ui/tracker-editor.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, replace } from '../../open.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = { mass: preferences.massUnit, distance: preferences.current.distanceUnit };
	let editor: TrackerEditor | undefined = $state();
	let confirming = $state(false);

	void getAppContext().then(async (app) => {
		const next = new TrackerEditor(app.tracking, units);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		editor = next;
	});

	async function save(ready: TrackerEditor): Promise<void> {
		if ((await ready.save()) === undefined) return;
		toaster.show(messages.tracking.edit.saved);
		back();
	}

	async function remove(ready: TrackerEditor): Promise<void> {
		const name = ready.tracker?.name ?? '';
		await ready.delete();
		confirming = false;
		toaster.show(messages.tracking.edit.deleted(name));
		await replace(AppRoute.today);
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(editor?.tracker?.name ?? messages.navigation.home)}
	title={messages.tracking.page.editTracker}
	onback={back}
/>

{#if editor?.tracker !== undefined && editor.goal !== undefined}
	{@const ready = editor}
	{@const goal = editor.goal}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			void save(ready);
		}}
	>
		<TextField label={messages.tracking.edit.name} bind:value={ready.name} />

		{#each ready.renames as rename (rename.key)}
			<div class="number">
				<TextField label={messages.tracking.edit.numberName} bind:value={rename.label} />
				<TextField
					label={messages.tracking.edit.unit}
					placeholder={messages.tracking.edit.unitExample}
					bind:value={rename.unit}
				/>
			</div>
		{/each}

		<div class="goal">
			<GoalInput editor={goal} {units} />
		</div>

		{#if ready.problem !== undefined}
			<p class="problem" role="alert">{ready.problem}</p>
		{/if}
		<div class="actions">
			<Button type="submit">{messages.tracking.page.save}</Button>
			<Button variant={ButtonVariant.quiet} onclick={() => (confirming = true)}
				>{messages.tracking.edit.delete}</Button
			>
		</div>
	</form>

	<Sheet bind:open={confirming} title={messages.tracking.edit.delete}>
		<p class="confirm">{messages.tracking.edit.deleteConfirm(editor.tracker.name)}</p>
		<div class="actions">
			<Button onclick={() => remove(ready)}>{messages.tracking.edit.delete}</Button>
		</div>
	</Sheet>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	.number {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		margin-top: var(--space-6);
	}

	.goal {
		margin-top: var(--space-6);
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

	.confirm {
		font-size: var(--font-size-16);
	}
</style>
