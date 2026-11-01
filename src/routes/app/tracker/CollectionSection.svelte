<script lang="ts">
	import ActionButton from '#lib/design/ActionButton.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import type { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open } from '../open.ts';

	/** Props for a collection's page, like plants: add one, then one row per thing. */
	interface Props {
		screen: TrackerScreen;
		tracker: Tracker;
		today: LocalDate;
	}

	const { screen, tracker, today }: Props = $props();
	const id = $props.id();
</script>

<ActionButton
	label={messages.tracking.library.newThing}
	icon="plus"
	onclick={() => open(AppRoute.newSubject, { tracker: tracker.id })}
/>

<SectionTitle title={tracker.name} {id} />
{#if screen.subjects.length === 0}
	<p class="empty">{messages.tracking.library.emptyThings}</p>
{:else}
	<ul aria-labelledby={id}>
		{#each screen.subjects as subject (subject.id)}
			{@const latest = screen.latestAbout(subject)}
			<li>
				<NavRow
					label={subject.name}
					value={latest === undefined
						? messages.tracking.library.never
						: messages.tracking.library.lastLogged(formatDate(latest.date, today))}
					onclick={() => open(AppRoute.subject, { tracker: tracker.id, subject: subject.id })}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
