<script lang="ts">
	import ActionButton from '#lib/design/ActionButton.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import type { SessionId } from '#lib/tracking/domain/ids.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import type { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { groupSets } from '#lib/tracking/ui/workout-sets.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open } from '../open.ts';

	/** Props for a workout tracker's page: start or resume, past workouts, and the exercises. */
	interface Props {
		screen: TrackerScreen;
		tracker: Tracker;
		today: LocalDate;
	}

	const { screen, tracker, today }: Props = $props();
	const id = $props.id();

	async function start(): Promise<void> {
		const session = await screen.startSession();
		if (session !== undefined) await open(AppRoute.workout, { tracker: tracker.id });
	}

	function summaryOf(sessionId: SessionId): string {
		const sets = screen.entries.filter((entry) => entry.sessionId === sessionId);
		return messages.tracking.workout.summary(groupSets(sets).length, sets.length);
	}
</script>

<ActionButton
	label={screen.sessions.active === undefined
		? messages.tracking.workout.start
		: messages.tracking.workout.resume}
	icon="train"
	onclick={start}
/>

<div class="library">
	<NavRow
		label={messages.tracking.library.exercises}
		value={String(screen.subjects.length)}
		onclick={() => open(AppRoute.library, { tracker: tracker.id })}
	/>
</div>

<SectionTitle title={messages.tracking.workout.past} {id} />
{#if screen.sessions.finished.length === 0}
	<p class="empty">{messages.tracking.workout.noneYet}</p>
{:else}
	<ul aria-labelledby={id}>
		{#each screen.sessions.finished as session (session.id)}
			<li>
				<NavRow
					label={formatDate(session.date, today)}
					value={summaryOf(session.id)}
					onclick={() => open(AppRoute.session, { tracker: tracker.id, session: session.id })}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.library {
		margin-top: var(--space-6);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
