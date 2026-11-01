<script lang="ts">
	import BigNumber from '#lib/design/BigNumber.svelte';
	import { LETTERED_WEEKDAYS } from '#lib/design/heatmap.constants.ts';
	import WorkoutHeatmap from '#lib/design/WorkoutHeatmap.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { startOfWeek } from '#lib/shared/week.ts';
	import { WeekStart } from '#lib/shared/week-start.constants.ts';
	import { formatMonth, formatWeekdayLetter } from '#lib/ui/format.ts';

	/** Props for the workout days heatmap on Stats. */
	interface Props {
		stats: StatsScreen;
	}

	const { stats: ready }: Props = $props();
	const DAYS_PER_WEEK = 7;
	/** The heatmap shows at most a year, like a contribution graph. */
	const MAX_WEEKS = 52;
	const preferences = getPreferences();

	const letters = $derived.by(() => {
		const start = startOfWeek(ready.today, preferences.weekStart);
		return Array.from({ length: DAYS_PER_WEEK }, (_, row) =>
			LETTERED_WEEKDAYS.includes(daysAfterMonday(start.addDays(row)))
				? formatWeekdayLetter(start.addDays(row))
				: ''
		);
	});

	/** How many days after Monday a date falls, 0 to 6. */
	function daysAfterMonday(date: LocalDate): number {
		return date.toEpochDay() - startOfWeek(date, WeekStart.monday).toEpochDay();
	}
</script>

<div class="days">
	<BigNumber value={String(ready.workoutDayCount)} suffix={messages.trends.workoutDays} />
	<WorkoutHeatmap
		today={ready.today}
		weeks={Math.min(ready.weeks, MAX_WEEKS)}
		weekStart={preferences.weekStart}
		minutesOf={ready.minutesOf}
		monthLabel={formatMonth}
		weekdayLetters={letters}
		summary={messages.trends.heatmap(
			ready.workoutDayCount,
			messages.trends.rangeWords[ready.range]
		)}
	/>
</div>

<style>
	.days {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
	}
</style>
