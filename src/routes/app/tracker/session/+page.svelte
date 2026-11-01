<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Row from '#lib/design/Row.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { SessionState } from '#lib/tracking/domain/tracking.constants.ts';
	import type { FinishedSession } from '#lib/tracking/domain/session.ts';
	import { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { entrySummary } from '#lib/tracking/ui/value-format.ts';
	import { groupSets } from '#lib/tracking/ui/workout-sets.ts';
	import { formatClock, formatShortDate } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, replace } from '../../open.ts';

	const MILLISECONDS_PER_SECOND = 1000;
	const preferences = getPreferences();
	const toaster = getToaster();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let screen: TrackerScreen | undefined = $state();
	let session: FinishedSession | undefined = $state();
	let discard: ((id: FinishedSession['id']) => Promise<void>) | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new TrackerScreen(app.tracking, app.clock, preferences.weekStart);
		const found =
			(await next.load(page.state.tracker)) &&
			next.sessions.finished.find((candidate) => candidate.id === page.state.session);
		if (found === false || found?.state !== SessionState.finished) {
			await replace(AppRoute.today);
			return;
		}
		discard = (id) => app.tracking.discardSession.execute({ id });
		session = found;
		screen = next;
	});

	async function remove(id: FinishedSession['id']): Promise<void> {
		await discard?.(id);
		toaster.show(messages.tracking.workout.workoutDeleted);
		back();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={session === undefined ? '' : formatShortDate(session.date)}
	onback={back}
/>

{#if screen?.tracker !== undefined && session !== undefined}
	{@const tracker = screen.tracker}
	{@const done = session}
	{@const sets = screen.entries.filter((entry) => entry.sessionId === done.id)}
	<p class="duration">
		{messages.tracking.workout.duration(
			formatClock((done.finishedAt - done.startedAt) / MILLISECONDS_PER_SECOND)
		)}
	</p>
	{#each groupSets(sets) as group (group.subjectId)}
		{@const exercise = screen.subjects.find((subject) => subject.id === group.subjectId)}
		<SectionTitle title={exercise?.name ?? ''} />
		<ul>
			{#each group.sets as set, index (set.id)}
				<li>
					<Row
						label={messages.tracking.workout.set(index + 1)}
						value={entrySummary(tracker, set.values, units)}
					/>
				</li>
			{/each}
		</ul>
	{/each}

	<div class="delete">
		<Button variant={ButtonVariant.quiet} onclick={() => remove(done.id)}
			>{messages.tracking.workout.deleteWorkout}</Button
		>
	</div>
{/if}

<style>
	.duration {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.delete {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-9);
	}
</style>
