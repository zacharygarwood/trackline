<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import ProgressRow from '#lib/design/ProgressRow.svelte';
	import ResumeBar from '#lib/design/ResumeBar.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { HomeScreen } from '#lib/tracking/ui/home-screen.svelte.ts';
	import { homeLine } from '#lib/tracking/ui/home-line.ts';
	import { formatClock } from '#lib/ui/format.ts';
	import { Ticker } from '#lib/ui/ticker.svelte.ts';
	import { getToaster, reloadOnUndo } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from './app-route.constants.ts';
	import { open } from './open.ts';

	const MILLISECONDS_PER_SECOND = 1000;
	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let home: HomeScreen | undefined = $state();
	let ticker: Ticker | undefined = $state();
	let today: LocalDate | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new HomeScreen(app.tracking.listHome);
		await next.load(preferences.weekStart);
		today = app.clock.today();
		ticker = new Ticker(app.clock);
		home = next;
	});

	reloadOnUndo(getToaster(), () => home?.load(preferences.weekStart));

	$effect(() => ticker?.start());
</script>

{#if home?.rows !== undefined && today !== undefined}
	{@const active = home.active}
	{#if active?.active !== undefined && ticker !== undefined}
		{@const session = active.active}
		<div class="resume">
			<ResumeBar
				name={active.tracker.name}
				elapsed={formatClock((ticker.now - session.startedAt) / MILLISECONDS_PER_SECOND)}
				href={resolve(AppRoute.workout)}
				onclick={(event: MouseEvent) => {
					event.preventDefault();
					void open(AppRoute.workout, { tracker: active.tracker.id });
				}}
			/>
		</div>
	{/if}

	<ul class="trackers">
		{#each home.rows as row (row.tracker.id)}
			{@const line = homeLine(row, units)}
			<li>
				<ProgressRow
					label={row.tracker.name}
					value={line.value}
					detail={line.detail}
					fraction={line.fraction}
					onclick={() => open(AppRoute.tracker, { tracker: row.tracker.id })}
				/>
			</li>
		{/each}
	</ul>
	{#if home.rows.length === 0}
		<p class="empty">{messages.tracking.home.empty}</p>
	{/if}
{/if}

<style>
	.resume {
		margin-bottom: var(--space-5);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
