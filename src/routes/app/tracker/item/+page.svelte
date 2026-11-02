<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import ActionButton from '#lib/design/ActionButton.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import type { Subject } from '#lib/tracking/domain/subject.ts';
	import { FieldType, TrackerKind } from '#lib/tracking/domain/tracking.constants.ts';
	import { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, open, replace } from '../../open.ts';
	import EntryHistory from '../EntryHistory.svelte';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let screen: TrackerScreen | undefined = $state();
	let subject: Subject | undefined = $state();
	let today: LocalDate | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrackerScreen(app.tracking, app.clock, preferences.weekStart);
		const found =
			(await next.load(page.state.tracker)) &&
			next.subjects.find((candidate) => candidate.id === page.state.subject);
		if (found === false || found === undefined) {
			await replace(AppRoute.today);
			return;
		}
		today = app.clock.today();
		subject = found;
		screen = next;
	});

	async function check(ready: TrackerScreen, thing: Subject): Promise<void> {
		const entry = await ready.check(thing);
		if (entry === undefined) return;
		toaster.show(messages.tracking.page.logged(thing.name), async () => {
			await ready.remove(entry);
		});
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={subject?.name ?? ''}
	onback={back}
/>

{#if screen?.tracker !== undefined && subject !== undefined && today !== undefined}
	{@const ready = screen}
	{@const tracker = screen.tracker}
	{@const thing = subject}
	{@const checkField = tracker.fields.find((field) => field.type === FieldType.check)}
	<div class="actions">
		{#if tracker.kind === TrackerKind.food}
			<ActionButton
				label={messages.tracking.food.add}
				icon="plus"
				onclick={() => open(AppRoute.portion, { tracker: tracker.id, subject: thing.id })}
			/>
		{:else if tracker.kind === TrackerKind.collection}
			{#if checkField !== undefined}
				{#if ready.checkedToday(thing)}
					<p class="done">{messages.tracking.library.wateredToday}</p>
				{:else}
					<ActionButton label={checkField.label} icon="check" onclick={() => check(ready, thing)} />
				{/if}
			{/if}
			<ActionButton
				label={messages.tracking.page.log}
				icon="plus"
				onclick={() => open(AppRoute.log, { tracker: tracker.id, subject: thing.id })}
			/>
		{/if}
	</div>

	<EntryHistory {tracker} entries={ready.entriesAbout(thing)} {units} {today} />

	<div class="edit">
		<NavRow
			label={messages.tracking.page.edit}
			onclick={() =>
				open(AppRoute.newSubject, {
					tracker: tracker.id,
					subject: thing.id,
					recipe: thing.recipe !== undefined
				})}
		/>
	</div>
{/if}

<style>
	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.done {
		display: flex;
		align-items: center;
		height: var(--button-height);
		color: var(--color-accent);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}

	.edit {
		margin-top: var(--space-9);
	}
</style>
