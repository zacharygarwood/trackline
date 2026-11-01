<script lang="ts">
	import NavRow from '#lib/design/NavRow.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import type { Entry } from '#lib/tracking/domain/entry.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import type { DisplayUnits } from '#lib/tracking/ui/display-units.ts';
	import { entrySummary } from '#lib/tracking/ui/value-format.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open } from '../open.ts';

	/** Props for a tracker's history: one row per entry, newest first, each opening its page. */
	interface Props {
		tracker: Tracker;
		entries: readonly Entry[];
		units: DisplayUnits;
		today: LocalDate;
		/** Names each entry, such as the food eaten, before its values. */
		nameOf?: (entry: Entry) => string | undefined;
		title?: string;
	}

	const {
		tracker,
		entries,
		units,
		today,
		nameOf,
		title = messages.tracking.page.history
	}: Props = $props();
	const id = $props.id();
</script>

<SectionTitle {title} {id} />
{#if entries.length === 0}
	<p class="empty">{messages.tracking.page.nothingLogged}</p>
{:else}
	<ul aria-labelledby={id}>
		{#each entries as entry (entry.id)}
			<li>
				<NavRow
					label={nameOf?.(entry) ?? formatDate(entry.date, today)}
					value={entrySummary(tracker, entry.values, units)}
					onclick={() => open(AppRoute.entry, { tracker: tracker.id, entry: entry.id })}
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
