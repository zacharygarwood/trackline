<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import Button from '#lib/design/Button.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import TextField from '#lib/design/TextField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import GoalInput from '#lib/tracking/ui/GoalInput.svelte';
	import { NewTracker } from '#lib/tracking/ui/new-tracker.svelte.ts';
	import { basicOf } from '#lib/tracking/ui/template-groups.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, replace } from '../../open.ts';

	const toaster = getToaster();
	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	const template = basicOf(page.state.template);
	let app: App | undefined = $state();
	let creating: NewTracker | undefined = $state();

	if (template === undefined) void replace(AppRoute.today);
	void getAppContext().then((ready) => {
		app = ready;
		if (template !== undefined) creating = new NewTracker(template, units);
	});

	async function add(ready: App, next: NewTracker): Promise<void> {
		const tracker = await next.add(ready.tracking.addTrackers);
		if (tracker === undefined) return;
		toaster.show(messages.tracking.add.added(tracker.name));
		await replace(AppRoute.tracker, { tracker: tracker.id });
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.addTracker)}
	backLabel={messages.shell.back(messages.tracking.add.title)}
	title={template === undefined ? '' : messages.tracking.templates[template.key]}
	onback={back}
/>

{#if app !== undefined && creating !== undefined}
	{@const ready = app}
	{@const next = creating}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			void add(ready, next);
		}}
	>
		<p class="hint">{messages.tracking.templateHints[next.basic.key]}</p>
		<TextField
			label={messages.tracking.add.name}
			placeholder={messages.tracking.add.examples[next.basic.key]}
			bind:value={next.name}
		/>
		<div class="goal">
			<GoalInput editor={next.goal} {units} />
		</div>
		{#if next.problem !== undefined}
			<p class="problem" role="alert">{next.problem}</p>
		{/if}
		<div class="actions">
			<Button type="submit">{messages.tracking.add.create}</Button>
		</div>
	</form>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	.hint {
		margin-bottom: var(--space-6);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
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
		margin-top: var(--space-8);
	}
</style>
